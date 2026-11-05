import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatarId,
} from "../../constants/wizardAvatars";
import { db } from "../../services/firebaseConfig";

const ROOM_COLLECTION = "pvpRooms";
const HEARTBEAT_INTERVAL_MS = 10_000;
const PLAYER_TIMEOUT_MS = 30_000;
const PLAYER_SLOTS = ["player1", "player2"];

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const normalizeRoom = (value) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

const getRoomRef = (room) =>
  doc(db, ROOM_COLLECTION, encodeURIComponent(normalizeRoom(room)));

const isPlayerActive = (player, now) =>
  player && now - player.lastSeen < PLAYER_TIMEOUT_MS;

const asError = (reason) =>
  reason instanceof Error ? reason : new Error(String(reason));

export async function connectToRoom(room, callbacks) {
  const normalizedRoom = normalizeRoom(room);
  if (!normalizedRoom) {
    throw new Error("Enter the words your rival will use to join.");
  }
  if (normalizedRoom.length > 80) {
    throw new Error("Room words must be 80 characters or fewer.");
  }

  const roomRef = getRoomRef(normalizedRoom);
  const playerId = createId();
  const avatarId = getWizardAvatarId(callbacks.avatarId);
  const username = String(callbacks.username || "").trim();
  if (!username) {
    throw new Error("Your account is missing a username.");
  }
  let slot;
  let sessionId;

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(roomRef);
    const now = Date.now();
    const roomData = snapshot.exists() ? snapshot.data() : {};
    const currentPlayers = roomData.players || {};
    const activePlayers = {};
    let foundStalePlayer = false;

    for (const playerSlot of PLAYER_SLOTS) {
      const player = currentPlayers[playerSlot];
      if (isPlayerActive(player, now)) {
        activePlayers[playerSlot] = player;
      } else if (player) {
        foundStalePlayer = true;
      }
    }

    slot = PLAYER_SLOTS.find((playerSlot) => !activePlayers[playerSlot]);
    if (!slot) {
      const fullRoomError = new Error("That room already has two wizards.");
      fullRoomError.code = "ROOM_FULL";
      throw fullRoomError;
    }

    const activePlayerCount = Object.keys(activePlayers).length;
    const startNewSession =
      !snapshot.exists() ||
      activePlayerCount === 0 ||
      foundStalePlayer ||
      (roomData.paired && activePlayerCount === 1);
    sessionId = startNewSession ? createId() : roomData.sessionId;
    const nextPlayers = {
      ...activePlayers,
      [slot]: { id: playerId, username, avatarId, lastSeen: now },
    };

    transaction.set(roomRef, {
      sessionId,
      players: nextPlayers,
      paired: Object.keys(nextPlayers).length === 2,
      updatedAt: serverTimestamp(),
    });
  });

  let closed = false;
  let started = false;
  let activeSessionId = sessionId;
  let latestPlayers = {};
  let roomUnsubscribe = () => {};
  let movesUnsubscribe = () => {};
  let heartbeatTimer;
  let membershipRemoved = false;
  let lastSurrenderEventId = null;

  const stopListeners = () => {
    clearInterval(heartbeatTimer);
    roomUnsubscribe();
    movesUnsubscribe();
  };

  const reportError = (reason) => {
    if (closed) return;
    closed = true;
    stopListeners();
    callbacks.onError?.(asError(reason));
  };

  const subscribeToMoves = (currentSessionId) => {
    movesUnsubscribe();
    const movesQuery = query(
      collection(roomRef, "sessions", currentSessionId, "moves"),
      orderBy("createdAt", "asc"),
    );

    movesUnsubscribe = onSnapshot(
      movesQuery,
      (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type !== "added") continue;
          const move = change.doc.data();
          if (move.playerId !== playerId) {
            callbacks.onMove?.(move);
          }
        }
      },
      reportError,
    );
  };

  subscribeToMoves(sessionId);
  roomUnsubscribe = onSnapshot(
    roomRef,
    (snapshot) => {
      if (closed) return;

      const roomData = snapshot.exists() ? snapshot.data() : {};
      const nextSessionId = roomData.sessionId;
      latestPlayers = roomData.players || {};

      const surrender = roomData.surrender;
      if (surrender?.eventId && surrender.eventId !== lastSurrenderEventId) {
        lastSurrenderEventId = surrender.eventId;
        if (surrender.playerId !== playerId) {
          callbacks.onSurrender?.({ username: surrender.username });
          closed = true;
          stopListeners();
          return;
        }
      }

      if (nextSessionId && nextSessionId !== activeSessionId) {
        activeSessionId = nextSessionId;
        started = false;
        subscribeToMoves(activeSessionId);
        callbacks.onWait?.({ reconnecting: true });
      }

      const rivalSlot = PLAYER_SLOTS.find((playerSlot) => playerSlot !== slot);
      const rival = latestPlayers[rivalSlot];
      const rivalActive = isPlayerActive(rival, Date.now());
      const rivalAvatarId = getWizardAvatarId(
        rival?.avatarId || DEFAULT_WIZARD_AVATAR,
      );
      const rivalUsername =
        typeof rival?.username === "string" && rival.username.trim()
          ? rival.username.trim()
          : "Opponent";
      callbacks.onOpponentAvatar?.(rivalAvatarId);
      callbacks.onOpponentUsername?.(rivalUsername);

      if (rivalActive && !started) {
        started = true;
        callbacks.onStart?.({
          first: slot === "player1",
          avatarId: rivalAvatarId,
          username: rivalUsername,
        });
      } else if (!rivalActive && started) {
        started = false;
        callbacks.onWait?.({ reconnecting: false });
      }
    },
    reportError,
  );

  heartbeatTimer = setInterval(() => {
    if (closed) return;

    const rivalSlot = PLAYER_SLOTS.find((playerSlot) => playerSlot !== slot);
    const rival = latestPlayers[rivalSlot];
    if (started && !isPlayerActive(rival, Date.now())) {
      started = false;
      callbacks.onWait?.({ reconnecting: false });
    }

    runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef);
      if (!snapshot.exists() || snapshot.data().players?.[slot]?.id !== playerId) {
        return false;
      }

      transaction.update(roomRef, {
        [`players.${slot}.lastSeen`]: Date.now(),
      });
      return true;
    })
      .then((stillMember) => {
        if (!stillMember) clearInterval(heartbeatTimer);
      })
      .catch(reportError);
  }, HEARTBEAT_INTERVAL_MS);

  const send = async (move) => {
    if (closed) throw new Error("You are no longer connected to this room.");
    if (!["play", "end", "rematch"].includes(move?.type)) {
      throw new Error("Unsupported PvP move.");
    }

    await addDoc(collection(roomRef, "sessions", activeSessionId, "moves"), {
      type: move.type,
      ...(move.id ? { id: move.id } : {}),
      playerId,
      createdAt: Date.now(),
    });
  };

  const leave = async () => {
    if (!closed) {
      closed = true;
      stopListeners();
    }
    if (membershipRemoved) return;
    membershipRemoved = true;

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef);
      if (!snapshot.exists()) return;

      const roomData = snapshot.data();
      const players = { ...(roomData.players || {}) };
      if (players[slot]?.id !== playerId) return;

      delete players[slot];
      if (Object.keys(players).length === 0) {
        transaction.delete(roomRef);
      } else {
        transaction.set(roomRef, {
          sessionId: createId(),
          players,
          paired: false,
          updatedAt: serverTimestamp(),
        });
      }
    });
  };

  const surrender = async () => {
    if (closed) throw new Error("You are no longer connected to this room.");

    const eventId = createId();
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef);
      if (!snapshot.exists()) {
        throw new Error("The battle room is no longer available.");
      }

      const roomData = snapshot.data();
      if (roomData.players?.[slot]?.id !== playerId) {
        throw new Error("You are no longer a member of this battle room.");
      }

      transaction.set(roomRef, {
        sessionId: createId(),
        players: {},
        paired: false,
        surrender: { eventId, playerId, username },
        updatedAt: serverTimestamp(),
      });
    });

    closed = true;
    stopListeners();
  };

  return { send, leave, surrender };
}
