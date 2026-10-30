import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Fonts } from "../../constants/Fonts";

export default function DailyTaskCard({ task, layout, onPress }) {
  const { isVerySmall } = layout;

  return (
    <View
      style={[
        styles.dailyTask,
        {
          padding: isVerySmall ? 8 : 10,
          marginBottom: isVerySmall ? 7 : 9,
        },
      ]}
    >
      <View style={styles.taskIconBox}>
        <Text style={styles.taskIcon}>📜</Text>
      </View>

      <View style={styles.taskTextBox}>
        <Text style={styles.dailyTitle}>{task.title}</Text>
        <Text style={styles.dailyText} numberOfLines={2}>
          {task.description}
        </Text>
      </View>

      <TouchableOpacity style={styles.goButton} onPress={onPress}>
        <Text style={styles.goButtonText}>GO!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dailyTask: {
    backgroundColor: "rgba(25, 20, 58, 0.95)",
    marginTop: 15,
    borderWidth: 2,
    borderColor: "#7557D9",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  taskIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(255, 216, 107, 0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  taskIcon: {
    fontSize: 22,
  },

  taskTextBox: {
    flex: 1,
  },

  dailyTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 10,
    color: "#FFD86B",
    marginBottom: 4,
  },

  dailyText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: "#FFFFFF",
    lineHeight: 14,
  },

  goButton: {
    backgroundColor: "#FFD86B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginLeft: 7,
  },

  goButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#24133F",
  },
});