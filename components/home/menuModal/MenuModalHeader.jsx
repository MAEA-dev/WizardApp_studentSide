import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../../constants/Fonts";

export default function MenuModalHeader({ title, subtitle, icon, onClose }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={28} color="#FFD86B" />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.closeButton}
        onPress={onClose}
      >
        <Ionicons name="close" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255, 216, 107, 0.14)",
    borderWidth: 2,
    borderColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  textBox: {
    flex: 1,
  },

  title: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: "#FFD86B",
  },

  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: "#D8CFFF",
    marginTop: 2,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
});