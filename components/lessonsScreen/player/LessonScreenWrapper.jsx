import { ImageBackground, StyleSheet, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const LessonScreenWrapper = ({ children }) => {
  return (
    <ImageBackground
      source={require("../../../assets/images/lessonsBg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.overlay}>{children}</View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LessonScreenWrapper;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(19, 11, 43, 0.52)",
  },
});