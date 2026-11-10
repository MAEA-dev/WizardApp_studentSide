
import { StyleSheet, View } from "react-native";
import SpriteSheet from "../shared/SpriteSheet";

import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAnimation,
} from "../../constants/wizardAvatars";

export default function WizardAvatar({
  scale,
  avatarId = DEFAULT_WIZARD_AVATAR,
}) {
  const idleAnimation = getWizardAnimation(avatarId, "idle");

  return (
    <View style={styles.wizardSection}>
      <SpriteSheet
        source={idleAnimation.source}
        frameCount={idleAnimation.frameCount}
        scale={scale}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wizardSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
});
