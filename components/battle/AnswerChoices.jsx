import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AnswerChoices = ({
  choices = [],
  answer,
  selectedAnswer,
  isAnswerLocked,
  onAnswerPress,
}) => {
  return (
    <View style={styles.choicesBox}>
      {choices.map((choice, index) => {
        const letter = String.fromCharCode(65 + index);
        const isSelected = selectedAnswer === choice;
        const isCorrectChoice = choice === answer;

        const choiceStyle = [
          styles.choiceButton,
          isAnswerLocked &&
            isSelected &&
            isCorrectChoice &&
            styles.correctChoice,
          isAnswerLocked &&
            isSelected &&
            !isCorrectChoice &&
            styles.wrongChoice,
          isAnswerLocked &&
            !isSelected &&
            isCorrectChoice &&
            styles.correctChoice,
        ];

        const choiceTextStyle = [
          styles.choiceText,
          isAnswerLocked &&
            isSelected &&
            isCorrectChoice &&
            styles.correctChoiceText,
          isAnswerLocked &&
            isSelected &&
            !isCorrectChoice &&
            styles.wrongChoiceText,
          isAnswerLocked &&
            !isSelected &&
            isCorrectChoice &&
            styles.correctChoiceText,
        ];

        return (
          <TouchableOpacity
            key={`${choice}_${index}`}
            activeOpacity={0.85}
            style={choiceStyle}
            onPress={() => onAnswerPress(choice)}
            disabled={isAnswerLocked}
          >
            <Text style={styles.choiceLetter}>{letter}</Text>
            <Text style={choiceTextStyle} numberOfLines={2}>
              {choice}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AnswerChoices;

const styles = StyleSheet.create({
  choicesBox: {
    gap: 7,
  },

  choiceButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: "#310057",
    borderWidth: 1.3,
    borderColor: "#6D28D9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  choiceLetter: {
    width: 24,
    color: "#FFE500",
    fontSize: 14,
    fontWeight: "900",
  },

  choiceText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },

  correctChoice: {
    backgroundColor: "#064E3B",
    borderColor: "#22C55E",
  },

  correctChoiceText: {
    color: "#BBF7D0",
  },

  wrongChoice: {
    backgroundColor: "#7F1D1D",
    borderColor: "#EF4444",
  },

  wrongChoiceText: {
    color: "#FECACA",
  },
});