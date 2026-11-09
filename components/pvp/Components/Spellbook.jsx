import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SpellCard } from "./SpellCard";
import { HitShake } from "../Animation/HitShake";
import { CARDS, PER_PAGE } from "../battleConstants";
import { C } from "../PvpStyles";





export function Book({ s, onPlay }) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(CARDS.length / PER_PAGE);
  const mine = s.turn === "me" && s.me.hp > 0 && s.opp.hp > 0;
  return (
    <HitShake hits={s.hits.me} style={styles.bookWrap}>
      <View style={styles.book}>
        <View style={styles.bookHead}>
          <Pressable
            onPress={() => setPage((p) => (p + pages - 1) % pages)}
            hitSlop={12}
          >
            <Text style={styles.flip}>‹</Text>
          </Pressable>
          <Text style={styles.bookTitle}>
            Spellbook · page {page + 1} of {pages}
          </Text>
          <Pressable
            onPress={() => setPage((p) => (p + 1) % pages)}
            hitSlop={12}
          >
            <Text style={styles.flip}>›</Text>
          </Pressable>
        </View>
        <View style={styles.pageRow}>
          {CARDS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map((c) => {
            const ok = mine && s.me.mana >= c.cost;
            return (
              <SpellCard key={c.id} card={c} enabled={ok} onPlay={onPlay} />
            );
          })}
        </View>
      </View>
    </HitShake>
  );
}
const styles = StyleSheet.create({
    bookWrap: {
    flex: 5,
    paddingHorizontal: 8,
    paddingBottom: 6,
    justifyContent: "flex-end",
  },
  book: {
    backgroundColor: C.leather,
    borderRadius: 16,
    padding: 10,
    borderWidth: 3,
    borderColor: C.leatherLo,
    transform: [{ perspective: 700 }, { rotateX: "14deg" }],
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  bookHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  bookTitle: { color: C.gold, fontFamily: "serif", fontWeight: "700" },
  flip: { color: C.gold, fontSize: 30, paddingHorizontal: 10 },
  pageRow: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: C.page,
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
  },
});