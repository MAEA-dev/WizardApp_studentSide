import { useCallback, useMemo, useState } from "react";

import { getOwnedInventory } from "../services/inventoryService";
import { purchaseShopItem } from "../services/shopService";

export const useInventory = ({ student, onStudentUpdated } = {}) => {
  const [purchasingItemId, setPurchasingItemId] = useState(null);
  const inventory = useMemo(
    () => getOwnedInventory(student),
    [student]
  );

  const purchaseItem = useCallback(
    async (itemId) => {
      setPurchasingItemId(itemId);

      try {
        const result = await purchaseShopItem(itemId);
        onStudentUpdated?.(result.student);
        return result;
      } finally {
        setPurchasingItemId(null);
      }
    },
    [onStudentUpdated]
  );

  return {
    inventory,
    purchasingItemId,
    purchaseItem,
  };
};
