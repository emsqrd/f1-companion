import { useCallback, useMemo, useState } from 'react';

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

  // Derive pool from slots - no separate state needed
  // This automatically stays in sync and avoids nested setState
  const pool = useMemo(() => {
    const selectedIds = slots.filter((item): item is T => item !== null).map((item) => item.id);
    return initialPool.filter((item) => !selectedIds.includes(item.id));
  }, [slots, initialPool]);

  const add = useCallback((idx: number, item: T) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[idx] = item;
      return updated;
    });
  }, []);

  const remove = useCallback((idx: number) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[idx] = null;
      return updated;
    });
  }, []);

  return { slots, pool, add, remove };
}
