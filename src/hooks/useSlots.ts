import { useCallback, useState } from 'react';

export function useSlots<T extends { id: number }>(
  initialPool: T[],
  initialSlots: (T | null)[] | null | undefined,
  slotCount = 4,
) {
  // Ensure initialSlots is always an array for null safety
  const safeInitialSlots = initialSlots ?? [];

  const [slots, setSlots] = useState<(T | null)[]>(() => {
    // Lazy initialization to avoid recalculation on every render
    return safeInitialSlots.length === slotCount
      ? safeInitialSlots
      : [...safeInitialSlots, ...Array(slotCount - safeInitialSlots.length).fill(null)];
  });

  const [pool, setPool] = useState<T[]>(() => {
    // Lazy initialization - filter out initially selected items
    const selectedIds = safeInitialSlots
      .filter((item): item is T => item !== null)
      .map((item) => item.id);
    return initialPool.filter((item) => !selectedIds.includes(item.id));
  });

  const add = useCallback((idx: number, item: T) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[idx] = item;
      return updated;
    });

    setPool((prevPool) => prevPool.filter((p) => p.id !== item.id));
  }, []);

  const remove = useCallback(
    (idx: number) => {
      setSlots((prev) => {
        const updated = [...prev];
        updated[idx] = null;

        // Calculate the new pool based on updated slots
        // We do this inside setSlots to have access to the updated state
        const selectedIds = updated
          .filter((item): item is T => item !== null)
          .map((item) => item.id);
        const newPool = initialPool.filter((item) => !selectedIds.includes(item.id));

        // Schedule pool update - this is acceptable because we're computing
        // a value derived from the new slots state we're about to return
        setPool(newPool);

        return updated;
      });
    },
    [initialPool],
  );

  return { slots, pool, add, remove };
}
