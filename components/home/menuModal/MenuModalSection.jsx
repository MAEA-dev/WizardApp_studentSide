import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../../constants/Fonts";
import MenuModalItem from "./MenuModalItem";

export default function MenuModalSection({ section, onBuyPress }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={section.icon} size={19} color="#FFD86B" />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>

      {section.items?.length > 0 ? (
        section.items.map((item) => (
          <MenuModalItem
            key={item.id}
            item={item}
            sectionType={section.type}
            onBuyPress={onBuyPress}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>no item yet.</Text>
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

  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#D8CFFF",
  },
});