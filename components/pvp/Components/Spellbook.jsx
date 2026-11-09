
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { SpellCard } from "./SpellCard";
import { HitShake } from "../Animation/HitShake";
import { CARDS, PER_PAGE } from "../battleConstants";
import { C } from "../PvpStyles";

export function Book({ s, onPlay }) {
  const [page, setPage] = useState(0);
  const { width, height } = useWindowDimensions();

  const pages = Math.ceil(CARDS.length / PER_PAGE);
  const mine = s.turn === "me" && s.me.hp > 0 && s.opp.hp > 0;

  const compact = height < 700 || width < 360;

  const bookWidth = Math.min(width - 16, 600);


  const cardHeight = Math.min(
    Math.max(height * 0.23, 125),
    200
  );


  const playerPower = s.me.power || 0;

  return (
    <HitShake hits={s.hits.me} style={styles.bookWrap}>
      <View
        style={[
          styles.book,
          {
            width: bookWidth,
            padding: compact ? 6 : 10,
          },
        ]}
      >
        {/* Book header */}
        <View style={styles.bookHead}>
          <Pressable
            onPress={() => setPage((p) => (p + pages - 1) % pages)}
            hitSlop={12}
          >
            <Text style={[styles.flip, compact && styles.compactFlip]}>
              ‹
            </Text>
          </Pressable>

          <Text style={[styles.bookTitle, compact && styles.compactTitle]}>
            Spellbook · page {page + 1} of {pages}
          </Text>

          <Pressable
            onPress={() => setPage((p) => (p + 1) % pages)}
            hitSlop={12}
          >
            <Text style={[styles.flip, compact && styles.compactFlip]}>
              ›
            </Text>
          </Pressable>
        </View>

        {/* Spell cards */}
        <View
          style={[
            styles.pageRow,
            {
              height: cardHeight,
              gap: compact ? 4 : 8,
              padding: compact ? 5 : 8,
            },
          ]}
        >
          {CARDS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map(
            (card) => {
              const enabled = mine && s.me.mana >= card.cost;

              return (
                <SpellCard
                  key={card.id}
                  card={card}
                  enabled={enabled}
                  onPlay={onPlay}
                  compact={compact}
                  power={playerPower}
                />
              );
            }
          )}
        </View>
      </View>
    </HitShake>
  );
}

const styles = StyleSheet.create({
  bookWrap: {
    flex: 7,
    flexShrink: 1,
    minHeight: 0,
    paddingHorizontal: 4,
    paddingBottom: 6,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  book: {
    maxWidth: "100%",
    backgroundColor: C.leather,
    borderRadius: 16,
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

  bookTitle: {
    color: C.gold,
    fontFamily: "serif",
    fontWeight: "700",
    fontSize: 13,
  },

  compactTitle: {
    fontSize: 10,
  },

  flip: {
    color: C.gold,
    fontSize: 30,
    paddingHorizontal: 10,
  },

  compactFlip: {
    fontSize: 23,
    paddingHorizontal: 5,
  },

  pageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: C.page,
    borderRadius: 8,
  },
});
