
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { SpellCard } from "./SpellCard";
import { HitShake } from "../Animation/HitShake";
import { CARDS, PER_PAGE } from "../battleConstants";
import { C } from "../PvpStyles";

export function Book({
  s,
  onPlay,
  shakeHits = s.hits.me,
  onShakeComplete,
}) {
  const { width, height } = useWindowDimensions();

  const mine = s.turn === "me" && s.me.hp > 0 && s.opp.hp > 0;

  const compact = height < 700 || width < 360;

  const bookWidth = Math.min(width - 16, 600);
  const bookPadding = compact ? 6 : 10;
  const rowPadding = compact ? 5 : 8;
  const cardGap = compact ? 4 : 8;
  const cardWidth =
    (bookWidth - bookPadding * 2 - 6 - rowPadding * 2 - cardGap * 2) /
      PER_PAGE +
    4;

  const cardHeight = Math.min(
    Math.max(height * 0.23, 125),
    200
  );

  const playerPower = s.me.power || 0;

  return (
    <HitShake
      hits={shakeHits}
      style={styles.bookWrap}
      onComplete={onShakeComplete}
    >
      <View
        style={[
          styles.book,
          {
            width: bookWidth,
            padding: bookPadding,
          },
        ]}
      >
        {/* Book header */}
        <View style={styles.bookHead}>
          <Text style={[styles.bookTitle, compact && styles.compactTitle]}>
            Spellbook
          </Text>
        </View>

        {/* Spell cards */}
        <View
          style={[
            styles.pageRow,
            {
              height: cardHeight,
              padding: rowPadding,
            },
          ]}
        >
          <ScrollView
            horizontal
            style={styles.cardScroll}
            showsHorizontalScrollIndicator
            contentContainerStyle={[styles.cardList, { gap: cardGap }]}
          >
            {CARDS.map((card) => {
              const enabled = mine && s.me.mana >= card.cost;

              return (
                <SpellCard
                  key={card.id}
                  card={card}
                  enabled={enabled}
                  onPlay={onPlay}
                  compact={compact}
                  power={playerPower}
                  style={{ width: cardWidth, flex: 0 }}
                />
              );
            })}
          </ScrollView>
        </View>
      </View>
    </HitShake>
  );
}

const styles = StyleSheet.create({
  bookWrap: {
    flexShrink: 0,
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
    justifyContent: "center",
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

  pageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: C.page,
    borderRadius: 8,
    overflow: "hidden",
  },

  cardList: {
    flexGrow: 1,
    alignItems: "stretch",
  },

  cardScroll: {
    flex: 1,
  },
});
