
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

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

  const {
    inventory,
    purchasingItemId,
    purchaseItem,
    equippingItemId,
    equipItem,
  } = useInventory({
    student,
    onStudentUpdated,
  });

  const {
    overall,
    pve,
    pvp,
    history,
    loading,
    error,
    refresh,
  } = useBattleStats({
    enabled: visible && type === "history",
  });

  const [activeSectionId, setActiveSectionId] = useState(null);

  // Custom confirmation / result modal state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState("confirm");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const firstSection = homeMenuModalData[type]?.sections[0];

    if (firstSection) {
      setActiveSectionId(firstSection.id);
    }
  }, [type]);

  const sections = useMemo(() => {
    if (!content) return [];

    if (type === "shop") {
      const ownedSkinIds = new Set(
        Array.isArray(student?.ownedSkins)
          ? student.ownedSkins
          : []
      );

      const gold = Number(student?.gold) || 0;

      return content.sections.map((section) => ({
        ...section,
        items: shopItems
          .filter(
            (item) =>
              item.sectionId === section.id &&
              item.type === "skin"
          )
          .map((item) => {
            const alreadyOwned = ownedSkinIds.has(item.id);
            const isPurchasing = purchasingItemId === item.id;

            return {
              ...item,
              available:
                !alreadyOwned &&
                gold >= item.price &&
                !purchasingItemId,
              buttonLabel: isPurchasing
                ? "BUYING"
                : alreadyOwned
                  ? "OWNED"
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
            : [],
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
            const date =
              entry.timestamp?.toDate?.() ||
              (entry.timestamp
                ? new Date(entry.timestamp)
                : null);

            const formattedDate =
              date && !Number.isNaN(date.getTime())
                ? date.toLocaleString()
                : "Date unavailable";

            const battleLabel =
              entry.battleType === "pvp" ? "PvP" : "Dungeon";

            return {
              id: entry.id || `${entry.result}-${index}`,
              title: `${
                entry.result === "won" ? "Victory" : "Defeat"
              } — ${entry.enemy || "Monster"}`,
              description: `${battleLabel} • ${formattedDate}`,
              status: entry.result === "won" ? "WON" : "LOST",
            };
          }),
        };
      }

      if (section.id === "win-rate") {
        const categories = [
          ["Overall", overall],
          ["PvE", pve],
          ["PvP", pvp],
        ];

        return {
          ...section,
          items: categories
            .filter(([, stats]) => stats.totalBattles > 0)
            .map(([label, stats]) => ({
              id: label.toLowerCase(),
              title: label,
              description: `${stats.wins} wins · ${stats.losses} losses`,
              status: `${stats.winRate}%`,
            })),
        };
      }

      return section;
    });
  }, [
    content,
    history,
    inventory.skins,
    overall,
    pve,
    pvp,
    purchasingItemId,
    student,
    type,
  ]);

  if (!content) return null;

  const activeSection =
    sections.find((section) => section.id === activeSectionId) ||
    sections[0];

  // Show custom dialog
  const showDialog = ({
    title,
    message,
    item,
    action,
    dialog = "confirm",
  }) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setSelectedItem(item || null);
    setPendingAction(() => action || null);
    setDialogType(dialog);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    if (actionLoading) return;

    setDialogVisible(false);
    setSelectedItem(null);
    setPendingAction(null);
  };

  // Purchase confirmation
  const handleBuyPress = (item) => {
    showDialog({
      title: "BUY WIZARD SKIN",
      message: `Do you want to buy ${item.title} for ${item.price} Gold?`,
      item,
      action: "purchase",
    });
  };

  // Equip confirmation
  const handleEquipPress = (item) => {
    if (equippingItemId) return;

    showDialog({
      title: "EQUIP WIZARD SKIN",
      message: `Do you want to equip ${item.title}?`,
      item,
      action: "equip",
    });
  };

  // Confirm purchase or equip
  const handleConfirmAction = async () => {
    if (!selectedItem || !pendingAction || actionLoading) return;

    setActionLoading(true);

    try {
      if (pendingAction === "purchase") {
        const result = await purchaseItem(selectedItem.id);

        setDialogType("success");
        setDialogTitle("PURCHASE COMPLETE");
        setDialogMessage(
          `${selectedItem.title} is now in your inventory!\n\n${result.student.gold} Gold remaining.`
        );
      }

      if (pendingAction === "equip") {
        await equipItem(selectedItem.id);

        setDialogType("success");
        setDialogTitle("SKIN EQUIPPED!");
        setDialogMessage(
          `${selectedItem.title} is now your active wizard skin.`
        );
      }

      setPendingAction(null);
    } catch (actionError) {
      setDialogType("error");
      setDialogTitle(
        pendingAction === "purchase"
          ? "PURCHASE FAILED"
          : "UNABLE TO EQUIP SKIN"
      );
      setDialogMessage(
        actionError?.message ||
          "Something went wrong. Please try again."
      );
      setPendingAction(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
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
                <Ionicons
                  name="ellipse"
                  size={14}
                  color="#FFD86B"
                />
                <Text style={styles.goldBalanceText}>
                  {Number(student?.gold) || 0} Gold
                </Text>
              </View>
            )}

            {activeSection && (
              <MenuModalSection
                section={activeSection}
                sectionType={type}
                onBuyPress={handleBuyPress}
                onEquipPress={handleEquipPress}
                equippingItemId={equippingItemId}
                loading={type === "history" && loading}
                error={type === "history" ? error : null}
                onRefresh={refresh}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Purchase / Equip Confirmation Modal */}
      <Modal
        visible={dialogVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDialog}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <View style={styles.dialogIconContainer}>
              <Ionicons
                name={
                  dialogType === "success"
                    ? "checkmark-circle"
                    : dialogType === "error"
                      ? "alert-circle"
                      : pendingAction === "purchase"
                        ? "bag-handle"
                        : "shirt"
                }
                size={38}
                color={
                  dialogType === "success"
                    ? "#55E6A5"
                    : dialogType === "error"
                      ? "#FF7777"
                      : "#FFD86B"
                }
              />
            </View>

            <Text style={styles.dialogTitle}>
              {dialogTitle}
            </Text>

            <Text style={styles.dialogMessage}>
              {dialogMessage}
            </Text>

            <View style={styles.dialogButtons}>
              {dialogType === "confirm" ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.cancelButton}
                    onPress={closeDialog}
                    disabled={actionLoading}
                  >
                    <Text style={styles.cancelButtonText}>
                      CANCEL
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.confirmButton}
                    onPress={handleConfirmAction}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#24194B" />
                    ) : (
                      <Text style={styles.confirmButtonText}>
                        {pendingAction === "purchase"
                          ? "BUY"
                          : "EQUIP"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.confirmButton}
                  onPress={closeDialog}
                >
                  <Text style={styles.confirmButtonText}>
                    CONTINUE
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
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

  // Dialog styles
  dialogBackdrop: {
    flex: 1,
    backgroundColor: "rgba(8, 4, 20, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  dialogCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(25, 20, 58, 0.99)",
    borderWidth: 3,
    borderColor: "#7557D9",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },

  dialogIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(117, 87, 217, 0.18)",
    borderWidth: 2,
    borderColor: "#7557D9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  dialogTitle: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    color: "#FFD86B",
    textAlign: "center",
    marginBottom: 12,
  },

  dialogMessage: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: "#E5DFFF",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  dialogButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#453B68",
    borderWidth: 2,
    borderColor: "#75699C",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFFFFF",
  },

  confirmButton: {
    flex: 1,
    backgroundColor: "#FFD86B",
    borderWidth: 2,
    borderColor: "#F2B83F",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#24194B",
  },
});
