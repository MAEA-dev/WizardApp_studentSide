import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";
import { updateStudentCache } from "./studentCacheService";
import { DUNGEON_STAGES } from "../data/dungeonStages";

export const DUNGEON_STAGE_COUNT = DUNGEON_STAGES.length;

export const DEFAULT_DUNGEON_PROGRESS = {
  highestUnlockedStage: 1,
  completedStages: [],
};

const STAGE_REWARDS = {
  1: { firstClear: { gold: 20, xp: 30 }, replay: { gold: 5, xp: 8 } },
  2: { firstClear: { gold: 30, xp: 45 }, replay: { gold: 8, xp: 12 } },
  3: { firstClear: { gold: 50, xp: 75 }, replay: { gold: 12, xp: 18 } },
};

const getNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const calculateXpProgress = (studentData, addedXp) => {
  let xp = getNumber(studentData.xp);
  let maxXp = Math.max(getNumber(studentData.maxXp, 150), 1);
  let level = getNumber(studentData.level, 1);
  let levelsGained = 0;

  xp += addedXp;
  while (xp >= maxXp) {
    xp -= maxXp;
    level += 1;
    levelsGained += 1;
    maxXp += 50;
  }

  return {
    xp,
    maxXp,
    level,
    levelsGained,
    statPointsGained: levelsGained * 3,
  };
};

const requireStudentUid = () => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("Sign in to save dungeon progress.");
  }

  return uid;
};

const normalizeProgress = (value = {}) => {
  const completedStages = Array.isArray(value?.completedStages)
    ? [...new Set(value.completedStages)]
        .map(Number)
        .filter(
          (stageId) =>
            Number.isInteger(stageId) &&
            stageId >= 1 &&
            stageId <= DUNGEON_STAGE_COUNT
        )
        .sort((first, second) => first - second)
    : [];

  const highestUnlockedStage = Number(value?.highestUnlockedStage);
  const validHighestUnlockedStage = Number.isInteger(highestUnlockedStage)
    ? Math.min(Math.max(highestUnlockedStage, 1), DUNGEON_STAGE_COUNT)
    : 1;

  return {
    highestUnlockedStage: Math.max(
      validHighestUnlockedStage,
      ...completedStages.map((stageId) =>
        Math.min(stageId + 1, DUNGEON_STAGE_COUNT)
      )
    ),
    completedStages,
  };
};

export const getDungeonProgress = async () => {
  const uid = requireStudentUid();
  const studentRef = doc(db, "users", uid);
  const snapshot = await getDoc(studentRef);

  if (!snapshot.exists()) {
    throw new Error("Student data not found.");
  }

  const studentData = snapshot.data();
  const storedProgress = studentData.dungeonProgress;

  if (storedProgress) {
    return normalizeProgress(storedProgress);
  }

  const progress = await runTransaction(db, async (transaction) => {
    const currentSnapshot = await transaction.get(studentRef);

    if (!currentSnapshot.exists()) {
      throw new Error("Student data not found.");
    }

    const currentProgress = currentSnapshot.data().dungeonProgress;

    if (currentProgress) {
      return normalizeProgress(currentProgress);
    }

    const initialProgress = { ...DEFAULT_DUNGEON_PROGRESS };
    transaction.update(studentRef, {
      dungeonProgress: {
        ...initialProgress,
        updatedAt: serverTimestamp(),
      },
    });

    return initialProgress;
  });

  await updateStudentCache(uid, { dungeonProgress: progress });
  return progress;
};

export const completeDungeonStage = async (stageIdValue) => {
  const uid = requireStudentUid();
  const stageId = Number(stageIdValue);

  if (
    !Number.isInteger(stageId) ||
    stageId < 1 ||
    stageId > DUNGEON_STAGE_COUNT
  ) {
    throw new Error("This dungeon floor is unavailable.");
  }

  const studentRef = doc(db, "users", uid);
  const completion = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(studentRef);

    if (!snapshot.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData = snapshot.data();
    const currentProgress = normalizeProgress(studentData.dungeonProgress);

    if (stageId > currentProgress.highestUnlockedStage) {
      throw new Error("Complete the previous dungeon floor first.");
    }

    const firstClear = !currentProgress.completedStages.includes(stageId);
    const reward = STAGE_REWARDS[stageId][firstClear ? "firstClear" : "replay"];
    const xpProgress = calculateXpProgress(studentData, reward.xp);
    const nextGold = getNumber(studentData.gold) + reward.gold;
    const nextStatPoints =
      getNumber(studentData.statPoints) + xpProgress.statPointsGained;

    const completedStages = currentProgress.completedStages.includes(stageId)
      ? currentProgress.completedStages
      : [...currentProgress.completedStages, stageId].sort(
          (first, second) => first - second
        );

    const nextProgress = {
      completedStages,
      highestUnlockedStage: Math.max(
        currentProgress.highestUnlockedStage,
        Math.min(stageId + 1, DUNGEON_STAGE_COUNT)
      ),
    };

    transaction.update(studentRef, {
      dungeonProgress: {
        ...nextProgress,
        updatedAt: serverTimestamp(),
      },
      xp: xpProgress.xp,
      maxXp: xpProgress.maxXp,
      level: xpProgress.level,
      gold: nextGold,
      statPoints: nextStatPoints,
      updatedAt: serverTimestamp(),
    });

    return {
      ...nextProgress,
      firstClear,
      reward,
      levelsGained: xpProgress.levelsGained,
      statPointsGained: xpProgress.statPointsGained,
      studentUpdates: {
        xp: xpProgress.xp,
        maxXp: xpProgress.maxXp,
        level: xpProgress.level,
        gold: nextGold,
        statPoints: nextStatPoints,
      },
    };
  });

  const { studentUpdates, ...result } = completion;
  await updateStudentCache(uid, {
    dungeonProgress: {
      completedStages: result.completedStages,
      highestUnlockedStage: result.highestUnlockedStage,
    },
    ...studentUpdates,
  });
  return result;
};
