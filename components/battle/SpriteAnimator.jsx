import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

const SpriteAnimator = ({
  animations = {},
  action = "idle",

  width = 96,
  height = 96,
  scale = 1,

  fps = 10,
  loop = true,
  flipped = false,

  style,
  imageStyle,

  onAnimationFinish,
}) => {
  const intervalRef = useRef(null);
  const finishTimeoutRef = useRef(null);
  const finishedRef = useRef(false);

  const [frameIndex, setFrameIndex] = useState(0);

  const currentAnimation = useMemo(() => {
    return animations[action] || animations.idle || null;
  }, [animations, action]);

  const source = currentAnimation?.source;
  const frameCount = currentAnimation?.frameCount || 1;
  const frameWidth = currentAnimation?.frameWidth || width;
  const frameHeight = currentAnimation?.frameHeight || height;

  const animationFps = currentAnimation?.fps || fps;

  const animationLoop =
    typeof currentAnimation?.loop === "boolean"
      ? currentAnimation.loop
      : loop;

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
  };

  const safelyFinishAnimation = () => {
    if (finishedRef.current) return;

    finishedRef.current = true;

    finishTimeoutRef.current = setTimeout(() => {
      onAnimationFinish?.(action);
    }, 0);
  };

  useEffect(() => {
    clearTimers();
    setFrameIndex(0);
    finishedRef.current = false;

    return () => {
      clearTimers();
    };
  }, [action, source]);

  useEffect(() => {
    if (!source) return;

    clearTimers();

    if (frameCount <= 1) {
      if (!animationLoop) {
        safelyFinishAnimation();
      }

      return;
    }

    const intervalSpeed = 1000 / animationFps;

    intervalRef.current = setInterval(() => {
      setFrameIndex((currentFrame) => {
        const nextFrame = currentFrame + 1;

        if (nextFrame >= frameCount) {
          if (!animationLoop) {
            clearTimers();
            safelyFinishAnimation();

            return frameCount - 1;
          }

          return 0;
        }

        return nextFrame;
      });
    }, intervalSpeed);

    return () => {
      clearTimers();
    };
  }, [
    source,
    frameCount,
    animationFps,
    animationLoop,
    action,
  ]);

  if (!source) {
    return null;
  }

  const scaledWidth = frameWidth * scale;
  const scaledHeight = frameHeight * scale;

  return (
    <View
      style={[
        styles.spriteWindow,
        {
          width: scaledWidth,
          height: scaledHeight,
          transform: [
            {
              scaleX: flipped ? -1 : 1,
            },
          ],
        },
        style,
      ]}
    >
      <Image
        source={source}
        resizeMode="stretch"
        style={[
          {
            width: frameWidth * frameCount * scale,
            height: scaledHeight,
            transform: [
              {
                translateX: -frameIndex * scaledWidth,
              },
            ],
          },
          imageStyle,
        ]}
      />
    </View>
  );
};

export default SpriteAnimator;

const styles = StyleSheet.create({
  spriteWindow: {
    overflow: "hidden",
  },
});