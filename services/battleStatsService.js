import {
  doc,
  getDoc,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";
import { updateStudentCache } from "./studentCacheService";

const MAX_BATTLE_HISTORY = 10;

const STAT_MODES = {
  overall: {
    wins: "overallWins",
    losses: "overallLosses",
    winRate: "overallWinRate",
  },
  pve: {
    wins: "pveWins",
    losses: "pveLosses",
    winRate: "pveWinRate",
  },
  pvp: {
    wins: "pvpWins",
    losses: "pvpLosses",
    winRate: "pvpWinRate",
  },
};

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

export const calculateWinRate = (wins, totalBattles) => {
  const validWins = getNumber(wins);
  const validBattles = getNumber(totalBattles);

  if (validBattles === 0) {
    return 0;
  }

  return Math.round((validWins / validBattles) * 100);
};

const getModeStats = (studentData, mode) => {
  const fields = STAT_MODES[mode];
  const wins = getNumber(
    studentData[fields.wins] ??
      (mode === "overall" ? studentData.battleWins : 0)
  );
  const losses = getNumber(
    studentData[fields.losses] ??
      (mode === "overall" ? studentData.battleLosses : 0)
  );
  const totalBattles = wins + losses;

  return {
    wins,
    losses,
    totalBattles,
    winRate: calculateWinRate(wins, totalBattles),
  };
};

const getAllBattleStats = (studentData = {}) => ({
  overall: getModeStats(studentData, "overall"),
  pve: getModeStats(studentData, "pve"),
  pvp: getModeStats(studentData, "pvp"),
});

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
  return getAllBattleStats(studentData);
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
  const leaderboardRef = doc(db, "leaderboards", uid);
  const entryId =
    battleId ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const timestamp = Timestamp.now();
  const isPvp = battleType === "pvp";
  const normalizedBattleType = isPvp ? "pvp" : "dungeon";
  const entry = {
    id: entryId,
    result,
    enemy: String(enemy || "Monster"),
    battleType: normalizedBattleType,
    timestamp,
  };

  const updatedStats = await runTransaction(db, async (transaction) => {
    const studentSnapshot = await transaction.get(studentRef);

    if (!studentSnapshot.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData = studentSnapshot.data();
    const currentHistory = Array.isArray(studentData.battleHistory)
      ? studentData.battleHistory
      : [];

    if (currentHistory.some((historyEntry) => historyEntry?.id === entry.id)) {
      return {
        ...getAllBattleStats(studentData),
        battleHistory: currentHistory,
      };
    }

    const currentStats = getAllBattleStats(studentData);
    const mode = isPvp ? "pvp" : "pve";
    const modesToUpdate = ["overall", mode];
    const nextStats = { ...currentStats };

    modesToUpdate.forEach((statsMode) => {
      const current = currentStats[statsMode];
      const wins = current.wins + (result === "won" ? 1 : 0);
      const losses = current.losses + (result === "lost" ? 1 : 0);

      nextStats[statsMode] = {
        wins,
        losses,
        totalBattles: wins + losses,
        winRate: calculateWinRate(wins, wins + losses),
      };
    });

    const battleHistory = [entry, ...currentHistory].slice(
      0,
      MAX_BATTLE_HISTORY
    );
    const updates = {
      battleHistory,
      updatedAt: Timestamp.now(),
    };

    Object.entries(STAT_MODES).forEach(([statsMode, fields]) => {
      const stats = nextStats[statsMode];
      updates[fields.wins] = stats.wins;
      updates[fields.losses] = stats.losses;
      updates[fields.winRate] = stats.winRate;
    });

    const username =
      typeof studentData.username === "string" && studentData.username.trim()
        ? studentData.username.trim()
        : "Wizard";
    const gradeValue =
      studentData.profile?.grade ??
      studentData.profile?.gradeLevel ??
      studentData.gradeLevel ??
      studentData.grade;
    const gradeLevel =
      gradeValue === null || gradeValue === undefined
        ? ""
        : String(gradeValue).trim();
    const overall = nextStats.overall;

    transaction.update(studentRef, updates);
    transaction.set(leaderboardRef, {
      username,
      ...(gradeLevel ? { gradeLevel } : {}),
      overallWins: overall.wins,
      overallLosses: overall.losses,
      overallWinRate: overall.winRate,
      pveWins: nextStats.pve.wins,
      pveLosses: nextStats.pve.losses,
      pveWinRate: nextStats.pve.winRate,
      pvpWins: nextStats.pvp.wins,
      pvpLosses: nextStats.pvp.losses,
      pvpWinRate: nextStats.pvp.winRate,
      updatedAt: Timestamp.now(),
    });

    return { ...nextStats, battleHistory };
  });

  await updateStudentCache(uid, updatedStats);

  return updatedStats;
};
