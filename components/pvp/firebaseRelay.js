import {
  onChildAdded,
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
} from "firebase/database";

import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatarId,
} from "../../constants/wizardAvatars";

import { rtdb } from "../../services/firebaseConfig";

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

  const sessionMovesRef = (id) => ref(rtdb, `${MOVES_PATH}/${roomKey}/${id}`);

  const playerId = createId();
  const avatarId = getWizardAvatarId(callbacks.avatarId);
  const username = String(callbacks.username || "").trim();

  // The player's Firestore profile stats.
  const playerStats = normalizeStats(callbacks.stats);

  if (!username) {
    throw new Error("Your account is missing a username.");
  }

  let slot;
  let sessionId;
  let joinError = null;

  const joinResult = await runTransaction(roomRef, (current) => {
    joinError = null;

    const data = current || {};
    const players = data.players || {};

    slot = PLAYER_SLOTS.find((playerSlot) => !players[playerSlot]);

    if (!slot) {
      joinError = new Error("That room already has two wizards.");
      joinError.code = "ROOM_FULL";
      return;
    }

    const playerCount = Object.keys(players).length;

    const startNewSession =
      !current || playerCount === 0 || (data.paired && playerCount === 1);

    sessionId = startNewSession ? createId() : data.sessionId;

    const nextPlayers = {
      ...players,
      [slot]: {
        id: playerId,
        username,
        avatarId,

        // Save profile stats with this player's room entry.
        stats: playerStats,
      },
    };

    return {
      sessionId,
      players: nextPlayers,
      paired: Object.keys(nextPlayers).length === 2,
      updatedAt: serverTimestamp(),
    };
  });

  if (joinError) {
    throw joinError;
  }

  if (!joinResult.committed) {
    throw new Error("Unable to join the room. Please try again.");
  }

  const slotRef = ref(rtdb, `${ROOMS_PATH}/${roomKey}/players/${slot}`);

  let closed = false;
  let leaving = false;
  let started = false;

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
    if (closed || leaving || surrenderReceived) {
      return;
    }

    closed = true;

    stopListeners();

    callbacks.onError?.(asError(reason));
  };

  connectedUnsubscribe = onValue(
    ref(rtdb, ".info/connected"),
    (snapshot) => {
      if (closed || leaving || surrenderReceived || snapshot.val() !== true) {
        return;
      }

      onDisconnect(slotRef).remove().catch(reportError);
    },
    reportError,
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
      reportError,
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
          console.warn("PvP move cleanup warning:", error);
        });
      }
    } catch (error) {
      console.warn("PvP surrender acknowledgement warning:", error);
    }
  };

  subscribeToMoves(sessionId);

  roomUnsubscribe = onValue(
    roomRef,
    (snapshot) => {
      if (closed || leaving || surrenderReceived) {
        return;
      }

      if (!snapshot.exists()) {
        if (closed || leaving || surrenderReceived) {
          return;
        }

        reportError(new Error("You were disconnected from the room."));

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

            acknowledge: () => acknowledgeSurrender(surrender.eventId),
          });

          return;
        }
      }

      // ---------- verify room membership ----------

      if (latestPlayers[slot]?.id !== playerId) {
        reportError(new Error("You were disconnected from the room."));

        return;
      }

      // ---------- detect new battle session ----------

      if (nextSessionId && nextSessionId !== activeSessionId) {
        activeSessionId = nextSessionId;
        started = false;

        subscribeToMoves(activeSessionId);

        callbacks.onWait?.({
          reconnecting: true,
        });
      }

      // ---------- opponent information ----------

      const rivalSlot = PLAYER_SLOTS.find((playerSlot) => playerSlot !== slot);

      const rival = latestPlayers[rivalSlot];

      const rivalActive = Boolean(rival);

      const rivalAvatarId = getWizardAvatarId(
        rival?.avatarId || DEFAULT_WIZARD_AVATAR,
      );

      const rivalUsername =
        typeof rival?.username === "string" && rival.username.trim()
          ? rival.username.trim()
          : "Opponent";

      // Read the opponent's saved profile stats.
      const rivalStats = normalizeStats(rival?.stats);

      callbacks.onOpponentAvatar?.(rivalAvatarId);
      callbacks.onOpponentUsername?.(rivalUsername);
      callbacks.onOpponentStats?.(rivalStats);

      // ---------- battle starts ----------

      if (rivalActive && !started) {
        started = true;

        callbacks.onStart?.({
          first: slot === "player1",
          avatarId: rivalAvatarId,
          username: rivalUsername,

          // Pass opponent stats when the duel starts.
          opponentStats: rivalStats,
        });
      } else if (!rivalActive && started) {
        started = false;

        callbacks.onWait?.({
          reconnecting: false,
        });
      }
    },
    reportError,
  );

  // ---------- send move ----------

  const send = async (move) => {
    if (closed || leaving || surrenderReceived) {
      throw new Error("You are no longer connected to this room.");
    }

    const rematchTypes = [
      "rematch-request",
      "rematch-response",
      "rematch-start",
    ];

    if (!["play", "end", "rematch", ...rematchTypes].includes(move?.type)) {
      throw new Error("Unsupported PvP move.");
    }

    if (
      rematchTypes.includes(move.type) &&
      typeof move.requestId !== "string"
    ) {
      throw new Error("A rematch request ID is required.");
    }

    if (
      move.type === "rematch-response" &&
      typeof move.accepted !== "boolean"
    ) {
      throw new Error("A rematch response must include a decision.");
    }

    await push(sessionMovesRef(activeSessionId), {
      type: move.type,
      ...(move.id ? { id: move.id } : {}),
      ...(move.requestId ? { requestId: move.requestId } : {}),
      ...(typeof move.accepted === "boolean"
        ? { accepted: move.accepted }
        : {}),
      playerId,
      createdAt: serverTimestamp(),
    });
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
        console.error("Unable to clear PvP moves:", error);
      });
    }
  };

  // ---------- surrender ----------

  const surrender = async () => {
    if (closed || leaving) {
      throw new Error("You are no longer connected to this room.");
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
          failure = "You are no longer a member of this battle room.";

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
        throw new Error("The battle room is no longer available.");
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
      await remove(sessionMovesRef(surrenderedSessionId));

      return true;
    } catch (error) {
      console.warn("Unable to clear surrendered PvP battle data:", error);

      return false;
    }
  };

  return {
    send,
    leave,
    surrender,
  };
}
