import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";


export function HitShake({ hits, children, style }) {
  const shake = useRef(new Animated.Value(0)).current;
  const previousHits = useRef(hits);
  useEffect(() => {
    if (hits <= previousHits.current) {
      previousHits.current = hits;
      return;
    }
    previousHits.current = hits;
    shake.setValue(0);
    Animated.sequence(
      [-6, 6, -4, 4, 0].map((v) =>
        Animated.timing(shake, {
          toValue: v,
          duration: 45,
          useNativeDriver: true,
        }),
      ),
    ).start();
    return () => shake.stopAnimation();
  }, [hits, shake]);

  return (
    <Animated.View style={[style, { transform: [{ translateX: shake }] }]}>
      {children}
    </Animated.View>
  );
}