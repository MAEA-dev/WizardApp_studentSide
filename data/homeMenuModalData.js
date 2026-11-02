export const homeMenuModalData = {
  shop: {
    title: "Magic Shop",
    subtitle: "Buy skins and cards",
    icon: "storefront",
    sections: [
      {
        id: "skin-shop",
        tabTitle: "Skins",
        title: "Skin Shop",
        icon: "shirt",
        type: "shop",
        items: [],
        emptyMessage: "No skins are available right now.",
      },
      {
        id: "card-shop",
        tabTitle: "Cards",
        title: "Card Shop",
        icon: "albums",
        type: "shop",
        items: [],
        emptyMessage: "No cards are available right now.",
      },
    ],
  },

  inventory: {
    title: "Magic Bag",
    subtitle: "Your owned skins and cards",
    icon: "bag",
    sections: [
      {
        id: "skin-inventory",
        tabTitle: "Skins",
        title: "Skin Inventory",
        icon: "shirt",
        type: "inventory",
        items: [],
        emptyMessage: "You don't own any skins yet. Visit the Shop to find one.",
      },
      {
        id: "card-inventory",
        tabTitle: "Cards",
        title: "Card Inventory",
        icon: "albums",
        type: "inventory",
        items: [],
        emptyMessage: "You don't own any cards yet. Visit the Shop to find one.",
      },
    ],
  },

  history: {
    title: "History",
    subtitle: "Learning and battle records",
    icon: "time",
    sections: [
      {
        id: "battle-history",
        tabTitle: "Battles",
        title: "Battle History",
        icon: "shield",
        type: "history",
        emptyMessage: "No battle records yet. Complete a dungeon battle to see it here.",
        items: [],
      },
      {
        id: "win-rate",
        tabTitle: "Win Rate",
        title: "Win Rate",
        icon: "trophy",
        type: "history",
        emptyMessage: "No battles yet. Complete a battle to see your statistics.",
        items: [],
      },
    ],
  },
};