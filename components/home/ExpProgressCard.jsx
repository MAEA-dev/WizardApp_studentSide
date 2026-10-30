import { StyleSheet, Text, View } from "react-native";
import React from "react";

import { Fonts } from "../../constants/Fonts";

const ExpProgressCard = ({
  xp = 0,
  maxXp = 150,
  expPercent = 0,
}) => {
  const safePercent = Math.min(Math.max(expPercent, 0), 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>

          <Text style={styles.label}>EXP Progress</Text>
        </View>

        <View style={styles.expRow}>
          <Text style={styles.currentXp}>{xp}</Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.maxXp}>{maxXp}</Text>
        </View>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${safePercent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

export default ExpProgressCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(25, 20, 58, 0.96)",
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  titleRow: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  label: {
   
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    
  },

  expRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  currentXp: {
    fontFamily: Fonts.pixel,
    fontSize: 12,
    color: "#FFD86B",
  },

  separator: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: "#D8CFFF",
  },

  maxXp: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: "#FFFFFF",
  },

  track: {
    width: "100%",
    height: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(117, 87, 217, 0.9)",
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFD86B",
  },
});