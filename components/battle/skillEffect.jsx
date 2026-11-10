import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import SpriteAnimator from "./SpriteAnimator";
import { skillEffects } from "../../data/skillEffects";

const SkillEffect = ({
  effect = null,
  visible = false,
  scale = 5,
  onFinish,
}) => {
  if (!visible || !effect) {
    return null;
  }

  const animation = skillEffects[effect];

  if (!animation) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.effectOverlay}>
      <SpriteAnimator
        animations={{
          play: animation,
        }}
        action="play"
        width={animation.frameWidth}
        height={animation.frameHeight}
        scale={scale}
        fps={animation.fps || 14}
        loop={false}
        onAnimationFinish={onFinish}
      />
    </View>
  );
};

export default SkillEffect;

const styles = StyleSheet.create({
  effectOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    overflow: "visible",
  },
});
