import { HitShake } from "../Animation/HitShake";
import { Bar } from "./HealthBar";
import { View, Text, StyleSheet } from "react-native";
import { MAX_HP } from "../battleConstants";
import { C } from "../PvpStyles";




export function Stats({ p, label, align, hits, manaUses }) {
  return (
    <View style={{ alignItems: align, width: "100%" }}>
      <HitShake hits={hits} style={{ width: "100%" }}>
        <>
          <Text style={styles.name}>
            {label} {p.hp}/{MAX_HP}
            {p.sh ? `  🛡️${p.sh}` : ""}
          </Text>
          <Bar value={p.hp} max={MAX_HP} color={C.ember} />
        </>
      </HitShake>
      <HitShake hits={manaUses}>
        <Text style={styles.mana}>
          {"◆".repeat(p.mana)}
          <Text style={{ opacity: 0.25 }}>
            {"◇".repeat(Math.max(0, 6 - p.mana))}
          </Text>
        </Text>
      </HitShake>
    </View>
  );
}

const styles = StyleSheet.create({
    name: { color: "#fff", fontWeight: "700", marginBottom: 4 },
    mana: { color: C.teal, letterSpacing: 3, marginTop: 4, fontSize: 14 },
});