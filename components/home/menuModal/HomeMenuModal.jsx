import { Modal, StyleSheet, View, Alert } from "react-native";
import React, { useEffect, useState } from "react";

import { homeMenuModalData } from "../../../data/homeMenuModalData";
import MenuModalHeader from "./MenuModalHeader";
import MenuModalTabs from "./MenuModalTabs";
import MenuModalSection from "./MenuModalSection";

export default function HomeMenuModal({ visible, type, onClose }) {
  const content = homeMenuModalData[type];
  const sections = content?.sections;

  const [activeSectionId, setActiveSectionId] = useState(null);

  useEffect(() => {
    if (sections?.length > 0) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections]);

  if (!content) return null;

  const activeSection =
    content.sections.find((section) => section.id === activeSectionId) ||
    content.sections[0];

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
          onPress: () => {
            console.log("Buying item:", item.id);
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

          <MenuModalSection
            section={activeSection}
            onBuyPress={handleBuyPress}
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
});