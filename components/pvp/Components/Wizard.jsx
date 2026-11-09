import { HitShake } from "../Animation/HitShake";
import {View, StyleSheet} from "react-native";
import  SpriteSheet  from "../../shared/SpriteSheet";
import {getWizardAvatar} from "../../../constants/wizardAvatars";

export function Wizard({ avatarId, hits, flip }) {
  const avatar = getWizardAvatar(avatarId);
  return (
    <HitShake hits={hits} style={styles.wizard}>
      <View style={{ transform: [{ scaleX: flip ? -1 : 1 }] }}>
        <SpriteSheet
          source={avatar.source}
          frameCount={avatar.frameCount}
          scale={1}
        />
      </View>
    </HitShake>
  );
}

const styles = StyleSheet.create({
  wizard: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
});