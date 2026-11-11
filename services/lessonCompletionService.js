import { httpsCallable } from "firebase/functions";

import { auth, functions } from "./firebaseConfig";
import { getTodayKey } from "./dailyStreakService";

import { saveStudentCache, updateStudentCache } from "./studentCacheService";

const completeStudentLessonCall = httpsCallable(functions, "completeStudentLesson");
const markDailyRewardSeenCall = httpsCallable(functions, "markStudentDailyRewardSeen");

const requireStudentUid = () => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("No logged in student.");
  }

  return uid;
};

export const completeLessonAndReward = async ({
  lesson,
  answerDetails = [],
  durationSeconds,
}) => {
  if (!lesson?.id) {
    throw new Error("Missing lesson id.");
  }

  const user = auth.currentUser;
  const uid = requireStudentUid();
  await user.getIdToken();
  const response = await completeStudentLessonCall({
    lessonId: lesson.id,
    answerDetails,
    durationSeconds,
  });
  const result = response.data;
  if (result?.student) await saveStudentCache(uid, result.student);
  return result;
};

export const markDailyRewardModalSeen = async () => {
  const user = auth.currentUser;
  const uid = requireStudentUid();
  await user.getIdToken();
  const response = await markDailyRewardSeenCall();
  const todayKey = response.data.lastDailyRewardModalDate || getTodayKey();

  await updateStudentCache(uid, {
    lastDailyRewardModalDate: todayKey,
  });

  return todayKey;
};
