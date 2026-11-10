
import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { shopItems } from "../data/shopItems";

import {
  DEFAULT_WIZARD_AVATAR,
  hasWizardAvatar,
  getWizardAvatarId,
} from "../constants/wizardAvatars";

import { auth, db } from "./firebaseConfig";
import { saveStudentCache } from "./studentCacheService";

const getOwnedIds = (value) =>
  Array.isArray(value) ? value : [];

export const getOwnedInventory = (studentData = {}) => {
  const ownedSkins = getOwnedIds(studentData.ownedSkins);

  const equippedSkin = getWizardAvatarId(
    studentData.equippedSkin
  );

  const skins = shopItems
    .filter(
      (item) =>
        item.type === "skin" &&
        ownedSkins.includes(item.id)
    )
    .map((item) => {
      const isEquipped = item.id === equippedSkin;

      return {
        ...item,
        isEquipped,
        status: isEquipped ? "EQUIPPED" : "OWNED",
        buttonLabel: isEquipped ? "EQUIPPED" : "EQUIP",
        available: !isEquipped,
      };
    });

  return { skins };
};

export const equipWizardSkin = async (skinId) => {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("Sign in to equip a wizard skin.");
  }

  if (!hasWizardAvatar(skinId)) {
    throw new Error("This wizard skin is unavailable.");
  }

  const studentRef = doc(db, "users", uid);

  const result = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(studentRef);

    if (!snapshot.exists()) {
      throw new Error("Student data not found.");
    }

    const studentData = snapshot.data();
    const ownedSkins = getOwnedIds(studentData.ownedSkins);

    const isDefaultSkin = skinId === DEFAULT_WIZARD_AVATAR;

    if (!isDefaultSkin && !ownedSkins.includes(skinId)) {
      throw new Error("You do not own this wizard skin.");
    }

    const updatedStudent = {
      ...studentData,
      equippedSkin: skinId,
    };

    transaction.update(studentRef, {
      equippedSkin: skinId,
      updatedAt: serverTimestamp(),
    });

    return { student: updatedStudent };
  });

  const cachedStudent = await saveStudentCache(
    uid,
    result.student
  );

  if (!cachedStudent) {
    console.error(
      "Failed to refresh student cache after equipping skin."
    );
  }

  return result;
};
