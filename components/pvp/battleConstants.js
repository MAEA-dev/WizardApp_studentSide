/* ---------- game data ---------- */

export const MAX_HP = 100;

export const CARDS = [
  {
    id: "bolt",
    name: "Thunder Bolt",
    cost: 1,
    dmg: 3,
    icon: "⚡",
    color: "#f6c945",
    text: "Retribution. Deals 3 base damage.",
  },
  {
    id: "ward",
    name: "Ward",
    cost: 2,
    sh: 20,
    icon: "🛡️",
    color: "#4aa3ff",
    text: "Absorbs 20 damage.",
    },
    {
    id: "fire",
    name: "Fire Tempest",
    cost: 2,
    dmg: 6,
    icon: "🔥",
    color: "#ff7a3d",
    text: "Incinerate. Deals 6 base damage.",
  },
  {
    id: "heal",
    name: "Mend",
    cost: 2,
    heal: 30,
    icon: "💚",
    color: "#4ade80",
    text: "Heals 30 HP.",
  },
  {
    id: "drain",
    name: "Soul Drain",
    cost: 3,
    dmg: 4,
    heal: 2,
    icon: "🌙",
    color: "#b57bff",
    text: "Deals 4 base damage and heals 2 HP.",
  },
  {
    id: "meteor",
    name: "Meteor",
    cost: 5,
    dmg: 10,
    icon: "☄️",
    color: "#ff4d4d",
    text: "Dinosaurs be damned. Deals 10 base damage.",
  },
];

export const PER_PAGE = 3;

export const other = (w) => (w === "me" ? "opp" : "me");

export const manaFor = (turns) => Math.min(6, 2 + turns);