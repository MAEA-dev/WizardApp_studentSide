/* ---------- game data ---------- */
export const MAX_HP = 20;
export const CARDS = [
  {
    id: "bolt",
    name: "Thunder Bolt",
    cost: 1,
    dmg: 3,
    icon: "⚡",
    color: "#f6c945",
    text: "Retribution. Deals 3 damage.",
  },
  {
    id: "ward",
    name: "Ward",
    cost: 2,
    sh: 5,
    icon: "🛡️",
    color: "#4aa3ff",
    text: "Block. Block. Block - Absorbs 5 damage.",
  },
  {
    id: "fire",
    name: "Fire Tempest",
    cost: 2,
    dmg: 6,
    icon: "🔥",
    color: "#ff7a3d",
    text: "Incinerate. Deals 6 damage.",
  },
  {
    id: "heal",
    name: "Mend",
    cost: 2,
    heal: 5,
    icon: "💚",
    color: "#4ade80",
    text: "I wanna heal, I wanna feel, what I thought was never real. Heals 5.",
  },
  {
    id: "drain",
    name: "Soul Drain",
    cost: 3,
    dmg: 4,
    heal: 2,
    icon: "🌙",
    color: "#b57bff",
    text: "Death by snu snu. Deals 4 damage and heals 2.",
  },
  {
    id: "meteor",
    name: "Meteor",
    cost: 5,
    dmg: 10,
    icon: "☄️",
    color: "#ff4d4d",
    text: "Dinosaurs be damned. Deals 10 damage.",
  },
];
export const PER_PAGE = 3;
export const other = (w) => (w === "me" ? "opp" : "me");
export const manaFor = (turns) => Math.min(6, 2 + turns);