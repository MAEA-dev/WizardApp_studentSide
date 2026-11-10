
export const DEFAULT_WIZARD_AVATAR = "fireMage";

export const WIZARD_AVATARS = {
  waterMage: {
    id: "waterMage",
    attackEffect: "waterBlast",
    name: "Water Mage",
    description: "A calm and focused water mage.",
    shop: {
      price: 20,
      image: require("../assets/images/waterMage.png"),
    },

    animations: {
      idle: {
        source: require("../assets/images/waterMage/idle.png"),
        frameCount: 4,
        fps:5
      },
      attack: {
        source: require("../assets/images/waterMage/attack.png"),
        frameCount: 10,
        fps: 20
      },
      defeat: {
        source: require("../assets/images/waterMage/die.png"),
        frameCount: 5,
      },
    },
  },

  fireMage: {
    id: "fireMage",
    attackEffect: "meteor",
    name: "Fire Mage",
    description: "A bold mage with a fiery spirit.",
    shop: {
      price: 30,
      image: require("../assets/images/fireMage.png"),
    },

    animations: {
      idle: {
        source: require("../assets/images/fireMage/idle.png"),
        frameCount: 8,
        fps: 5
      },
      attack: {
        source: require("../assets/images/fireMage/attack.png"),
        frameCount: 6,
        fps: 15
      },
    },
  },
};

export const getWizardAvatar = (avatarId) =>
  WIZARD_AVATARS[avatarId] ||
  WIZARD_AVATARS[DEFAULT_WIZARD_AVATAR];

export const getWizardAvatarId = (avatarId) =>
  WIZARD_AVATARS[avatarId]
    ? avatarId
    : DEFAULT_WIZARD_AVATAR;

export const getAllWizardAvatars = () =>
  Object.values(WIZARD_AVATARS);

export const hasWizardAvatar = (avatarId) =>
  Object.prototype.hasOwnProperty.call(
    WIZARD_AVATARS,
    avatarId
  );

export const getWizardAnimation = (avatarId, animation = "idle") => {
  const avatar = getWizardAvatar(avatarId);

  return (
    avatar.animations[animation] ||
    avatar.animations.idle
  );
};
