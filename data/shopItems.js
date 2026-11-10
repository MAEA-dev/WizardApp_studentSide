import { getAllWizardAvatars } from "../constants/wizardAvatars";

export const shopItems = getAllWizardAvatars()
  .filter((mage) => mage.shop)
  .map((mage) => ({
    id: mage.id,
    sectionId: "skin-shop",
    type: "skin",
    title: mage.name,
    description: mage.description || "",
    price: mage.shop.price,
    image: mage.shop.image,
  }));

export const getShopItemById = (itemId) =>
  shopItems.find((item) => item.id === itemId) || null;