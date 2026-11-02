import { shopItems } from "../data/shopItems";

const getOwnedIds = (value) => (Array.isArray(value) ? value : []);

export const getOwnedInventory = (studentData = {}) => {
  const ownedSkins = getOwnedIds(studentData.ownedSkins);
  const ownedCards = getOwnedIds(studentData.ownedCards);
  const cardCounts = ownedCards.reduce((counts, itemId) => {
    counts[itemId] = (counts[itemId] || 0) + 1;
    return counts;
  }, {});

  return {
    skins: shopItems
      .filter((item) => item.type === "skin" && ownedSkins.includes(item.id))
      .map((item) => ({
        ...item,
        status: "OWNED",
      })),
    cards: shopItems
      .filter((item) => item.type === "card" && cardCounts[item.id] > 0)
      .map((item) => ({
        ...item,
        status: `OWNED x${cardCounts[item.id]}`,
        quantity: cardCounts[item.id],
      })),
  };
};
