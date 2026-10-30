import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Fonts } from "../../../constants/Fonts";

export default function LessonSummaryCard({
  lesson,
  earnedReward,
  alreadyCompleted = false,
}) {
  const summary = Array.isArray(lesson?.summary) ? lesson.summary : [];

  const earnedXp = earnedReward?.xp || 0;
  const earnedGold = earnedReward?.gold || 0;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons
          name={alreadyCompleted ? "refresh" : "trophy"}
          size={34}
          color="#FFD86B"
        />
      </View>

      <Text style={styles.summaryTitle}>
        {alreadyCompleted ? "Review Complete!" : "Lesson Complete!"}
      </Text>

      <Text style={styles.summaryMessage}>
        {alreadyCompleted
          ? "You already completed this lesson, so no extra XP or gold was added."
          : lesson?.finalMessage || "Great job! You completed the lesson."}
      </Text>

      <View style={styles.rewardRow}>
        <View style={styles.rewardItem}>
          <Ionicons name="flash" size={20} color="#FFD86B" />
          <Text style={styles.rewardItemText}>+{earnedXp} XP</Text>
        </View>

        <View style={styles.rewardItem}>
          <Ionicons name="ellipse" size={20} color="#FFD86B" />
          <Text style={styles.rewardItemText}>+{earnedGold} Gold</Text>
        </View>
      </View>

      <View style={styles.summaryList}>
        <Text style={styles.summarySubTitle}>What you learned</Text>

        {summary.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.summaryPoint}>
            <Ionicons name="checkmark-circle" size={18} color="#FFD86B" />
            <Text style={styles.summaryPointText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "rgba(25, 20, 58, 0.96)",
    borderWidth: 2,
    borderColor: "#FFD86B",
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
  },

  summaryIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "rgba(255, 216, 107, 0.16)",
    borderWidth: 2,
    borderColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  summaryTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 8,
  },

  summaryMessage: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#D8CFFF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },

  rewardRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 216, 107, 0.13)",
    borderWidth: 1,
    borderColor: "#FFD86B",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },

  rewardItemText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFD86B",
  },

  summaryList: {
    width: "100%",
    backgroundColor: "rgba(44, 36, 95, 0.65)",
    borderRadius: 20,
    padding: 14,
  },

  summarySubTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 10,
  },

  summaryPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 9,
    gap: 8,
  },

  summaryPointText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#D8CFFF",
    lineHeight: 19,
  },
});