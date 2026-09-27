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

  
  position = "right",

  fieldWidth = 375,
  fieldHeight = 190,

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

  const effectWidth = animation.frameWidth * scale;
  const effectHeight = animation.frameHeight * scale;

  const targetPosition = getEffectPosition({
    position,
    fieldWidth,
    fieldHeight,
    effectWidth,
    effectHeight,
  });

  return (
    <View
      pointerEvents="none"
      style={[
        styles.effectLayer,
        {
          left: targetPosition.x,
          bottom: targetPosition.y,
        },
      ]}
    >
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
        flipped={position === "left"}
        onAnimationFinish={onFinish}
      />
    </View>
  );
};

const getEffectPosition = ({
  position,
  fieldWidth,
  fieldHeight,
  effectWidth,
  effectHeight,
}) => {
  const bottomOffset = fieldHeight * 0.1;

  if (position === "left") {
    return {
      x: fieldWidth * 0.01,
      y: bottomOffset,
    };
  }

  return {
    x: fieldWidth * 0.55 - effectWidth * 0.01,
    y: bottomOffset,
  };
};

export default SkillEffect;

const styles = StyleSheet.create({
  effectLayer: {
    position: "absolute",
    zIndex: 20,
  },
});