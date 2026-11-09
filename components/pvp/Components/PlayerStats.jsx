
import { HitShake } from "../Animation/HitShake";
import { Bar } from "./HealthBar";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../PvpStyles";

export function Stats({ p, label, align, hits, manaUses }) {
  return (
    <View style={{ alignItems: align, width: "100%" }}>
        <>
          <Text style={styles.name}>
            {label} {p.hp}/{p.maxHp}
            {p.sh ? `  🛡️${p.sh}` : ""}
          </Text>

          <Bar
            value={p.hp}
            max={p.maxHp}
            color={C.ember}
          />
        </>    
        <Text style={styles.mana}>
          {"◆".repeat(p.mana)}
          <Text style={{ opacity: 0.25 }}>
            {"◇".repeat(Math.max(0, 6 - p.mana))}
          </Text>
        </Text>
   
    </View>
  );
}

const styles = StyleSheet.create({
  name: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 4,
  },

  mana: {
    color: C.teal,
    letterSpacing: 3,
    marginTop: 4,
    fontSize: 14,
  },
});
