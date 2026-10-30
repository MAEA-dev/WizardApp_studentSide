import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import React from "react";

import { Fonts } from "../../../constants/Fonts";

const LessonCenterMessage = ({
  loading = false,
  error = false,
  message,
  buttonText,
  onButtonPress,
}) => {
  return (
    <View style={styles.card}>
      {loading && <ActivityIndicator size="large" color="#FFD86B" />}

      <Text style={error ? styles.errorText : styles.messageText}>
        {message}
      </Text>

      {!!buttonText && (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.button}
          onPress={onButtonPress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default LessonCenterMessage;

const styles = StyleSheet.create({
  card: {
    margin: 18,
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "rgba(25, 20, 58, 0.9)",
    borderWidth: 1.5,
    borderColor: "#7557D9",
  },

  messageText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },

  errorText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FF8A8A",
    textAlign: "center",
  },

  button: {
    backgroundColor: "#FFD86B",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 14,
  },

  buttonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#130B2B",
  },
});