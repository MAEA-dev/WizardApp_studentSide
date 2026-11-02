import { StyleSheet, View } from "react-native";
import SpriteSheet from "../shared/SpriteSheet";
import {
  DEFAULT_WIZARD_AVATAR,
  getWizardAvatar,
} from "../../constants/wizardAvatars";

export default function WizardAvatar({
  scale,
  avatarId = DEFAULT_WIZARD_AVATAR,
}) {
  const avatar = getWizardAvatar(avatarId);

  return (
    <View style={styles.wizardSection}>
      <SpriteSheet
        source={avatar.source}
        frameCount={avatar.frameCount}
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
    margin: 20
  },
});