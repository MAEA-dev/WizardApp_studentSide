export const wizardSprites = {
  idle: {
    source: require("../assets/images/waterMage/idle.png"),
    frameCount: 4,
    frameWidth: 128,
    frameHeight: 128,
    fps: 5,
    loop: true,
  },

  attack: {
    source: require("../assets/images/waterMage/attack.png"),
    frameCount: 10,
    frameWidth: 128,
    frameHeight: 128,
    fps: 12,
    loop: false,
  },
    hurt: {
    source: require("../assets/images/waterMage/hurt.png"),
    frameCount: 4,
    frameWidth: 128,
    frameHeight: 128,
    fps: 10,
    loop: false,
  },
    die: {
    source: require("../assets/images/waterMage/die.png"),
    frameCount: 5,
    frameWidth: 128,
    frameHeight: 128,
    fps: 12,
    loop: false,
  },
};

export const monsterSprites = {
  idle: {
    source: require("../assets/images/monsters/plantMonster/Idle.png"),
    frameCount: 3,
    frameWidth: 300,
    frameHeight: 200,
    fps:5,
    loop: true,
  },
   attack: {
    source: require("../assets/images/monsters/plantMonster/attack.png"),
    frameCount: 5,
    frameWidth: 128,
    frameHeight: 128,
    fps:12,
    loop: false,
  },
    hurt: {
    source: require("../assets/images/monsters/plantMonster/hurt.png"),
    frameCount: 5,
    frameWidth: 128,
    frameHeight: 128,
    fps:12,
    loop: false,
  },
    die: {
    source: require("../assets/images/monsters/plantMonster/die.png"),
    frameCount: 5,
    frameWidth: 128,
    frameHeight: 128,
    fps:12,
    loop: false,
  },


  
};
