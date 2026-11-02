import {
  doc,
  getDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";
import { updateStudentCache } from "./studentCacheService";

const MAX_BATTLE_HISTORY = 10;

const requireStudentUid = (uid) => {
  const studentUid = uid || auth.currentUser?.uid;

  if (!studentUid) {
    throw new Error("No logged in student.");
  }

  return studentUid;
};

const getNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
};

const getBattleStats = (studentData = {}) => {
  const wins = getNumber(studentData.battleWins);
  const losses = getNumber(studentData.battleLosses);

  const totalBattles = wins + losses;

  return {
    wins,
    losses,
    totalBattles,
    winRate: calculateWinRate(wins, totalBattles),
  };
};

export const calculateWinRate = (wins, totalBattles) => {
  const validWins = getNumber(wins);
  const validBattles = getNumber(totalBattles);

  if (validBattles === 0) {
    return 0;
  }

  return Math.round((validWins / validBattles) * 100);
};

const getStudentBattleData = async (uid) => {
  const studentUid = requireStudentUid(uid);
  const studentRef = doc(db, "users", studentUid);
  const studentSnapshot = await getDoc(studentRef);

  if (!studentSnapshot.exists()) {
    throw new Error("Student data not found.");
  }

  return {
    uid: studentUid,
    studentData: studentSnapshot.data(),
  };
};

export const getBattleStatistics = async (uid) => {
  const { studentData } = await getStudentBattleData(uid);
  return getBattleStats(studentData);
};

export const getBattleHistory = async (uid) => {
  const { studentData } = await getStudentBattleData(uid);
  const history = Array.isArray(studentData.battleHistory)
    ? studentData.battleHistory
    : [];

  return [...history]
    .filter((entry) => entry && (entry.result === "won" || entry.result === "lost"))
    .sort((first, second) => {
      const firstTime = first.timestamp?.toMillis?.() ??
        new Date(first.timestamp || 0).getTime();
      const secondTime = second.timestamp?.toMillis?.() ??
        new Date(second.timestamp || 0).getTime();

      return secondTime - firstTime;
    });
};

export const recordBattleResult = async ({
  result,
  enemy = "Monster",
  battleType = "dungeon",
  battleId,
}) => {
  if (result !== "won" && result !== "lost") {
    throw new Error("Battle result must be won or lost.");
  }

  const uid = requireStudentUid();
  const studentRef = doc(db, "users", uid);
  const entryId =
    battleId ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const timestamp = Timestamp.now();
  const entry = {
    id: entryId,
    result,
    enemy: String(enemy || "Monster"),
    battleType: battleType === "pvp" ? "pvp" : "dungeon",
    timestamp,
  };

const updatedStats = await runTransaction(
  db,
  async (transaction) => {

    const studentSnapshot =
      await transaction.get(studentRef);

    if (!studentSnapshot.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData =
      studentSnapshot.data();

    const currentHistory = Array.isArray(
      studentData.battleHistory
    )
      ? studentData.battleHistory
      : [];

    if (
      currentHistory.some(
        (historyEntry) =>
          historyEntry?.id === entry.id
      )
    ) {
      return {
        ...getBattleStats(studentData),
        battleHistory: currentHistory,
      };
    }

    const currentWins = getNumber(
      studentData.battleWins
    );

    const currentLosses = getNumber(
      studentData.battleLosses
    );

    const battleWins =
      result === "won"
        ? currentWins + 1
        : currentWins;

    const battleLosses =
      result === "lost"
        ? currentLosses + 1
        : currentLosses;

    const totalBattles =
      battleWins + battleLosses;

    const winRate = calculateWinRate(
      battleWins,
      totalBattles
    );

    const battleHistory = [
      entry,
      ...currentHistory,
    ].slice(0, MAX_BATTLE_HISTORY);

    transaction.update(studentRef, {
      battleWins,
      battleLosses,
      winRate,
      battleHistory,
      updatedAt: Timestamp.now(),
    });

    return {
      wins: battleWins,
      losses: battleLosses,
      totalBattles,
      winRate,
      battleHistory,
    };
  }
);

  await updateStudentCache(uid, updatedStats);

  return updatedStats;
};
