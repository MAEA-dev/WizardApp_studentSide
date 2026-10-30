import { useEffect, useRef, useState } from "react";
import { Image, View, StyleSheet } from "react-native";

export default function SpriteSheet({
  source,
  frameWidth = 128,
  frameHeight = 128,
  frameCount = 6,
  fps = 6,
  scale = 1,
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const timeoutRef = useRef(null);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    const frameSpeed = 1000 / fps;

    const clearCurrentTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const animate = () => {
      currentFrameRef.current += 1;

      if (currentFrameRef.current >= frameCount) {
        currentFrameRef.current = 0;
      }

      setFrameIndex(currentFrameRef.current);

      timeoutRef.current = setTimeout(animate, frameSpeed);
    };

    clearCurrentTimeout();

    currentFrameRef.current = 0;
    setFrameIndex(0);

    timeoutRef.current = setTimeout(animate, frameSpeed);

    return () => {
      clearCurrentTimeout();
    };
  }, [frameCount, fps]);

  return (
    <View
      style={[
        styles.frame,
        {
          width: frameWidth * scale,
          height: frameHeight * scale,
        },
      ]}
    >
      <Image
        source={source}
        style={{
          width: frameWidth * frameCount * scale,
          height: frameHeight * scale,
          transform: [
            {
              translateX: -frameIndex * frameWidth * scale,
            },
          ],
        }}
        resizeMode="stretch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
  },
});