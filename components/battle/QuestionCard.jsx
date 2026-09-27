import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Fonts } from "../../constant/Fonts";

const QuestionCard = ({ question }) => {
  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionTitle}>QUIZ QUESTION</Text>
      <Text style={styles.questionText}>{question}</Text>
    </View>
  );
};

export default QuestionCard;

const styles = StyleSheet.create({
  questionCard: {
    borderWidth: 1.5,
    borderColor: "#34D399",
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#2B004F",
    marginBottom: 10,
  },

  questionTitle: {
    fontFamily: Fonts.pixel,
    color: "#FFE500",
    fontSize: 9,
    textAlign: "center",
    marginBottom: 7,
  },

  questionText: {
    fontFamily: Fonts.bodyBold,
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
});