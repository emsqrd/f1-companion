import { useState } from 'react';

export function useSlots<T extends { id: number }>(initialPool: T[], slotCount = 4) {
  const [slots, setSlots] = useState<(T | null)[]>(Array(slotCount).fill(null));
  const [pool, setPool] = useState(initialPool);

  const add = (idx: number, item: T) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[idx] = item;
      return updated;
    });

    setPool((prevPool) => prevPool.filter((p) => p.id !== item.id));
  };
  const remove = (idx: number) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[idx] = null;
      // Rebuild pool in original order, excluding currently selected items
      const selectedIds = updated
        .filter((selected): selected is T => selected !== null)
        .map((selected) => selected.id);
      setPool(initialPool.filter((pool) => !selectedIds.includes(pool.id)));
      return updated;
    });
  };

  return { slots, pool, add, remove };
}
