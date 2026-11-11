import {
  onChildAdded,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  update,
} from "firebase/database";

import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatarId,
} from "../../constants/wizardAvatars";

import { rtdb } from "../../services/firebaseConfig";
import {
  requestPvpRematch,
  startPvpMatch,
} from "../../services/pvpEnergyService";

const ROOMS_PATH = "pvpRooms";
const MOVES_PATH = "pvpMoves";

const PLAYER_SLOTS = ["player1", "player2"];

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const normalizeRoom = (room) =>
  room.trim().replace(/\s+/g, " ").toLocaleLowerCase();

const toRoomKey = (room) =>
  encodeURIComponent(normalizeRoom(room)).replace(/\./g, "%2E");

const asError = (reason) =>
  reason instanceof Error ? reason : new Error(String(reason));

// Normalize player stats before saving or passing them to the opponent.
const normalizeStats = (stats) => ({
  power: Math.max(0, Number(stats?.power) || 0),
  hp: Math.max(0, Number(stats?.hp) || 0),
});

export async function connectToRoom(room, callbacks) {
  const normalizedRoom = normalizeRoom(room);

  if (!normalizedRoom) {
    throw new Error("Enter the words your rival will use to join.");
  }

  if (normalizedRoom.length > 80) {
    throw new Error("Room words must be 80 characters or fewer.");
  }

  const roomKey = toRoomKey(normalizedRoom);

  const roomRef = ref(rtdb, `${ROOMS_PATH}/${roomKey}`);
  const roomMovesRef = ref(rtdb, `${MOVES_PATH}/${roomKey}`);

  const sessionMovesRef = (id) =>
    ref(rtdb, `${MOVES_PATH}/${roomKey}/${id}`);

  const playerId = createId();
  const avatarId = getWizardAvatarId(callbacks.avatarId);
  const username = String(callbacks.username || "").trim();
  const userId = String(callbacks.userId || "").trim();

  // The player's Firestore profile stats.
  const playerStats = normalizeStats(callbacks.stats);

  if (!username || !userId) {
    throw new Error("Your account is missing PvP profile information.");
  }

  let slot;
  let sessionId;
  let joinError = null;

  const joinResult = await runTransaction(roomRef, (current) => {
    joinError = null;

    const data = current || {};
    const players = data.players || {};
    const disconnectedSlots = PLAYER_SLOTS.filter(
      (playerSlot) => players[playerSlot] && players[playerSlot].connected === false
    );
    const resumeSlot = disconnectedSlots.find(
      (playerSlot) => players[playerSlot].userId === userId
    );
    const resumingSession = Boolean(resumeSlot);
    const activePlayers = Object.fromEntries(
      Object.entries(players).filter(([, player]) => player?.connected !== false)
    );
    const playersForJoin = resumingSession ? players : activePlayers;

    slot = resumeSlot || disconnectedSlots[0] || PLAYER_SLOTS.find(
      (playerSlot) => !playersForJoin[playerSlot]
    );

    if (!slot) {
      joinError = new Error("That room already has two wizards.");
      joinError.code = "ROOM_FULL";
      return;
    }

    const playerCount = Object.values(activePlayers).length;

    const startNewSession =
      !current ||
      (!resumingSession && playerCount === 0) ||
      (data.paired && playerCount === 1 && !resumingSession);

    sessionId = resumingSession ? data.sessionId : startNewSession ? createId() : data.sessionId;

    const nextPlayers = {
      ...playersForJoin,
      [slot]: {
        id: playerId,
        userId,
        connected: true,
        username,
        avatarId,

        // Save profile stats with this player's room entry.
        stats: playerStats,
      },
    };

    const nextRoom = {
      sessionId,
      players: nextPlayers,
      paired: Object.values(nextPlayers).filter((player) => player?.connected !== false).length === 2,
      updatedAt: serverTimestamp(),
    };
    if (resumingSession) {
      [
        "startedSessionId",
        "startedAt",
        "startedMatchId",
        "pendingRematchId",
        "pendingRematchSessionId",
      ].forEach((field) => {
        if (data[field] !== undefined) nextRoom[field] = data[field];
      });
    }
    return nextRoom;
  });

  if (joinError) {
    throw joinError;
  }

  if (!joinResult.committed) {
    throw new Error("Unable to join the room. Please try again.");
  }

  const slotRef = ref(
    rtdb,
    `${ROOMS_PATH}/${roomKey}/players/${slot}`
  );

  let closed = false;
  let leaving = false;
  let started = false;
  const matchRequestStates = new Map();

  let surrenderReceived = false;

  let activeSessionId = sessionId;
  let latestPlayers = {};

  let roomUnsubscribe = () => {};
  let movesUnsubscribe = () => {};
  let connectedUnsubscribe = () => {};

  let membershipRemoved = false;
  let lastSurrenderEventId = null;

  const stopListeners = () => {
    roomUnsubscribe();
    movesUnsubscribe();
    connectedUnsubscribe();

    onDisconnect(slotRef)
      .cancel()
      .catch(() => {});
  };

  const reportError = (reason) => {
    if (
      closed ||
      leaving ||
      surrenderReceived
    ) {
      return;
    }

    closed = true;

    stopListeners();

    callbacks.onError?.(asError(reason));
  };

  const startMatch = (matchId, rival, retryAfterServerMarker = false) => {
    const requestState = matchRequestStates.get(matchId);
    if (requestState === "pending" || requestState === "started") return;
    if (requestState === "waiting" && !retryAfterServerMarker) return;
    matchRequestStates.set(matchId, "pending");

    startPvpMatch({ roomKey, sessionId: activeSessionId, matchId })
      .then((result) => {
        if (!result.started) {
          matchRequestStates.set(matchId, "waiting");
          return;
        }
        matchRequestStates.set(matchId, "started");
        started = true;
        callbacks.onEnergyConsumed?.(result);
        callbacks.onStart?.({
          matchId,
          first: slot === "player1",
          avatarId: getWizardAvatarId(rival?.avatarId || DEFAULT_WIZARD_AVATAR),
          username: rival?.username || "Opponent",
          opponentStats: normalizeStats(rival?.stats),
        });
      })
      .catch(async (error) => {
        matchRequestStates.delete(matchId);
        await leave().catch(() => {});
        callbacks.onStartError?.(error);
      });
  };

  connectedUnsubscribe = onValue(
    ref(rtdb, ".info/connected"),
    (snapshot) => {
      if (
        closed ||
        leaving ||
        surrenderReceived ||
        snapshot.val() !== true
      ) {
        return;
      }

      onDisconnect(slotRef)
        .set({
          id: playerId,
          userId,
          username,
          avatarId,
          stats: playerStats,
          connected: false,
          disconnectedAt: serverTimestamp(),
        })
        .then(() => update(slotRef, { connected: true }))
        .catch(reportError);
    },
    reportError
  );

  const subscribeToMoves = (currentSessionId) => {
    movesUnsubscribe();

    movesUnsubscribe = onChildAdded(
      sessionMovesRef(currentSessionId),
      (snapshot) => {
        if (closed || leaving || surrenderReceived) {
          return;
        }

        const move = snapshot.val();

        if (move && move.playerId !== playerId) {
          callbacks.onMove?.(move);
        }
      },
      reportError
    );
  };

  const acknowledgeSurrender = async (eventId) => {
    try {
      let roomEmptied = false;

      await runTransaction(roomRef, (current) => {
        if (!current) {
          roomEmptied = true;
          return null;
        }

        if (current.surrender?.eventId === eventId) {
          roomEmptied = true;
          return null;
        }

        return;
      });

      if (roomEmptied) {
        await remove(roomMovesRef).catch((error) => {
          console.warn(
            "PvP move cleanup warning:",
            error
          );
        });
      }
    } catch (error) {
      console.warn(
        "PvP surrender acknowledgement warning:",
        error
      );
    }
  };

  subscribeToMoves(sessionId);

  roomUnsubscribe = onValue(
    roomRef,
    (snapshot) => {
      if (
        closed ||
        leaving ||
        surrenderReceived
      ) {
        return;
      }

      if (!snapshot.exists()) {
        if (
          closed ||
          leaving ||
          surrenderReceived
        ) {
          return;
        }

        reportError(
          new Error("You were disconnected from the room.")
        );

        return;
      }

      const roomData = snapshot.val() || {};

      const nextSessionId = roomData.sessionId;
      latestPlayers = roomData.players || {};

      const surrender = roomData.surrender;

      // ---------- opponent surrender ----------

      if (
        surrender?.eventId &&
        surrender.sessionId === activeSessionId &&
        surrender.eventId !== lastSurrenderEventId
      ) {
        lastSurrenderEventId = surrender.eventId;

        if (surrender.playerId !== playerId) {
          surrenderReceived = true;
          closed = true;

          stopListeners();

          callbacks.onSurrender?.({
            username: surrender.username,

            acknowledge: () =>
              acknowledgeSurrender(surrender.eventId),
          });

          return;
        }
      }

      // ---------- verify room membership ----------

      if (latestPlayers[slot]?.id !== playerId) {
        reportError(
          new Error("You were disconnected from the room.")
        );

        return;
      }

      // ---------- detect new battle session ----------

      if (
        nextSessionId &&
        nextSessionId !== activeSessionId
      ) {
        activeSessionId = nextSessionId;
        started = false;
        matchRequestStates.clear();

        subscribeToMoves(activeSessionId);

        callbacks.onWait?.({
          reconnecting: true,
        });
      }

      // ---------- opponent information ----------

      const rivalSlot = PLAYER_SLOTS.find(
        (playerSlot) => playerSlot !== slot
      );

      const rival = latestPlayers[rivalSlot];

      const rivalActive = Boolean(rival && rival.connected !== false);

      const rivalAvatarId = getWizardAvatarId(
        rival?.avatarId || DEFAULT_WIZARD_AVATAR
      );

      const rivalUsername =
        typeof rival?.username === "string" &&
        rival.username.trim()
          ? rival.username.trim()
          : "Opponent";

      // Read the opponent's saved profile stats.
      const rivalStats = normalizeStats(rival?.stats);

      callbacks.onOpponentAvatar?.(rivalAvatarId);
      callbacks.onOpponentUsername?.(rivalUsername);
      callbacks.onOpponentStats?.(rivalStats);

      if (rivalActive && roomData.paired === true) {
        const matchToResume = roomData.startedMatchId || activeSessionId;
        startMatch(matchToResume, rival, Boolean(roomData.startedMatchId));
      } else if (!rivalActive && started) {
        started = false;
        matchRequestStates.set(activeSessionId, "waiting");

        callbacks.onWait?.({
          reconnecting: false,
        });
      }
    },
    reportError
  );

  // ---------- send move ----------

  const send = async (move) => {
    if (closed || leaving || surrenderReceived) {
      throw new Error(
        "You are no longer connected to this room."
      );
    }

    if (!["play", "end", "rematch"].includes(move?.type)) {
      throw new Error("Unsupported PvP move.");
    }

    await push(sessionMovesRef(activeSessionId), {
      type: move.type,
      ...(move.id ? { id: move.id } : {}),
      playerId,
      createdAt: serverTimestamp(),
    });
  };

  const requestRematch = async () => {
    if (closed || leaving || surrenderReceived) {
      throw new Error("You are no longer connected to this room.");
    }
    const rematchRequest = await requestPvpRematch({ roomKey, sessionId: activeSessionId });
    const matchId = rematchRequest.matchId;
    await send({ type: "rematch", id: matchId });
    const rivalSlot = PLAYER_SLOTS.find((playerSlot) => playerSlot !== slot);
    startMatch(matchId, latestPlayers[rivalSlot]);
  };

  const acceptRematch = (matchId) => {
    if (!matchId || closed || leaving || surrenderReceived) return;
    const rivalSlot = PLAYER_SLOTS.find((playerSlot) => playerSlot !== slot);
    startMatch(matchId, latestPlayers[rivalSlot]);
  };

  // ---------- leave room ----------

  const leave = async () => {
    leaving = true;

    if (!closed) {
      closed = true;
      stopListeners();
    }

    if (membershipRemoved) return;

    membershipRemoved = true;

    let shouldClearMoves = false;

    await runTransaction(roomRef, (current) => {
      if (!current) {
        return null;
      }

      const players = {
        ...(current.players || {}),
      };

      if (players[slot]?.id !== playerId) {
        return;
      }

      delete players[slot];

      shouldClearMoves = true;

      if (Object.keys(players).length === 0) {
        return null;
      }

      return {
        sessionId: createId(),
        players,
        paired: false,
        updatedAt: serverTimestamp(),
      };
    });

    if (shouldClearMoves) {
      await remove(roomMovesRef).catch((error) => {
        console.error(
          "Unable to clear PvP moves:",
          error
        );
      });
    }
  };

  // ---------- surrender ----------

  const surrender = async () => {
    if (closed || leaving) {
      throw new Error(
        "You are no longer connected to this room."
      );
    }

    leaving = true;

    const eventId = createId();
    const surrenderedSessionId = activeSessionId;

    let roomSeen = false;
    let failure = null;

    try {
      await runTransaction(roomRef, (current) => {
        if (current === null) {
          return null;
        }

        roomSeen = true;
        failure = null;

        if (current.players?.[slot]?.id !== playerId) {
          failure =
            "You are no longer a member of this battle room.";

          return;
        }

        // Preserve players so the opponent can receive surrender.
        return {
          ...current,

          sessionId: createId(),
          paired: false,

          surrender: {
            eventId,
            sessionId: surrenderedSessionId,
            playerId,
            username,
          },

          updatedAt: serverTimestamp(),
        };
      });

      if (!roomSeen) {
        throw new Error(
          "The battle room is no longer available."
        );
      }

      if (failure) {
        throw new Error(failure);
      }
    } catch (error) {
      leaving = false;
      throw error;
    }

    closed = true;

    stopListeners();

    try {
      await remove(
        sessionMovesRef(surrenderedSessionId)
      );

      return true;
    } catch (error) {
      console.warn(
        "Unable to clear surrendered PvP battle data:",
        error
      );

      return false;
    }
  };

  return {
    send,
    requestRematch,
    acceptRematch,
    leave,
    surrender,
  };
}
