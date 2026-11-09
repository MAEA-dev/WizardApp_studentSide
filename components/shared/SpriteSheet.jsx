
import { useEffect, useRef, useState } from "react";
import { Image, View, StyleSheet } from "react-native";

export default function SpriteSheet({
  source,
  frameWidth = 128,
  frameHeight = 128,
  frameCount = 6,
  fps = 6,
  scale = 1,
  loop = true,
  onComplete,
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const timeoutRef = useRef(null);
  const currentFrameRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let completed = false;
    const frameSpeed = 1000 / fps;

    currentFrameRef.current = 0;
    setFrameIndex(0);

    const animate = () => {
      const nextFrame = currentFrameRef.current + 1;

      if (nextFrame >= frameCount) {
        if (!loop) {
          completed = true;
          onCompleteRef.current?.();
          return;
        }

        currentFrameRef.current = 0;
      } else {
        currentFrameRef.current = nextFrame;
      }

      setFrameIndex(currentFrameRef.current);
      timeoutRef.current = setTimeout(animate, frameSpeed);
    };

    timeoutRef.current = setTimeout(animate, frameSpeed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [source, frameCount, fps, loop]);

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
