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
        items: [
          
 
        ],
      },
      {
        id: "card-shop",
        tabTitle: "Cards",
        title: "Card Shop",
        icon: "albums",
        type: "shop",
        items: [
          
        ],
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
        items: [
        ],
      },
      {
        id: "card-inventory",
        tabTitle: "Cards",
        title: "Card Inventory",
        icon: "albums",
        type: "inventory",
        items: [
      
        ],
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
        items: [
          {
            id: "no-battle",
            title: "No battle records yet",
            description: "Battle mode is still under development.",
            status: "Pending",
          },
        ],
      },
      {
        id: "win-rate",
        tabTitle: "Win Rate",
        title: "Win Rate",
        icon: "trophy",
        type: "history",
        items: [
          {
            id: "wins",
            title: "0 Wins",
            description: "Total battles won.",
            status: "0",
          },
          {
            id: "losses",
            title: "0 Losses",
            description: "Total battles lost.",
            status: "0",
          },
          {
            id: "rate",
            title: "0% Win Rate",
            description: "Current battle performance.",
            status: "0%",
          },
        ],
      },
    ],
  },
};