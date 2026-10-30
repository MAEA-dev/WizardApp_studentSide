
import { StyleSheet, Text, View } from "react-native";
import { Fonts } from "../../../constants/Fonts";


export default function LessonProgress({ currentStepIndex, totalSteps, progress }) {
  return (
    <View style={styles.progressCard}>
      <View style={styles.progressTop}>
        <Text style={styles.progressLabel}>
          Step {currentStepIndex + 1} of {totalSteps}
        </Text>

        <Text style={styles.progressPercent}>{progress}%</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    backgroundColor: "rgba(25, 20, 58, 0.92)",
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#D8CFFF",
  },

  progressPercent: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: "#FFD86B",
  },

  progressBar: {
    height: 9,
    backgroundColor: "#2C245F",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FFD86B",
    borderRadius: 999,
  },
});