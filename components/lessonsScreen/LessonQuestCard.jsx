import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

import { Fonts } from "../../constants/Fonts";

const LessonQuestCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="sparkles" size={30} color="#FFD86B" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Choose a Subject</Text>
        <Text style={styles.description}>
          Pick a subject, open its lessons, and earn XP for your wizard.
        </Text>
      </View>
    </View>
  );
};

export default LessonQuestCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#7557d9e6",
    borderWidth: 2,
    borderColor: "#BFA7FF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    marginTop: 20
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "rgba(255, 216, 107, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  content: {
    flex: 1,
  },

  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 4,
  },

  description: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#EDE7FF",
    lineHeight: 18,
  },
});