import { collection, getDocs } from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

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
  if (!auth.currentUser) {
    throw new Error("Sign in to view the leaderboard.");
  }

  const snapshot = await getDocs(collection(db, "leaderboards"));
  const players = snapshot.docs
    .map((playerSnapshot) => normalizePlayer(playerSnapshot, mode))
    .filter(Boolean)
    .sort(
      (first, second) =>
        second.wins - first.wins ||
        second.winRate - first.winRate ||
        first.username.localeCompare(second.username)
    );

  return players.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
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
