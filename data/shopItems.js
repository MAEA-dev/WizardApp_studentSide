export const shopItems = [
  {
    id: "waterMage",
    sectionId: "skin-shop",
    type: "skin",
    title: "Water Mage",
    description: "A calm and focused water mage.",
    price: 20,
    image: require("../assets/images/waterMage.png"),
  },
  {
    id: "fireMage",
    sectionId: "skin-shop",
    type: "skin",
    title: "Fire Mage",
    description: "A bold mage with a fiery spirit.",
    price: 30,
    image: require("../assets/images/fireMage.png"),
  },
  {
    id: "powerCard",
    sectionId: "card-shop",
    type: "card",
    title: "Power Card",
    description: "A card that boosts your magical power.",
    price: 10,
    image: require("../assets/images/powerCard.png"),
  },
  {
    id: "shieldCard",
    sectionId: "card-shop",
    type: "card",
    title: "Shield Card",
    description: "A card that strengthens your defenses.",
    price: 10,
    image: require("../assets/images/shieldCard.png"),
  },
];

export const getShopItemById = (itemId) =>
  shopItems.find((item) => item.id === itemId) || null;
