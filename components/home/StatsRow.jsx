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
            stat.type === "energy" && styles.energyBox,
            {
              height: statHeight,
            },
          ]}
        >
          <Text style={styles.statIcon}>{stat.icon}</Text>

          <View style={styles.statTextArea}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
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
    width: "30%",
    backgroundColor: "rgba(20, 18, 47, 0.94)",
    borderWidth: 2,
    borderRadius: 11,
    paddingHorizontal: 6,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  hpBox: {
    borderColor: "#FF4F75",
  },

  powerBox: {
    borderColor: "#FFD447",
  },

  energyBox: {
    borderColor: "#38BDF8",
  },

  statIcon: {
    fontSize: 15,
    marginRight: 4,
  },

  statTextArea: {
    alignItems: "flex-start",
  },

  statLabel: {
    fontFamily: Fonts.pixel,
    fontSize: 7,
    color: "#FFFFFF",
    marginBottom: 3,
  },

  statValue: {
    fontFamily: Fonts.pixel,
    fontSize: 9,
    color: "#FFFFFF",
  },
});