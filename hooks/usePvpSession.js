
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
import {
  fresh,
  reducer,
} from "../components/pvp/battleReducer";

import { MAX_HP } from "../components/pvp/battleConstants";

const createBattleId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const DEFAULT_STATS = {
  power: 0,
  hp: MAX_HP,
};

const normalizeStats = (stats) => {
  const hp = Number(stats?.hp);

  return {
    power: Math.max(0, Number(stats?.power) || 0),
    hp: hp > 0 ? hp : MAX_HP,
  };
};

export function usePvpSession({ onEnergyConsumed } = {}) {
  const [phase, setPhase] = useState("lobby");
  const [status, setStatus] = useState("");

  const [opponentAvatarId, setOpponentAvatarId] = useState(
    DEFAULT_WIZARD_AVATAR
  );

  const [opponentUsername, setOpponentUsername] = useState("Opponent");

  const [myStats, setMyStats] = useState(DEFAULT_STATS);
  const [opponentStats, setOpponentStats] = useState(DEFAULT_STATS);

  const myStatsRef = useRef(DEFAULT_STATS);
  const opponentStatsRef = useRef(DEFAULT_STATS);

  const [s, dispatch] = useReducer(reducer, fresh(true));

  const relay = useRef(null);
  const joining = useRef(false);
  const surrendering = useRef(false);
  const joinAttempt = useRef(0);

  const battleIdRef = useRef(createBattleId());
  const recordedBattleIdRef = useRef(null);


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


  const send = useCallback((move) => {
    relay.current?.send(move).catch((error) => {
      console.error("Unable to send PvP move:", error);

      setStatus(`Unable to send move: ${error.message}`);
    });
  }, []);


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

      dispatch({
        t: "reset",
        first: true,
        myPower: myStatsRef.current.power,
        opponentPower: opponentStatsRef.current.power,
        myHP: myStatsRef.current.hp,
        opponentHP: opponentStatsRef.current.hp,
      });

      setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
      setOpponentUsername("Opponent");

      setOpponentStats(DEFAULT_STATS);
      opponentStatsRef.current = DEFAULT_STATS;

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

    setOpponentStats(DEFAULT_STATS);
    opponentStatsRef.current = DEFAULT_STATS;

    setPhase("wait");

    try {
      const student = await getStudentFromFirebase();

      const username = String(student.username || "").trim();

      if (!username) {
        throw new Error("Your account is missing a username.");
      }


      const playerAvatarId = getWizardAvatarId(
        student.equippedSkin
      );

   
      const playerStats = normalizeStats({
        power: student.power,
        hp: student.hp,
      });

      setMyStats(playerStats);
      myStatsRef.current = playerStats;

      const currentRelay = await connectToRoom(room, {
        userId: student.uid,
        avatarId: playerAvatarId,
        username,


        stats: playerStats,


        onOpponentAvatar: (avatarId) => {
          setOpponentAvatarId(getWizardAvatarId(avatarId));
        },

        onOpponentUsername: setOpponentUsername,

        onOpponentStats: (stats) => {
          const normalized = normalizeStats(stats);

          setOpponentStats(normalized);
          opponentStatsRef.current = normalized;
        },

  
        onStart: ({
          matchId,
          first,
          avatarId,
          username: rivalUsername,
          opponentStats: rivalStats,
        }) => {
          battleIdRef.current = matchId || createBattleId();

          const enemyStats = normalizeStats(rivalStats);

          setOpponentAvatarId(getWizardAvatarId(avatarId));
          setOpponentUsername(rivalUsername || "Opponent");

          setOpponentStats(enemyStats);
          opponentStatsRef.current = enemyStats;

          dispatch({
            t: "reset",
            first,
            myPower: playerStats.power,
            opponentPower: enemyStats.power,
            myHP: playerStats.hp,
            opponentHP: enemyStats.hp,
          });

          setStatus("");
          setPhase("duel");
        },

        onEnergyConsumed,

        onStartError: (error) => {
          const insufficientEnergy =
            error?.details?.reason === "INSUFFICIENT_ENERGY" ||
            error?.customData?.details?.reason === "INSUFFICIENT_ENERGY";
          setPhase("lobby");
          setStatus(
            insufficientEnergy
              ? "You need at least 1 Energy to start a duel. Wait for Energy to regenerate and try again."
              : error?.message || "The duel could not start. Please try again."
          );
        },

        onWait: ({ reconnecting }) => {
          setPhase("wait");

          setStatus(
            reconnecting
              ? "Your rival left. Waiting for another wizard…"
              : "Your rival left the duel."
          );
        },


        onSurrender: ({
          username: rivalUsername,
          acknowledge,
        }) => {
          recordPvpResult("won", rivalUsername || "Opponent");

          relay.current = null;

          dispatch({
            t: "reset",
            first: true,
            myPower: playerStats.power,
            opponentPower: 0,
            myHP: playerStats.hp,
            opponentHP: DEFAULT_STATS.hp,
          });

          setOpponentAvatarId(DEFAULT_WIZARD_AVATAR);
          setOpponentUsername("Opponent");

          setOpponentStats(DEFAULT_STATS);
          opponentStatsRef.current = DEFAULT_STATS;

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
            relay.current?.acceptRematch(move.id);
          }
        },

        onError: (error) => {
          console.error("Firebase PvP relay error:", error);

          setStatus(`Firebase connection failed: ${error.message}`);

          setPhase("lobby");

          const failedRelay = relay.current;
          relay.current = null;

          failedRelay?.leave().catch((leaveError) => {
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
  }, [recordPvpResult, onEnergyConsumed]);


  const rematch = useCallback(() => {
    relay.current?.requestRematch().catch((error) => {
      setStatus(`Unable to start rematch: ${error.message}`);
    });
  }, []);

  return {
    phase,
    status,
    setStatus,

    opponentAvatarId,
    opponentUsername,

    myStats,
    opponentStats,

    s,
    dispatch,
    join,
    send,
    leave,
    surrender,
    rematch,
  };
}
