/* ---------- game data ---------- */

export const MAX_HP = 100;

export const CARDS = [
  {
    id: "bolt",
    name: "Thunder Bolt",
    cost: 1,
    dmg: 0.25,
    icon: "⚡",
    color: "#f6c945",
    text: "Retribution. Deals 25% of your [POW] as damage.",
  },
  {
    id: "ward",
    name: "Ward",
    cost: 2,
    sh: 0.2,
    icon: "🛡️",
    color: "#4aa3ff",
    text: "Block. Absorbs damage equal to 20% of your max HP.",
  },
  {
    id: "fire",
    name: "Fire Tempest",
    cost: 2,
    dmg: 0.7,
    icon: "🔥",
    color: "#ff7a3d",
    text: "Incinerate. Deals 70% of your [POW] as damage.",
  },
  {
    id: "heal",
    name: "Mend",
    cost: 2,
    heal: 0.25,
    icon: "💚",
    color: "#4ade80",
    text: "Move on na ya. Heals 25% of your max HP.",
  },
  {
    id: "drain",
    name: "Soul Drain",
    cost: 3,
    dmg: 0.5,
    heal: 0.05,
    icon: "🌙",
    color: "#b57bff",
    text: "Deals 50% of your [POW] as damage and heals 5% of your max HP.",
  },
  {
    id: "meteor",
    name: "Meteor",
    cost: 6,
    dmg: 3.0,
    icon: "☄️",
    color: "#ff4d4d",
    text: "Dinosaurs be damned. Deals 300% of your [POW] as damage.",
  },
];

export const PER_PAGE = 3;

export const other = (w) => (w === "me" ? "opp" : "me");

export const manaFor = (turns) => Math.min(6, 2 + turns);
