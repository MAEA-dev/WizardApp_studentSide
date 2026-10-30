import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { Fonts } from "../../constants/Fonts";

export default function HomeMenu({ items, layout, onMenuPress }) {
  const { isVerySmall } = layout;

  const iconSize = isVerySmall ? 42 : 52;

  const getCardWidth = () => {
    if (items.length <= 2) return "48%";
    return "31.5%";
  };

  return (
    <View
      style={[
        styles.menuContainer,
        {
          padding: isVerySmall ? 4 : 5,
          gap: isVerySmall ? 4 : 5,
        },
      ]}
    >
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          style={[
            styles.menuCard,
            {
              width: getCardWidth(),
              paddingVertical: isVerySmall ? 3 : 4,
              paddingHorizontal: isVerySmall ? 3 : 4,
            },
          ]}
          onPress={() => onMenuPress(item)}
        >
          <Image
            source={item.icon}
            style={{
              width: iconSize,
              height: iconSize,
            }}
            resizeMode="contain"
          />

          <Text style={styles.menuTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  menuCard: {
    borderColor: "#7557D9",
    backgroundColor: "rgba(25, 20, 58, 0.95)",
    borderWidth: 2,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  menuTitle: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#FFD86B",
    marginTop: 2,
    textAlign: "center",
  },
});