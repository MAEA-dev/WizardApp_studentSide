import {
  doc,
  runTransaction,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

import {
  saveStudentCache,
  updateStudentCache,
} from "./studentCacheService";

const DEFAULT_MAX_XP = 150;
const LEVEL_XP_INCREASE = 50;
const STAT_POINTS_PER_LEVEL = 3;

const DAILY_LESSON_REWARD = {
  xp: 30,
  gold: 20,
};

const requireStudentUid = () => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("No logged in student.");
  }

  return uid;
};

const getStudentRef = (uid) => {
  return doc(db, "users", uid);
};

const getCompletedLessonId = ({ uid, lessonId }) => {
  return `${uid}_${lessonId}`;
};

const getNumber = (value, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const cleanAnswerDetails = (answerDetails = []) => {
  if (!Array.isArray(answerDetails)) return [];

  return answerDetails.map((item) => {
    const isCorrect = item?.isCorrect === true;

    return {
      stepIndex: getNumber(item?.stepIndex),

      question: String(item?.question || ""),
      selectedAnswer: String(item?.selectedAnswer || ""),
      correctAnswer: String(item?.correctAnswer || ""),

      isCorrect,
      result: isCorrect ? "correct" : "wrong",
    };
  });
};

export const getTodayKey = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getYesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateLevelProgress = ({
  currentXp,
  currentMaxXp,
  currentLevel,
  addedXp,
}) => {
  let xp = getNumber(currentXp);
  let maxXp = getNumber(currentMaxXp, DEFAULT_MAX_XP);
  let level = getNumber(currentLevel, 1);
  let levelsGained = 0;

  xp += getNumber(addedXp);

  while (xp >= maxXp) {
    xp -= maxXp;
    level += 1;
    levelsGained += 1;
    maxXp += LEVEL_XP_INCREASE;
  }

  return {
    xp,
    maxXp,
    level,
    levelsGained,
    leveledUp: levelsGained > 0,
    statPointsGained: levelsGained * STAT_POINTS_PER_LEVEL,
  };
};

const calculateStreak = ({ currentStreak, lastLessonRewardDate }) => {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  if (lastLessonRewardDate === todayKey) {
    return getNumber(currentStreak);
  }

  if (lastLessonRewardDate === yesterdayKey) {
    return getNumber(currentStreak) + 1;
  }

  return 1;
};

const getLessonSubjectId = (lesson) => {
  return lesson?.subjectId || lesson?.raw?.subjectId || null;
};

const buildCompletedLessonData = ({
  uid,
  lesson,
  earnedReward,
  correctAnswers,
  totalQuestions,
  answerDetails = [],
  dailyXp,
  dailyGold,
  dailyRewardClaimed,
}) => {
  const safeCorrectAnswers = getNumber(correctAnswers);
  const safeTotalQuestions = getNumber(totalQuestions);

  const safeWrongAnswers = Math.max(
    safeTotalQuestions - safeCorrectAnswers,
    0
  );

  const percentage =
    safeTotalQuestions > 0
      ? Math.round((safeCorrectAnswers / safeTotalQuestions) * 100)
      : 0;

  return {
    userId: uid,

    lessonId: lesson.id,
    subjectId: getLessonSubjectId(lesson),

    correctAnswers: safeCorrectAnswers,
    wrongAnswers: safeWrongAnswers,
    totalQuestions: safeTotalQuestions,
    percentage,

    answerDetails: cleanAnswerDetails(answerDetails),

    xpEarned: getNumber(earnedReward?.xp),
    goldEarned: getNumber(earnedReward?.gold),

    dailyXpEarned: dailyXp,
    dailyGoldEarned: dailyGold,
    dailyRewardClaimed,

    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
};

const buildAlreadyCompletedResult = ({ uid, userData }) => {
  return {
    rewarded: false,
    alreadyCompleted: true,
    reason: "Lesson already completed.",
    student: {
      uid,
      ...userData,
    },
  };
};

export const completeLessonAndReward = async ({
  lesson,
  earnedReward,
  correctAnswers,
  totalQuestions,
  answerDetails = [],
}) => {
  if (!lesson?.id) {
    throw new Error("Missing lesson id.");
  }

  const uid = requireStudentUid();
  const todayKey = getTodayKey();

  const studentRef = getStudentRef(uid);

  const completedLessonRef = doc(
    db,
    "completedLessons",
    getCompletedLessonId({
      uid,
      lessonId: lesson.id,
    })
  );

  const result = await runTransaction(db, async (transaction) => {
    const studentSnap = await transaction.get(studentRef);
    const completedLessonSnap = await transaction.get(completedLessonRef);

    if (!studentSnap.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData = studentSnap.data();

    if (completedLessonSnap.exists()) {
      return buildAlreadyCompletedResult({
        uid,
        userData: studentData,
      });
    }

    const lessonXp = getNumber(earnedReward?.xp);
    const lessonGold = getNumber(earnedReward?.gold);

    const isFirstLessonToday =
      studentData.lastLessonRewardDate !== todayKey;

    const dailyXp = isFirstLessonToday ? DAILY_LESSON_REWARD.xp : 0;
    const dailyGold = isFirstLessonToday ? DAILY_LESSON_REWARD.gold : 0;

    const totalXpReward = lessonXp + dailyXp;
    const totalGoldReward = lessonGold + dailyGold;

    const nextProgress = calculateLevelProgress({
      currentXp: studentData.xp,
      currentMaxXp: studentData.maxXp,
      currentLevel: studentData.level,
      addedXp: totalXpReward,
    });

    const nextGold = getNumber(studentData.gold) + totalGoldReward;

    const nextStatPoints =
      getNumber(studentData.statPoints) + nextProgress.statPointsGained;

    const nextCompletedLessons = getNumber(studentData.completedLessons) + 1;
    const nextTotalLessonsTaken = getNumber(studentData.totalLessonsTaken) + 1;

    const nextStreak = isFirstLessonToday
      ? calculateStreak({
          currentStreak: studentData.streak,
          lastLessonRewardDate: studentData.lastLessonRewardDate,
        })
      : getNumber(studentData.streak);

    const nextLastLessonRewardDate = isFirstLessonToday
      ? todayKey
      : studentData.lastLessonRewardDate || null;

    const nextLastLessonRewardLessonId = isFirstLessonToday
      ? lesson.id
      : studentData.lastLessonRewardLessonId || null;

    const completedLessonData = buildCompletedLessonData({
      uid,
      lesson,
      earnedReward,
      correctAnswers,
      totalQuestions,
      answerDetails,
      dailyXp,
      dailyGold,
      dailyRewardClaimed: isFirstLessonToday,
    });

    const updatedStudent = {
      uid,
      ...studentData,

      xp: nextProgress.xp,
      maxXp: nextProgress.maxXp,
      level: nextProgress.level,
      gold: nextGold,
      statPoints: nextStatPoints,

      streak: nextStreak,
      lastLessonRewardDate: nextLastLessonRewardDate,
      lastLessonRewardLessonId: nextLastLessonRewardLessonId,

      completedLessons: nextCompletedLessons,
      totalLessonsTaken: nextTotalLessonsTaken,

      updatedAt: new Date(),
    };

    transaction.set(completedLessonRef, completedLessonData);

    transaction.update(studentRef, {
      xp: nextProgress.xp,
      maxXp: nextProgress.maxXp,
      level: nextProgress.level,
      gold: nextGold,
      statPoints: nextStatPoints,

      streak: nextStreak,
      lastLessonRewardDate: nextLastLessonRewardDate,
      lastLessonRewardLessonId: nextLastLessonRewardLessonId,

      completedLessons: nextCompletedLessons,
      totalLessonsTaken: nextTotalLessonsTaken,

      updatedAt: serverTimestamp(),
    });

    return {
      rewarded: true,
      alreadyCompleted: false,

      xpReward: lessonXp,
      goldReward: lessonGold,

      dailyRewardClaimed: isFirstLessonToday,
      dailyXpReward: dailyXp,
      dailyGoldReward: dailyGold,

      streak: nextStreak,

      leveledUp: nextProgress.leveledUp,
      levelsGained: nextProgress.levelsGained,
      statPointsGained: nextProgress.statPointsGained,

      correctAnswers: getNumber(correctAnswers),
      wrongAnswers: Math.max(
        getNumber(totalQuestions) - getNumber(correctAnswers),
        0
      ),
      totalQuestions: getNumber(totalQuestions),
      percentage:
        getNumber(totalQuestions) > 0
          ? Math.round(
              (getNumber(correctAnswers) / getNumber(totalQuestions)) * 100
            )
          : 0,

      answerDetails: cleanAnswerDetails(answerDetails),

      student: updatedStudent,
    };
  });

  if (result?.student) {
    await saveStudentCache(uid, result.student);
  }

  return result;
};

export const markDailyRewardModalSeen = async () => {
  const uid = requireStudentUid();
  const todayKey = getTodayKey();

  const studentRef = getStudentRef(uid);

  await updateDoc(studentRef, {
    lastDailyRewardModalDate: todayKey,
    updatedAt: serverTimestamp(),
  });

  await updateStudentCache(uid, {
    lastDailyRewardModalDate: todayKey,
  });

  return todayKey;
};