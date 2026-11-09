
import { useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

import { C } from "../PvpStyles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpellCard({
  card,
  enabled,
  onPlay,
  compact = false,
  power = 0,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const iconSize = compact ? 25 : 36;
  const nameSize = compact ? 10 : 13;
  const descriptionSize = compact ? 8 : 11;

  // Add the player's Magic Power to offensive spells.
  const magicPower = Math.max(0, Number(power) || 0);
  const totalDamage = card.dmg
    ? card.dmg + magicPower
    : 0;

  const play = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.06,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 110,
        useNativeDriver: true,
      }),
    ]).start();

    onPlay(card.id);
  };

  return (
    <AnimatedPressable
      disabled={!enabled}
      onPress={play}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        {
          borderColor: card.color,
          opacity: enabled ? 1 : 0.4,
          padding: compact ? 4 : 6,
        },
        {
          transform: [
            { scale },
            { translateY: pressed ? -5 : 0 },
          ],
        },
      ]}
    >
      {/* Mana cost */}
      <View style={[styles.cost, { backgroundColor: card.color }]}>
        <Text style={styles.costTxt}>{card.cost}</Text>
      </View>

      {/* Spell icon */}
      <Text
        style={[
          styles.cardIcon,
          { fontSize: iconSize },
        ]}
      >
        {card.icon}
      </Text>

      {/* Spell name */}
      <Text
        style={[
          styles.cardName,
          { fontSize: nameSize },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {card.name}
      </Text>

      {/* Spell description */}
      <Text
        style={[
          styles.cardText,
          { fontSize: descriptionSize },
        ]}
        numberOfLines={3}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {card.text}
      </Text>

      {/* Magic Power bonus and final damage */}
      {card.dmg > 0 && (
        <View style={styles.damageContainer}>
          <Text style={styles.damageText}>
            ⚔️ {card.dmg}
            {magicPower > 0 ? ` + ${magicPower}` : ""}
          </Text>

          <Text style={styles.totalDamage}>
            {totalDamage} DMG
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    backgroundColor: "#fff8e6",
    borderRadius: 10,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  cost: {
    position: "absolute",
    top: -8,
    left: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  costTxt: {
    fontWeight: "800",
    color: C.ink,
    fontSize: 12,
  },

  cardIcon: {
    marginTop: 8,
    textAlign: "center",
  },

  cardName: {
    color: C.ink,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center",
  },

  cardText: {
    color: "#5b4a35",
    marginTop: 4,
    textAlign: "center",
  },

  damageContainer: {
    alignItems: "center",
    marginTop: 5,
  },

  damageText: {
    color: "#b45309",
    fontSize: 10,
    fontWeight: "700",
  },

  totalDamage: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
  },
});
