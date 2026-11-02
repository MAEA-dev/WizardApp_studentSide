import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { getShopItemById } from "../data/shopItems";
import { auth, db } from "./firebaseConfig";
import { saveStudentCache } from "./studentCacheService";

const getNonNegativeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
};

export const purchaseShopItem = async (itemId) => {
  const item = getShopItemById(itemId);

  if (!item) {
    throw new Error("This shop item is unavailable.");
  }

  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("Sign in to purchase shop items.");
  }

  const studentRef = doc(db, "users", uid);
  const result = await runTransaction(db, async (transaction) => {
    const studentSnapshot = await transaction.get(studentRef);

    if (!studentSnapshot.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData = studentSnapshot.data();
    const currentGold = getNonNegativeNumber(studentData.gold);
    const ownedSkins = Array.isArray(studentData.ownedSkins)
      ? studentData.ownedSkins
      : [];
    if (item.type === "skin" && ownedSkins.includes(item.id)) {
      throw new Error("You already own this skin.");
    }

    if (currentGold < item.price) {
      throw new Error("You don't have enough gold for this item.");
    }

    const ownedCards = Array.isArray(studentData.ownedCards)
      ? studentData.ownedCards
      : [];

    const ownedCardCount = ownedCards.filter(
      (cardId) => cardId === item.id
    ).length;

    if (
      item.type === "card" &&
      ownedCardCount >= 3
    ) {
      throw new Error(
        "You already own the maximum copies of this card."
      );
    }

    const nextGold = currentGold - item.price;

    const nextOwnedSkins =
      item.type === "skin"
        ? [...ownedSkins, item.id]
        : ownedSkins;

    const nextOwnedCards =
      item.type === "card"
        ? [...ownedCards, item.id]
        : ownedCards;

      transaction.update(studentRef, {
        gold: nextGold,
        ownedSkins: nextOwnedSkins,
        ownedCards: nextOwnedCards,
        updatedAt: serverTimestamp(),
      });

      return {
        student: {
          ...studentData,
          gold: nextGold,
          ownedSkins: nextOwnedSkins,
          ownedCards: nextOwnedCards,
        },
      };
  });

  const cachedStudent = await saveStudentCache(uid, result.student);

  if (!cachedStudent) {
    console.error("Purchase completed, but the student cache could not be refreshed.");
  }

  return {
    ...result,
    goldSpent: item.price,
  };
};
