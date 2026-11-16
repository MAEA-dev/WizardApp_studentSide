import { StyleSheet, Text, View } from "react-native";
import { Fonts } from "../../constants/Fonts";

export default function StatsRow({ stats, layout }) {
  const { statHeight, isVerySmall } = layout;

  return (
    <View
      style={[
        styles.statsRow,
        {
          gap: isVerySmall ? 5 : 7,
          marginBottom: isVerySmall ? 7 : 9,
        },
      ]}
    >
      {stats.map((stat) => (
        <View
          key={stat.id}
          style={[
            styles.statBox,
            stat.type === "hp" && styles.hpBox,
            stat.type === "power" && styles.powerBox,
            {
              height: statHeight,
            },
          ]}
        >
          <Text style={styles.statIcon}>{stat.icon}</Text>
          <Text style={styles.statValue}>
            {stat.label}: {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statBox: {
    width: "48%",
    backgroundColor: "rgba(20, 18, 47, 0.94)",
    borderWidth: 2,
    borderRadius: 11,
    paddingHorizontal: 4,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  hpBox: {
    borderColor: "#FF4F75",
  },

  powerBox: {
    borderColor: "#FFD447",
  },

  statIcon: {
    fontSize: 17,
  },

  statValue: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: "#FFFFFF",
    textAlign: "center",
    transform: [{ translateY: 2 }],
  },
});
