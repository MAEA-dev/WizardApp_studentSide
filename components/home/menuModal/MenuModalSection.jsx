
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Fonts } from "../../../constants/Fonts";
import MenuModalItem from "./MenuModalItem";

export default function MenuModalSection({
  section,
  sectionType,
  onBuyPress,
  onEquipPress,
  equippingItemId,
  loading = false,
  error = null,
  onRefresh,
}) {
  if (!section) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons
          name={section.icon}
          size={19}
          color="#FFD86B"
        />
        <Text style={styles.sectionTitle}>
          {section.title}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFD86B" />
      ) : error ? (
        <View>
          <Text style={styles.emptyText}>{error}</Text>

          <TouchableOpacity
            onPress={onRefresh}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : section.items?.length > 0 ? (
        <ScrollView
          style={styles.itemsScroll}
          showsVerticalScrollIndicator
        >
          {section.items.map((item) => (
            <MenuModalItem
              key={item.id}
              item={item}
              sectionType={sectionType}
              onBuyPress={onBuyPress}
              onEquipPress={onEquipPress}
              isEquipping={equippingItemId === item.id}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>
          {section.emptyMessage || "No item yet."}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "rgba(44, 36, 95, 0.72)",
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: "#FFFFFF",
  },

  itemsScroll: {
    maxHeight: 200,
  },

  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#D8CFFF",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  retryText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFD86B",
  },
});
