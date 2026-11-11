export const sampleStudent = {
  username: "GUEST1",
  role: "Student",
  level: 1,
  streak: 3,
  gold: 500,
  xp: 50,
  maxXp: 150,
  hp: 100,
  power: 10,
  energy: 50,
  avatar: null,
};

export const sampleDailyTask = {
  title: "DAILY TASK",
  description: "Complete 1 lesson today to earn XP.",
  rewardXp: 20,
  completed: false,
};

export const homeMenuItems = [
  {
    id: "shop",
    title: "SHOP",
    icon: require("../assets/images/shopIcon.png"),
  },
  {
    id: "inventory",
    title: "BAG",
    icon: require("../assets/images/bagIcon.png"),
  },
  {
    id: "history",
    title: "HISTORY",
    icon: require("../assets/images/historyLesson.png"),
  },
];