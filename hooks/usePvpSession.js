
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { Alert, BackHandler } from "react-native";

import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatarId,
} from "../constants/wizardAvatars";

import { recordBattleResult } from "../services/battleStatsService";
import { getStudentFromFirebase } from "../services/studentDataService";

import { connectToRoom } from "../components/pvp/firebaseRelay";
import { fresh, reducer } from "../components/pvp/battleReducer";

const createBattleId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function usePvpSession() {
  const [phase, setPhase] = useState("lobby");
  const [status, setStatus] = useState("");

  const [opponentAvatarId, setOpponentAvatarId] = useState(
    DEFAULT_WIZARD_AVATAR
  );

  const [opponentUsername, setOpponentUsername] = useState("Opponent");

  const [s, dispatch] = useReducer(reducer, fresh(true));

  const relay = useRef(null);
  const joining = useRef(false);
  const surrendering = useRef(false);
  const joinAttempt = useRef(0);

  const battleIdRef = useRef(createBattleId());
  const recordedBattleIdRef = useRef(null);

  /* ---------- battle result ---------- */

  const recordPvpResult = useCallback(
    (result, enemy = opponentUsername) => {
      const battleId = battleIdRef.current;

      if (recordedBattleIdRef.current === battleId) return;

      recordedBattleIdRef.current = battleId;

      recordBattleResult({
        result,
        enemy,
        battleType: "pvp",
        battleId,
      }).catch((error) => {
        console.error("Record PvP battle result error:", error);

        Alert.alert(
          "Battle result not saved",
          error?.message || "Your PvP result could not be saved."
        );
      });
    },
    [opponentUsername]
  );

  useEffect(() => {
    if (
      phase === "duel" &&
      (s.me.hp <= 0 || s.opp.hp <= 0)
    ) {
      recordPvpResult(s.me.hp > 0 ? "won" : "lost");
    }
  }, [phase, s.me.hp, s.opp.hp, recordPvpResult]);

  /* ---------- send move ---------- */

  const send = useCallback((move) => {
    relay.current?.send(move).catch((error) => {
      console.error("Unable to send PvP move:", error);

      setStatus(`Unable to send move: ${error.message}`);
    });
  }, []);

  /* ---------- leave room ---------- */

  const leave = useCallback(() => {
    joinAttempt.current += 1;
    joining.current = false;

    const currentRelay = relay.current;
    relay.current = null;

    setPhase("lobby");

    if (currentRelay) {
      currentRelay.leave().catch((error) => {
        console.error("Unable to leave PvP room:", error);

        setStatus(`Unable to leave room: ${error.message}`);
      });
    }
  }, []);

  /* ---------- surrender ---------- */

  const surrender = useCallback(async () => {
    if (surrendering.current) return;

    const currentRelay = relay.current;

    if (!currentRelay) {
      setStatus(
        "Unable to surrender: your room connection is unavailable."
      );
      return;
    }

    surrendering.current = true;

    try {
      const cleanupComplete = await currentRelay.surrender();

      if (phase === "duel") {
        recordPvpResult("lost");
      }

      if (relay.current === currentRelay) {
        relay.current = null;
      }

      joinAttempt.current += 1;
      joining.current = false;

      dispatch({ t: "reset", first: true });

      setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
      setOpponentUsername("Opponent");

      setPhase("lobby");

      setStatus(
        cleanupComplete
          ? "You surrendered. The room is ready for a new battle."
          : "You surrendered, but some battle data could not be cleared."
      );
    } catch (error) {
      console.error("Unable to surrender from PvP room:", error);

      setStatus(`Unable to surrender: ${error.message}`);
    } finally {
      surrendering.current = false;
    }
  }, [phase, recordPvpResult]);

  /* ---------- hardware back button ---------- */

  useEffect(() => {
    if (phase !== "duel") return undefined;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        surrender();
        return true;
      }
    );

    return () => subscription.remove();
  }, [phase, surrender]);

  /* ---------- join room ---------- */

  const join = useCallback(async (room) => {
    if (joining.current) return;

    if (!room.trim()) {
      setStatus("Enter the words your rival will use to join.");
      return;
    }

    joining.current = true;

    const attempt = ++joinAttempt.current;

    setStatus("Preparing arena...");

    setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
    setOpponentUsername("Opponent");

    setPhase("wait");

    try {
      const student = await getStudentFromFirebase();

      const username = String(student.username || "").trim();

      if (!username) {
        throw new Error("Your account is missing a username.");
      }

      const currentRelay = await connectToRoom(room, {
        avatarId: DEFAULT_WIZARD_AVATAR,
        username,

        onOpponentAvatar: setOpponentAvatarId,
        onOpponentUsername: setOpponentUsername,

        /* ---------- battle starts ---------- */

        onStart: ({
          first,
          avatarId,
          username: rivalUsername,
        }) => {
          battleIdRef.current = createBattleId();

          setOpponentAvatarId(getWizardAvatarId(avatarId));
          setOpponentUsername(rivalUsername || "Opponent");

          dispatch({ t: "reset", first });

          setStatus("");
          setPhase("duel");
        },

        /* ---------- opponent waiting ---------- */

        onWait: ({ reconnecting }) => {
          setPhase("wait");

          setStatus(
            reconnecting
              ? "Your rival left. Waiting for another wizard…"
              : "Your rival left the duel."
          );
        },

        /* ---------- opponent surrender ---------- */

        onSurrender: ({
          username: rivalUsername,
          acknowledge,
        }) => {
          recordPvpResult("won", rivalUsername || "Opponent");

          relay.current = null;

          dispatch({ t: "reset", first: true });

          setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
          setOpponentUsername("Opponent");

          setPhase("lobby");

          const message = `${
            rivalUsername || "Your opponent"
          } surrendered. You win!`;

          setStatus(message);

          Alert.alert("Battle ended", message);

          acknowledge().catch((error) => {
            console.error(
              "Unable to clear surrendered PvP room:",
              error
            );
          });
        },

        /* ---------- incoming moves ---------- */

        onMove: (move) => {
          if (move.type === "play") {
            dispatch({
              t: "play",
              who: "opp",
              id: move.id,
            });
          } else if (move.type === "end") {
            dispatch({
              t: "end",
              who: "opp",
            });
          } else if (move.type === "rematch") {
            battleIdRef.current = createBattleId();

            dispatch({
              t: "reset",
              first: true,
            });
          }
        },

        /* ---------- Firebase error ---------- */

        onError: (error) => {
          console.error("Firebase PvP relay error:", error);

          setStatus(`Firebase connection failed: ${error.message}`);

          setPhase("lobby");

          const currentRelay = relay.current;
          relay.current = null;

          currentRelay?.leave().catch((leaveError) => {
            console.error(
              "Unable to leave failed PvP room:",
              leaveError
            );
          });
        },
      });

      if (attempt !== joinAttempt.current) {
        await currentRelay.leave();
        return;
      }

      relay.current = currentRelay;
      setStatus("");
    } catch (error) {
      if (attempt !== joinAttempt.current) return;

      console.error("Unable to join PvP room:", error);

      setPhase("lobby");

      setStatus(
        error.code === "ROOM_FULL"
          ? "That room already has two wizards."
          : `Unable to join room: ${error.message}`
      );
    } finally {
      if (attempt === joinAttempt.current) {
        joining.current = false;
      }
    }
  }, [recordPvpResult]);

  /* ---------- rematch ---------- */

  const rematch = useCallback(() => {
    battleIdRef.current = createBattleId();

    dispatch({
      t: "reset",
      first: false,
    });

    send({ type: "rematch" });
  }, [send]);

  return {
    phase,
    status,
    setStatus,
    opponentAvatarId,
    opponentUsername,
    s,
    dispatch,
    join,
    send,
    leave,
    surrender,
    rematch,
  };
}
