
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../../constants/Fonts";

export default function MenuModalItem({
  item,
  sectionType,
  onBuyPress,
  onEquipPress,
  isEquipping = false
}) {
  const isShopItem = sectionType === "shop";
  const isInventoryItem = sectionType === "inventory";
  const hasImage = !!item.image;

  return (
    <View style={styles.itemCard}>
      {hasImage && (
        <View style={styles.imageBox}>
          <Image
            source={item.image}
            style={styles.itemImage}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>

        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {isShopItem && (
          <View style={styles.priceRow}>
            <Ionicons name="ellipse" size={13} color="#FFD86B" />
            <Text style={styles.priceText}>{item.price} Gold</Text>
          </View>
        )}
      </View>

      {isShopItem ? (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.buyButton,
            !item.available && styles.disabledBuyButton,
          ]}
          onPress={() => onBuyPress?.(item)}
          disabled={!item.available}
        >
          <Text style={styles.buyButtonText}>
            {item.buttonLabel || (item.available ? "BUY" : "SOLD")}
          </Text>
        </TouchableOpacity>
      ) : isInventoryItem ? (
        <TouchableOpacity
              activeOpacity={0.85}
              style={[
                  styles.equipButton,
                  (item.isEquipped || isEquipping) && styles.equippedButton,
                  ]}
                onPress={() => onEquipPress?.(item)}
                disabled={item.isEquipped || isEquipping}
                >
              <Text style={styles.equipButtonText}>
                {item.isEquipped
                   ? "EQUIPPED"
                      : isEquipping
                      ? "EQUIPPING..."
                      : "EQUIP"}
              </Text>
          </TouchableOpacity>
      ) : (
        !!item.status && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: "rgba(19, 11, 43, 0.75)",
    borderWidth: 1,
    borderColor: "#BFA7FF",
    borderRadius: 15,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  imageBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(255, 216, 107, 0.12)",
    borderWidth: 1,
    borderColor: "#FFD86B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },

  itemImage: {
    width: "90%",
    height: "90%",
  },

  itemInfo: {
    flex: 1,
  },

  itemTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: "#FFFFFF",
    marginBottom: 2,
  },

  itemDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: "#D8CFFF",
    lineHeight: 15,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },

  priceText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    color: "#FFD86B",
  },

  buyButton: {
    backgroundColor: "#FFD86B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginLeft: 8,
  },

  disabledBuyButton: {
    opacity: 0.45,
  },

  buyButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#21103F",
  },

  equipButton: {
    backgroundColor: "#2c940d",
    borderWidth: 2,
    borderColor: "#ebdd19",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginLeft: 8,
  },

  equippedButton: {
    backgroundColor: "#374151",
    borderColor: "#9CA3AF",
    opacity: 0.8,
  },

  equipButtonText: {
    fontFamily: Fonts.pixel,
    fontSize: 8,
    color: "#FFFFFF",
  },

  statusBadge: {
    backgroundColor: "rgba(255, 216, 107, 0.14)",
    borderWidth: 1,
    borderColor: "#FFD86B",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },

  statusText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 9,
    color: "#FFD86B",
  },
});
