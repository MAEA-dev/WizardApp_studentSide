import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

import { Fonts } from "../../constants/Fonts";

const LessonCard = ({ lesson, onPress }) => {
  const completed = !!lesson.completed;
  const completedData = lesson.completedData;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={[styles.card, completed && styles.completedCard]}
      onPress={onPress}
    >
      <View style={[styles.iconBox, completed && styles.completedIconBox]}>
        <Ionicons
          name={completed ? "checkmark-circle" : "book-outline"}
          size={26}
          color={completed ? "#64E6A8" : "#FFD86B"}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {lesson.title}
          </Text>

          {completed && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DONE</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {lesson.description}
        </Text>

        {completed ? (
          <View style={styles.completedInfo}>
            <Text style={styles.completedText}>
              Score {completedData?.percentage || 0}%
            </Text>

            <Text style={styles.completedText}>
              +{completedData?.xpEarned || 0} XP
            </Text>

            <Text style={styles.completedText}>
              +{completedData?.goldEarned || 0} Gold
            </Text>
          </View>
        ) : (
          <Text style={styles.startText}>Tap to start quest</Text>
        )}
      </View>

      <Ionicons
        name={completed ? "refresh-outline" : "chevron-forward"}
        size={22}
        color="#D8CFFF"
      />
    </TouchableOpacity>
  );
};

export default LessonCard;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(25, 20, 58, 0.94)",
    borderWidth: 1.5,
    borderColor: "#7557D9",
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
  },

  completedCard: {
    borderColor: "#64E6A8",
    backgroundColor: "rgba(23, 58, 54, 0.9)",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(255, 216, 107, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  completedIconBox: {
    backgroundColor: "rgba(100, 230, 168, 0.14)",
  },

  content: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    flex: 1,
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: "#FFFFFF",
  },

  badge: {
    backgroundColor: "rgba(100, 230, 168, 0.16)",
    borderWidth: 1,
    borderColor: "#64E6A8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  badgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 9,
    color: "#64E6A8",
  },

  description: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: "#D8CFFF",
    marginTop: 4,
    lineHeight: 16,
  },

  completedInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  completedText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: "#64E6A8",
  },

  startText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: "#FFD86B",
    marginTop: 8,
  },
});