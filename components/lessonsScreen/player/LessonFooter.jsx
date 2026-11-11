import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

import { Fonts } from "../../../constants/Fonts";

const LessonFooter = ({
  showSummary,
  canGoNext,
  isLastStep,
  isCompleting = false,
  completionError = null,
  onNext,
  onBack,
}) => {
  const buttonText = showSummary
    ? "Back to Lessons"
    : isLastStep
    ? isCompleting
      ? "Saving..."
      : completionError
      ? "Retry Save"
      : "Finish"
    : "Next";

  const handlePress = showSummary ? onBack : onNext;
  const disabled = (!showSummary && !canGoNext) || isCompleting;

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.button,
          disabled && styles.disabledButton,
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>

        {!showSummary && (
          <Ionicons name="arrow-forward" size={18} color="#130B2B" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LessonFooter;

const styles = StyleSheet.create({
  footer: {
    paddingTop: 10,
    paddingBottom: 10,
  },

  button: {
    width: "100%",
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  buttonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: "#130B2B",
  },

  disabledButton: {
    opacity: 0.45,
  },
});
