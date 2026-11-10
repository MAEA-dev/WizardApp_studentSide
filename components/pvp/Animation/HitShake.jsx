
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function HitShake({
  hits,
  children,
  style,
  onComplete,
}) {
  const shake = useRef(new Animated.Value(0)).current;
  const previousHits = useRef(hits);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (hits <= previousHits.current) {
      previousHits.current = hits;
      return;
    }

    previousHits.current = hits;
    shake.setValue(0);

    const animation = Animated.sequence(
      [-6, 6, -4, 4, 0].map((value) =>
        Animated.timing(shake, {
          toValue: value,
          duration: 45,
          useNativeDriver: true,
        })
      )
    );

    animation.start(({ finished }) => {
      if (finished) {
        onCompleteRef.current?.();
      }
    });

    return () => {
      animation.stop();
    };
  }, [hits, shake]);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: shake }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
