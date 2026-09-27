import React from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const BattleFooter = ({
  timeLeft,
  timeLimit,
  onSurrender,
}) => {
  const timerPercent =
    timeLimit > 0 ? Math.max((timeLeft / timeLimit) * 100, 0) : 0;

  return (
    <View style={styles.footer}>
      <View style={styles.timerBox}>
        <View style={styles.timerTopRow}>
          <Text style={styles.timerLabel}>Time</Text>

          <View style={styles.timerRow}>
            <Text style={styles.timerIcon}>⌛</Text>
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
        </View>

        <View style={styles.timerOuter}>
          <View
            style={[
              styles.timerInner,
              {
                width: `${timerPercent}%`,
              },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.exitButton}
        onPress={onSurrender}
      >
        <Text style={styles.exitText}>Surrender</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BattleFooter;

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 48,
    backgroundColor: "#2B004F",
    borderTopWidth: 1.5,
    borderColor: "#6D28D9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  timerBox: {
    flex: 1,
    paddingRight: 10,
  },

  timerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "82%",
  },

  timerLabel: {
    color: "#BDB4D8",
    fontSize: 10,
    fontWeight: "700",
  },

  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  timerIcon: {
    fontSize: 15,
  },

  timerText: {
    color: "#4ADE80",
    fontSize: 13,
    fontWeight: "900",
  },

  timerOuter: {
    width: "82%",
    height: 5,
    backgroundColor: "#4C1D95",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 4,
  },

  timerInner: {
    height: "100%",
    backgroundColor: "#4ADE80",
    borderRadius: 999,
  },

  exitButton: {
    backgroundColor: "#E11D48",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: "#8B5CF6",
  },

  exitText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 10,
  },
});