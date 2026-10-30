import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";
import { saveStudentCache } from "./studentCacheService";

const STAT_REWARDS = {
  hp: 10,
  power: 2,
  energy: 1,
};

const VALID_STATS = ["hp", "power", "energy"];

const requireStudentUid = () => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("No logged in student.");
  }

  return uid;
};

const getNumber = (value, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const allocateStatPoint = async (statType) => {
  if (!VALID_STATS.includes(statType)) {
    throw new Error("Invalid stat type.");
  }

  const uid = requireStudentUid();
  const studentRef = doc(db, "users", uid);

  const result = await runTransaction(db, async (transaction) => {
    const studentSnap = await transaction.get(studentRef);

    if (!studentSnap.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData = studentSnap.data();
    const currentStatPoints = getNumber(studentData.statPoints);

    if (currentStatPoints <= 0) {
      throw new Error("No stat points available.");
    }

    const statIncrease = STAT_REWARDS[statType];
    const currentStatValue = getNumber(studentData[statType]);

    const updatedStudent = {
      uid,
      ...studentData,

      [statType]: currentStatValue + statIncrease,
      statPoints: currentStatPoints - 1,

      updatedAt: new Date(),
    };

    transaction.update(studentRef, {
      [statType]: currentStatValue + statIncrease,
      statPoints: currentStatPoints - 1,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      statType,
      statIncrease,
      student: updatedStudent,
    };
  });

  if (result?.student) {
    await saveStudentCache(uid, result.student);
  }

  return result;
};