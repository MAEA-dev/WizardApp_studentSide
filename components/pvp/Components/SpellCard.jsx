import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { C } from "../PvpStyles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SpellCard({
  card,
  enabled,
  onPlay,
  compact = false,
  power = 0,
  style: cardStyle,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const { width, height } = useWindowDimensions();

  // Responsive sizing
  const iconSize = Math.max(20, Math.min(width * 0.085, compact ? 29 : 38));

  const nameSize = Math.max(9, Math.min(width * 0.032, compact ? 11 : 14));

  const descriptionSize = Math.max(
    7,
    Math.min(width * 0.027, compact ? 9 : 12),
  );

  const totalDamageSize = Math.max(10, Math.min(width * 0.033, 13));

  const verticalSpacing = height < 700 ? 2 : 5;

  // Card damage is a multiplier of the player's Magic Power.
  const magicPower = Math.max(0, Number(power) || 0);
  const totalDamage = card.dmg ? magicPower * card.dmg : 0;

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
        cardStyle,
        {
          borderColor: card.color,
          opacity: enabled ? 1 : 0.4,
          padding: compact ? 4 : 6,
        },
        {
          transform: [{ scale }, { translateY: pressed ? -5 : 0 }],
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
          {
            fontSize: iconSize,
            marginTop: verticalSpacing + 5,
          },
        ]}
      >
        {card.icon}
      </Text>

      {/* Spell name */}
      <Text
        style={[
          styles.cardName,
          {
            fontSize: nameSize,
            marginTop: verticalSpacing,
          },
        ]}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {card.name}
      </Text>

      {/* Spell description */}
      <Text
        style={[
          styles.cardText,
          {
            fontSize: descriptionSize,
            marginTop: verticalSpacing,
          },
        ]}
        numberOfLines={3}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
      >
        {card.text}
      </Text>

      {/* Total damage */}
      {card.dmg > 0 && (
        <View style={[styles.damageContainer, { marginTop: verticalSpacing }]}>
          <Text style={[styles.totalDamage, { fontSize: totalDamageSize }]}>
            ⚔️ {Number(totalDamage.toFixed(2))}
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
    textAlign: "center",
  },

  cardName: {
    color: C.ink,
    fontWeight: "800",
    textAlign: "center",
  },

  cardText: {
    color: "#5b4a35",
    textAlign: "center",
  },

  damageContainer: {
    alignItems: "center",
  },

  totalDamage: {
    color: "#dc2626",
    fontWeight: "900",
    marginTop: 2,
  },
});
