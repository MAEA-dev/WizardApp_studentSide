import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BattleResult = ({
  title,
  message,
  buttonText,
  onPress,
}) => {
  return (
    <View style={styles.resultBox}>
      <Text style={styles.resultTitle}>{title}</Text>
      <Text style={styles.resultMessage}>{message}</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.primaryButton}
        onPress={onPress}
      >
        <Text style={styles.primaryButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BattleResult;

const styles = StyleSheet.create({
  resultBox: {
    backgroundColor: "#2B004F",
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: "#FFD84D",
    alignItems: "center",
  },

  resultTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFE500",
  },

  resultMessage: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },

  primaryButton: {
    minHeight: 48,
    backgroundColor: "#7E22CE",
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});