import { View , StyleSheet} from "react-native";

export function Bar({ value, max, color }) {
  return (
    <View style={styles.barTrack}>
      <View
        style={[
          styles.barFill,
          { width: `${(value / max) * 100}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    barTrack: {
        height: 10,
        width: "100%",
        backgroundColor: "#0c0920",
        borderRadius: 5,
        overflow: "hidden",
    },
    barFill: { height: "100%" },

});