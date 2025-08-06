import { useState } from 'react';

export function useSlots<T extends { id: number }>(
  initialPool: T[],
  initialSlots: (T | null)[],
  slotCount = 4,
) {
  const [slots, setSlots] = useState<(T | null)[]>(
    initialSlots.length === slotCount
      ? initialSlots
      : [...initialSlots, ...Array(slotCount - initialSlots.length).fill(null)],
  );
  const selectedIds = initialSlots.filter(Boolean).map((d) => d!.id);
  const [pool, setPool] = useState(initialPool.filter((d) => !selectedIds.includes(d.id)));

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
