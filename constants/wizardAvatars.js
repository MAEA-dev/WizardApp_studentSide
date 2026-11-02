export const DEFAULT_WIZARD_AVATAR = "waterMage";

export const WIZARD_AVATARS = {
  waterMage: {
    source: require("../assets/images/waterMage/idle.png"),
    frameCount: 4,
  },
};

const hasWizardAvatar = (avatarId) =>
  Object.prototype.hasOwnProperty.call(WIZARD_AVATARS, avatarId);

export const getWizardAvatar = (avatarId) =>
  WIZARD_AVATARS[hasWizardAvatar(avatarId) ? avatarId : DEFAULT_WIZARD_AVATAR];

export const getWizardAvatarId = (avatarId) =>
  hasWizardAvatar(avatarId) ? avatarId : DEFAULT_WIZARD_AVATAR;
