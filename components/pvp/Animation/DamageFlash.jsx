import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export function DamageFlash({
  hits,
  spellKey,
  type = "damage",
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  const previousHits = useRef(hits);
  const previousSpellKey = useRef(spellKey);

  useEffect(() => {
    const tookDamage = hits > previousHits.current;
    const newHeal =
      type === "heal" &&
      spellKey != null &&
      spellKey !== previousSpellKey.current;

    previousHits.current = hits;
    previousSpellKey.current = spellKey;

    if (!tookDamage && !newHeal) return;

    opacity.stopAnimation();
    opacity.setValue(0);

    const isCritical = type === "critical";
    const isHeal = newHeal;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: isHeal ? 0.25 : isCritical ? 0.55 : 0.35,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: isHeal ? 450 : isCritical ? 500 : 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hits, spellKey, type, opacity]);

  const flashColor =
    type === "heal"
      ? "#39FF88"
      : type === "critical"
      ? "#FF4500"
      : "#FF0000";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        styles.flash,
        {
          backgroundColor: flashColor,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  flash: {
    zIndex: 9999,
    elevation: 9999,
  },
});