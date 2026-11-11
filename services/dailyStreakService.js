import { httpsCallable } from "firebase/functions";

import { auth, functions } from "./firebaseConfig";

const updateLoginStreakCall = httpsCallable(functions, "updateStudentLoginStreak");

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
  const user = auth.currentUser;
  if (!user?.uid) {
    throw new Error("Sign in to update your daily streak.");
  }
  // Ensure a fresh Firebase Auth token is available before invoking the callable.
  await user.getIdToken();
  const response = await updateLoginStreakCall();
  return response.data;
};
