import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

const USERS_COLLECTION = "users";
const LEADERBOARDS_COLLECTION = "leaderboards";

const LEADERBOARD_FIELDS = {
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

const getNonNegativeNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
};

const getGradeValue = (studentData) => {
  const grade =
    studentData.profile?.grade ??
    studentData.profile?.gradeLevel ??
    studentData.gradeLevel ??
    studentData.grade;

  if (grade === null || grade === undefined || String(grade).trim() === "") {
    throw new Error("Your student profile is missing a grade level.");
  }

  return grade;
};

const normalizePlayer = (documentSnapshot, mode) => {
  const fields = LEADERBOARD_FIELDS[mode];
  const data = documentSnapshot.data();
  const wins = getNonNegativeNumber(data[fields.wins]);
  const losses = getNonNegativeNumber(data[fields.losses]);
  const totalBattles = wins + losses;

  if (totalBattles === 0) {
    return null;
  }

  return {
    uid: documentSnapshot.id,
    username:
      typeof data.username === "string" && data.username.trim()
        ? data.username.trim()
        : "Wizard",
    wins,
    losses,
    winRate: getNonNegativeNumber(data[fields.winRate]),
  };
};

const getLeaderboard = async (mode) => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("Sign in to view the leaderboard.");
  }

  const currentStudentSnapshot = await getDoc(
    doc(db, USERS_COLLECTION, uid)
  );

  if (!currentStudentSnapshot.exists()) {
    throw new Error("Student profile not found.");
  }

  const gradeValue = getGradeValue(currentStudentSnapshot.data());
  const gradeLevel = String(gradeValue).trim();
  const snapshot = await getDocs(
    query(
      collection(db, LEADERBOARDS_COLLECTION),
      where("gradeLevel", "==", gradeLevel)
    )
  );

  const players = snapshot.docs
    .map((playerSnapshot) => normalizePlayer(playerSnapshot, mode))
    .filter(Boolean)
    .sort(
      (first, second) =>
        second.wins - first.wins ||
        second.winRate - first.winRate ||
        first.username.localeCompare(second.username)
    );

  return {
    gradeLevel,
    leaderboard: players.map((player, index) => ({
      ...player,
      rank: index + 1,
    })),
  };
};

export const getOverallLeaderboard = () => getLeaderboard("overall");
export const getPvELeaderboard = () => getLeaderboard("pve");
export const getPvPLeaderboard = () => getLeaderboard("pvp");

export const getLeaderboardForMode = (mode) => {
  const getModeLeaderboard = {
    overall: getOverallLeaderboard,
    pve: getPvELeaderboard,
    pvp: getPvPLeaderboard,
  }[mode];

  if (!getModeLeaderboard) {
    throw new Error(`Unsupported leaderboard mode: ${mode}`);
  }

  return getModeLeaderboard();
};
