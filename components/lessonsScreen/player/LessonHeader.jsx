

import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../../constants/Fonts";

export default function LessonHeader({ title, xp }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextBox}>
        <Text style={styles.smallTitle}>Lesson Quest</Text>
        <Text style={styles.mainTitle}>{title}</Text>
      </View>

      <View style={styles.rewardBox}>
        <Ionicons name="flash" size={16} color="#FFD86B" />
        <Text style={styles.rewardText}>{xp} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  headerTextBox: {
    flex: 1,
  },

  smallTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFD86B",
    marginBottom: 2,
  },

  mainTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 24,
    color: "#FFFFFF",
  },

  rewardBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(25, 20, 58, 0.95)",
    borderWidth: 2,
    borderColor: "#FFD86B",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },

  rewardText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFFFFF",
  },
});