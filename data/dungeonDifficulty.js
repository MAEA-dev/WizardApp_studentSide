const DIFFICULTY_BY_STAGE = {
  1: "easy",
  2: "medium",
  3: "hard",
};

export const getStageDifficulty = (stage) =>
  DIFFICULTY_BY_STAGE[Number(stage?.id)] || "easy";
