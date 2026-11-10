const createMonsterAnimations = (
  frameCounts,
  spriteSheets,
  frameRates,
  frameSizes
) => ({
  idle: {
    source: spriteSheets.idle,
    frameCount: frameCounts.idle,
    frameWidth: frameSizes.idle.width,
    frameHeight: frameSizes.idle.height,
    fps: frameRates.idle,
    loop: true,
  },
  attack: {
    source: spriteSheets.attack,
    frameCount: frameCounts.attack,
    frameWidth: frameSizes.attack.width,
    frameHeight: frameSizes.attack.height,
    fps: frameRates.attack,
    loop: false,
  },
  hurt: {
    source: spriteSheets.hurt,
    frameCount: frameCounts.hurt,
    frameWidth: frameSizes.hurt.width,
    frameHeight: frameSizes.hurt.height,
    fps: frameRates.hurt,
    loop: false,
  },
  die: {
    source: spriteSheets.die,
    frameCount: frameCounts.die,
    frameWidth: frameSizes.die.width,
    frameHeight: frameSizes.die.height,
    fps: frameRates.die,
    loop: false,
  },
});

export const DUNGEON_STAGES = [
  {
    id: 1,
    title: "Whispering Woods",
    description: "A gentle first challenge for new adventurers.",
    monsterHp: 80,
    monsterAttack: 25,
    color: "#34D399",
    icon: "leaf",
    monster: {
      id: "plantMonster",
      name: "Plant Monster",
      spriteFolder: "plantMonster",
      flipped: false,
      scale: null,
      attackEffect: "poisonBlast",
      animations: createMonsterAnimations(
        { idle: 5, attack: 5, hurt: 5, die: 5 },
        {
          idle: require("../assets/images/monsters/plantMonster/Idle.png"),
          attack: require("../assets/images/monsters/plantMonster/attack.png"),
          hurt: require("../assets/images/monsters/plantMonster/hurt.png"),
          die: require("../assets/images/monsters/plantMonster/die.png"),
        },
        { idle: 7, attack: 10, hurt: 10, die: 10 },
        {
          idle: { width: 128, height: 128 },
          attack: { width: 128, height: 128 },
          hurt: { width: 128, height: 128 },
          die: { width: 128, height: 128 },
        }
      ),
    },
  },
  {
    id: 2,
    title: "Medusa's Garden",
    description: "Defeat Medusa, the guardian of the snake-haired garden.",
    monsterHp: 120,
    monsterAttack: 35,
    color: "#60A5FA",
    icon: "diamond",
    monster: {
      id: "medusa",
      name: "Medusa",
      spriteFolder: "medusa",
      flipped: true,
      scale: 1.1,
      heightScale: 1.1,
      attackEffect: "stone",
      animations: createMonsterAnimations(
        { idle: 3, attack: 6, hurt: 2, die: 6 },
        {
          idle: require("../assets/images/monsters/medusa/idle.png"),
          attack: require("../assets/images/monsters/medusa/attack.png"),
          hurt: require("../assets/images/monsters/medusa/hurt.png"),
          die: require("../assets/images/monsters/medusa/die.png"),
        },
        { idle: 4, attack: 10, hurt: 10, die: 10 },
        {
          idle: { width: 100, height: 80 },
          attack: { width: 150, height: 83 },
          hurt: { width: 76, height: 73 },
          die: { width: 107, height: 73 },
        }
      ),
    },
  },
  {
    id: 3,
    title: "Demon's Lair",
    description: "Challenge the final floor and defeat the Demon.",
    monsterHp: 160,
    monsterAttack: 45,
    color: "#FB7185",
    icon: "flame",
    monster: {
      id: "demon",
      name: "Demon",
      spriteFolder: "demon",
      flipped: true,
      scale: 1.15,
      attackEffect: "arcSlash",
      animations: createMonsterAnimations(
        { idle: 4, attack: 3, hurt: 2, die: 6 },
        {
          idle: require("../assets/images/monsters/demon/idle.png"),
          attack: require("../assets/images/monsters/demon/attack.png"),
          hurt: require("../assets/images/monsters/demon/hurt.png"),
          die: require("../assets/images/monsters/demon/die.png"),
        },
        { idle: 5, attack: 10, hurt: 10, die: 10 },
        {
          idle: { width: 109, height: 111 },
          attack: { width: 135, height: 130 },
          hurt: { width: 103, height: 97 },
          die: { width: 113, height: 97 },
        }
      ),
    },
  },
];
