import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, StyleSheet, Text, View } from "react-native";

import { Fonts } from "../../../constants/Fonts";
import { homeMenuModalData } from "../../../data/homeMenuModalData";
import { shopItems } from "../../../data/shopItems";
import { useBattleStats } from "../../../hooks/useBattleStats";
import { useInventory } from "../../../hooks/useInventory";
import MenuModalHeader from "./MenuModalHeader";
import MenuModalSection from "./MenuModalSection";
import MenuModalTabs from "./MenuModalTabs";

export default function HomeMenuModal({
  visible,
  type,
  onClose,
  student,
  onStudentUpdated,
}) {
  const content = homeMenuModalData[type];
  const { inventory, purchasingItemId, purchaseItem } = useInventory({
    student,
    onStudentUpdated,
  });
  const {
    wins,
    losses,
    totalBattles,
    winRate,
    history,
    loading,
    error,
    refresh,
  } = useBattleStats({ enabled: visible && type === "history" });

  const [activeSectionId, setActiveSectionId] = useState(null);

  useEffect(() => {
    const firstSection = homeMenuModalData[type]?.sections[0];

    if (firstSection) {
      setActiveSectionId(firstSection.id);
    }
  }, [type]);

  const sections = useMemo(() => {
    if (!content) {
      return [];
    }

    if (type === "shop") {
      const ownedSkinIds = new Set(
        Array.isArray(student?.ownedSkins) ? student.ownedSkins : []
      );
      const gold = Number(student?.gold) || 0;

      return content.sections.map((section) => ({
        ...section,
        items: shopItems
          .filter((item) => item.sectionId === section.id)
          .map((item) => {
            // For skins
            const alreadyOwned =
              item.type === "skin" && ownedSkinIds.has(item.id);
            const isPurchasing = purchasingItemId === item.id;

            // For cards
            const ownedCards = Array.isArray(student?.ownedCards)
              ? student.ownedCards
              : [];

            const cardCount = ownedCards.filter(
              (cardId) => cardId === item.id
            ).length;

            const maxCopiesReached =
              item.type === "card" &&
              cardCount >= 3;

            return {
              ...item,
              available:
                !alreadyOwned && !maxCopiesReached && gold >= item.price && !purchasingItemId,
              buttonLabel: isPurchasing
                ? "BUYING"
                : alreadyOwned
                  ? "OWNED"
                  : maxCopiesReached
                    ? "MAX"
                    : gold < item.price
                      ? "NEED GOLD"
                      : "BUY",
            };
          }),
      }));
    }

    if (type === "inventory") {
      return content.sections.map((section) => ({
        ...section,
        items:
          section.id === "skin-inventory"
            ? inventory.skins
            : inventory.cards,
      }));
    }

    if (type !== "history") {
      return content.sections;
    }

    return content.sections.map((section) => {
      if (section.id === "battle-history") {
        return {
          ...section,
          items: history.map((entry, index) => {
            const date = entry.timestamp?.toDate?.() ||
              (entry.timestamp ? new Date(entry.timestamp) : null);
            const formattedDate =
              date && !Number.isNaN(date.getTime())
                ? date.toLocaleString()
                : "Date unavailable";
            const battleLabel =
              entry.battleType === "pvp" ? "PvP" : "Dungeon";

            return {
              id: entry.id || `${entry.result}-${index}`,
              title: `${entry.result === "won" ? "Victory" : "Defeat"} — ${
                entry.enemy || "Monster"
              }`,
              description: `${battleLabel} • ${formattedDate}`,
              status: entry.result === "won" ? "WON" : "LOST",
            };
          }),
        };
      }

      if (section.id === "win-rate") {
        return {
          ...section,
          items:
            totalBattles === 0
              ? []
              : [
                  {
                    id: "wins",
                    title: `${wins} Wins`,
                    description: "Total battles won.",
                    status: String(wins),
                  },
                  {
                    id: "losses",
                    title: `${losses} Losses`,
                    description: "Total battles lost.",
                    status: String(losses),
                  },
                  {
                    id: "rate",
                    title: `${winRate}% Win Rate`,
                    description: "Current battle performance.",
                    status: `${winRate}%`,
                  },
                ],
        };
      }

      return section;
    });
  }, [
    content,
    history,
    inventory.cards,
    inventory.skins,
    losses,
    purchasingItemId,
    student,
    totalBattles,
    type,
    winRate,
    wins,
  ]);

  if (!content) return null;

  const activeSection =
    sections.find((section) => section.id === activeSectionId) || sections[0];

  const handleBuyPress = (item) => {
    Alert.alert(
      "Buy Item",
      `Buy ${item.title} for ${item.price} gold?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Buy",
          onPress: async () => {
            try {
              const result = await purchaseItem(item.id);
              Alert.alert(
                "Purchase complete",
                `${item.title} is now in your inventory. ${result.student.gold} gold remaining.`
              );
            } catch (purchaseError) {
              // console.error("Purchase shop item error:", purchaseError);
              Alert.alert(
                "Purchase failed",
                purchaseError?.message || "The item could not be purchased."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <MenuModalHeader
            title={content.title}
            subtitle={content.subtitle}
            icon={content.icon}
            onClose={onClose}
          />

          <MenuModalTabs
            sections={content.sections}
            activeSectionId={activeSectionId}
            onTabPress={setActiveSectionId}
          />

          {type === "shop" && (
            <View style={styles.goldBalance}>
              <Ionicons name="ellipse" size={14} color="#FFD86B" />
              <Text style={styles.goldBalanceText}>
                {Number(student?.gold) || 0} Gold
              </Text>
            </View>
          )}

          <MenuModalSection
            section={activeSection}
            onBuyPress={handleBuyPress}
            loading={type === "history" && loading}
            error={type === "history" ? error : null}
            onRefresh={refresh}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 4, 20, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  modalCard: {
    width: "100%",
    maxHeight: "78%",
    backgroundColor: "rgba(25, 20, 58, 0.98)",
    borderWidth: 3,
    borderColor: "#7557D9",
    borderRadius: 26,
    padding: 16,
  },

  goldBalance: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 5,
    marginTop: -4,
    marginBottom: 8,
  },

  goldBalanceText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFD86B",
  },
});