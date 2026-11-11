import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

export const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getTodayKey = () => getDateKey();

export const getYesterdayKey = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday);
};

export const calculateDailyStreak = ({
  currentStreak,
  lastStreakDate,
  todayKey = getTodayKey(),
  yesterdayKey = getYesterdayKey(),
}) => {
  const streak = Math.max(Number(currentStreak) || 0, 0);

  if (lastStreakDate === todayKey) return Math.max(streak, 1);
  if (lastStreakDate === yesterdayKey) return streak + 1;
  return 1;
};

export const updateLoginStreak = async () => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("Sign in to update your daily streak.");
  }

  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();
  const studentRef = doc(db, "users", uid);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(studentRef);

    if (!snapshot.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData = snapshot.data();
    const lastStreakDate =
      studentData.lastStreakDate || studentData.lastLessonRewardDate || null;

    if (lastStreakDate === todayKey) {
      return {
        streak: Math.max(Number(studentData.streak) || 0, 1),
        lastStreakDate: todayKey,
      };
    }

    const streak = calculateDailyStreak({
      currentStreak: studentData.streak,
      lastStreakDate,
      todayKey,
      yesterdayKey,
    });

    transaction.update(studentRef, {
      streak,
      lastStreakDate: todayKey,
      updatedAt: serverTimestamp(),
    });

    return { streak, lastStreakDate: todayKey };
  });
};
