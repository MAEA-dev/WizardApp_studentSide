import { useRef, useState } from "react";
import { Animated, View, Text, StyleSheet, Pressable } from "react-native";
import { C } from "../PvpStyles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ---------- spellcard---------- */
export function SpellCard({ card, enabled, onPlay }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

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
        { borderColor: card.color, opacity: enabled ? 1 : 0.4 },
        {
          transform: [
            { scale },
            ...(pressed ? [{ translateY: -8 }] : []),
          ],
        },
      ]}
    >
      <View style={[styles.cost, { backgroundColor: card.color }]}>
        <Text style={styles.costTxt}>{card.cost}</Text>
      </View>
      <Text style={styles.cardIcon}>{card.icon}</Text>
      <Text style={styles.cardName}>{card.name}</Text>
      <Text style={styles.cardText}>{card.text}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
      card: {
        flex: 1,
        minHeight: 150,
        backgroundColor: "#fff8e6",
        borderRadius: 10,
        borderWidth: 3,
        padding: 6,
        alignItems: "center",
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
    },
    costTxt: { fontWeight: "800", color: C.ink },
    cardIcon: { fontSize: 38, marginTop: 14 },
    cardName: {
        color: C.ink,
        fontWeight: "800",
        marginTop: 6,
        textAlign: "center",
        fontSize: 13,
    },
    cardText: {
        color: "#5b4a35",
        fontSize: 11,
        marginTop: 4,
        textAlign: "center",
    },
});