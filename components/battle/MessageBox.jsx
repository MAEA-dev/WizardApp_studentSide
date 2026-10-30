import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import TypewriterText from "../shared/TypeWriterText";
import { Fonts } from "../../constants/Fonts";

const MessageBox = ({ message }) => {
  return (
    <View style={styles.messageBox}>
      <TypewriterText
        text={message}
        speed={30}
        style={styles.messageText}
      />
    </View>
  );
};

export default MessageBox;

const styles = StyleSheet.create({
  messageBox: {
    borderWidth: 1.5,
    borderColor: "#FFD84D",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#270047cf",
    minHeight: 50,
    justifyContent: "center",
    marginHorizontal: 10
  },

  messageText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 16
  },
});