import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSlots } from './useSlots';

// Test data types that match the hook's generic constraint
interface TestItem {
  id: number;
  name: string;
}

const createTestItem = (id: number, name = `Item ${id}`): TestItem => ({ id, name });

const mockPool: TestItem[] = [
  createTestItem(1, 'First Item'),
  createTestItem(2, 'Second Item'),
  createTestItem(3, 'Third Item'),
  createTestItem(4, 'Fourth Item'),
  createTestItem(5, 'Fifth Item'),
];

describe('useSlots', () => {
  describe('Initialization', () => {
    it('initializes with correct slots when initial slots match slot count', () => {
      const initialSlots = [createTestItem(1), createTestItem(2), null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      expect(result.current.slots).toEqual(initialSlots);
      expect(result.current.slots).toHaveLength(4);
    });

    it('pads slots with null when initial slots are fewer than slot count', () => {
      const initialSlots = [createTestItem(1), createTestItem(2)];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      expect(result.current.slots).toEqual([createTestItem(1), createTestItem(2), null, null]);
      expect(result.current.slots).toHaveLength(4);
    });

    it('uses default slot count of 4 when not specified', () => {
      const initialSlots: (TestItem | null)[] = [createTestItem(1)];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots));

      expect(result.current.slots).toHaveLength(4);
      expect(result.current.slots).toEqual([createTestItem(1), null, null, null]);
    });

    it('correctly filters initial pool to exclude selected items', () => {
      const initialSlots = [createTestItem(1), createTestItem(3), null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      expect(result.current.pool).toEqual([
        createTestItem(2, 'Second Item'),
        createTestItem(4, 'Fourth Item'),
        createTestItem(5, 'Fifth Item'),
      ]);
    });

    it('maintains original pool order when filtering', () => {
      const initialSlots = [createTestItem(2), createTestItem(4), null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      const expectedPool = [
        createTestItem(1, 'First Item'),
        createTestItem(3, 'Third Item'),
        createTestItem(5, 'Fifth Item'),
      ];
      expect(result.current.pool).toEqual(expectedPool);
    });

    it('handles empty initial slots correctly', () => {
      const initialSlots: (TestItem | null)[] = [];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 3));

      expect(result.current.slots).toEqual([null, null, null]);
      expect(result.current.pool).toEqual(mockPool);
    });

    it('handles initial slots with all null values', () => {
      const initialSlots = [null, null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 3));

      expect(result.current.slots).toEqual([null, null, null]);
      expect(result.current.pool).toEqual(mockPool);
    });
  });

  describe('Adding items', () => {
    it('adds an item to an empty slot', () => {
      const initialSlots = [null, null, null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      act(() => {
        result.current.add(0, createTestItem(1, 'First Item'));
      });

      expect(result.current.slots[0]).toEqual(createTestItem(1, 'First Item'));
      expect(result.current.slots[1]).toBeNull();
      expect(result.current.slots[2]).toBeNull();
      expect(result.current.slots[3]).toBeNull();
    });

    it('removes added item from pool', () => {
      const initialSlots = [null, null, null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      const initialPoolLength = result.current.pool.length;

      act(() => {
        result.current.add(0, createTestItem(1, 'First Item'));
      });

      expect(result.current.pool).toHaveLength(initialPoolLength - 1);
      expect(result.current.pool.find((item) => item.id === 1)).toBeUndefined();
    });

    it('replaces an existing item in a slot', () => {
      const initialSlots = [createTestItem(1), null, null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      act(() => {
        result.current.add(0, createTestItem(2, 'Second Item'));
      });

      expect(result.current.slots[0]).toEqual(createTestItem(2, 'Second Item'));
      expect(result.current.pool.find((item) => item.id === 2)).toBeUndefined();
    });

    it('adds items to multiple slots correctly', () => {
      const initialSlots = [null, null, null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      act(() => {
        result.current.add(0, createTestItem(1, 'First Item'));
      });

      act(() => {
        result.current.add(2, createTestItem(3, 'Third Item'));
      });

      expect(result.current.slots[0]).toEqual(createTestItem(1, 'First Item'));
      expect(result.current.slots[1]).toBeNull();
      expect(result.current.slots[2]).toEqual(createTestItem(3, 'Third Item'));
      expect(result.current.slots[3]).toBeNull();

      expect(result.current.pool).toHaveLength(3);
      expect(result.current.pool.find((item) => item.id === 1)).toBeUndefined();
      expect(result.current.pool.find((item) => item.id === 3)).toBeUndefined();
    });

    it('maintains pool integrity when adding the same item multiple times', () => {
      const initialSlots = [null, null, null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      const testItem = createTestItem(1, 'First Item');

      act(() => {
        result.current.add(0, testItem);
      });

      const poolAfterFirstAdd = result.current.pool.length;

      act(() => {
        result.current.add(1, testItem);
      });

      // Pool should not shrink further since item was already removed
      expect(result.current.pool).toHaveLength(poolAfterFirstAdd);
      expect(result.current.slots[0]).toEqual(testItem);
      expect(result.current.slots[1]).toEqual(testItem);
    });
  });

  describe('Removing items', () => {
    it('removes an item from a slot and sets it to null', () => {
      const initialSlots = [createTestItem(1), createTestItem(2), null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      act(() => {
        result.current.remove(0);
      });

      expect(result.current.slots[0]).toBeNull();
      expect(result.current.slots[1]).toEqual(createTestItem(2));
    });

    it('rebuilds pool in original order when removing an item', () => {
      const initialSlots = [createTestItem(1), createTestItem(3), null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      act(() => {
        result.current.remove(0);
      });

      // Pool should be rebuilt excluding only the remaining selected items
      const expectedPool = [
        createTestItem(1, 'First Item'), // Now available again
        createTestItem(2, 'Second Item'),
        createTestItem(4, 'Fourth Item'),
        createTestItem(5, 'Fifth Item'),
      ];
      expect(result.current.pool).toEqual(expectedPool);
    });

    it('handles removing from an empty slot gracefully', () => {
      const initialSlots = [createTestItem(1), null, createTestItem(3), null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      const poolBeforeRemove = [...result.current.pool];

      act(() => {
        result.current.remove(1); // Remove from already empty slot
      });

      expect(result.current.slots[1]).toBeNull();
      expect(result.current.pool).toEqual(poolBeforeRemove);
    });

    it('maintains correct state when removing multiple items', () => {
      const initialSlots = [createTestItem(1), createTestItem(2), createTestItem(3), null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      act(() => {
        result.current.remove(0);
      });

      act(() => {
        result.current.remove(2);
      });

      expect(result.current.slots).toEqual([null, createTestItem(2), null, null]);

      // Pool should contain items 1, 3, 4, 5 (in original order)
      const expectedPool = [
        createTestItem(1, 'First Item'),
        createTestItem(3, 'Third Item'),
        createTestItem(4, 'Fourth Item'),
        createTestItem(5, 'Fifth Item'),
      ];
      expect(result.current.pool).toEqual(expectedPool);
    });

    it('preserves original pool order regardless of removal order', () => {
      const initialSlots = [createTestItem(2), createTestItem(4), createTestItem(1), null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      // Remove in different order than they appear in slots
      act(() => {
        result.current.remove(1); // Remove item 4
      });

      act(() => {
        result.current.remove(0); // Remove item 2
      });

      // Remaining selected item is 1, so pool should have 2, 3, 4, 5
      const expectedPool = [
        createTestItem(2, 'Second Item'),
        createTestItem(3, 'Third Item'),
        createTestItem(4, 'Fourth Item'),
        createTestItem(5, 'Fifth Item'),
      ];
      expect(result.current.pool).toEqual(expectedPool);
    });
  });

  describe('Complex user scenarios', () => {
    it('handles a complete team building workflow', () => {
      const initialSlots = [null, null, null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      // User adds first item
      act(() => {
        result.current.add(0, createTestItem(1, 'First Item'));
      });

      // User adds second item
      act(() => {
        result.current.add(1, createTestItem(3, 'Third Item'));
      });

      // User decides to replace first item
      act(() => {
        result.current.add(0, createTestItem(2, 'Second Item'));
      });

      // User removes second item
      act(() => {
        result.current.remove(1);
      });

      expect(result.current.slots).toEqual([createTestItem(2, 'Second Item'), null, null, null]);

      // Pool should contain everything except selected item 2
      const expectedPool = [
        createTestItem(1, 'First Item'),
        createTestItem(3, 'Third Item'),
        createTestItem(4, 'Fourth Item'),
        createTestItem(5, 'Fifth Item'),
      ];
      expect(result.current.pool).toEqual(expectedPool);
    });

    it('handles filling all slots and then clearing them', () => {
      const initialSlots = [null, null, null];
      const { result } = renderHook(() => useSlots(mockPool.slice(0, 3), initialSlots, 3));

      // Fill all slots
      act(() => {
        result.current.add(0, createTestItem(1));
        result.current.add(1, createTestItem(2));
        result.current.add(2, createTestItem(3));
      });

      expect(result.current.pool).toHaveLength(0);
      expect(result.current.slots.every((slot) => slot !== null)).toBe(true);

      // Clear all slots
      act(() => {
        result.current.remove(0);
        result.current.remove(1);
        result.current.remove(2);
      });

      expect(result.current.slots).toEqual([null, null, null]);
      expect(result.current.pool).toEqual(mockPool.slice(0, 3));
    });

    it('handles edge case of swapping items between slots', () => {
      const initialSlots = [createTestItem(1), createTestItem(2), null, null];
      const { result } = renderHook(() => useSlots(mockPool, initialSlots, 4));

      // Move item from slot 0 to slot 2
      const itemToMove = result.current.slots[0]!;

      act(() => {
        result.current.remove(0);
      });

      act(() => {
        result.current.add(2, itemToMove);
      });

      expect(result.current.slots[0]).toBeNull();
      expect(result.current.slots[1]).toEqual(createTestItem(2));
      expect(result.current.slots[2]).toEqual(createTestItem(1));
      expect(result.current.slots[3]).toBeNull();
    });

    it('preserves referential integrity of pool items', () => {
      const originalPoolItems = [
        { id: 1, name: 'Item 1', metadata: { important: true } },
        { id: 2, name: 'Item 2', metadata: { important: false } },
      ];
      const initialSlots = [null, null];
      const { result } = renderHook(() => useSlots(originalPoolItems, initialSlots, 2));

      act(() => {
        result.current.add(0, originalPoolItems[0]);
      });

      act(() => {
        result.current.remove(0);
      });

      // The item returned to pool should be the same reference
      expect(result.current.pool[0]).toBe(originalPoolItems[0]);
      expect(result.current.pool[0].metadata.important).toBe(true);
    });
  });

  describe('Type safety and constraints', () => {
    it('works with different item types that have id property', () => {
      interface CustomItem {
        id: number;
        customProperty: string;
        value: number;
      }

      const customItems: CustomItem[] = [
        { id: 1, customProperty: 'test1', value: 100 },
        { id: 2, customProperty: 'test2', value: 200 },
      ];

      const { result } = renderHook(() => useSlots(customItems, [customItems[0], null], 2));

      expect(result.current.slots[0]?.customProperty).toBe('test1');
      expect(result.current.pool[0].value).toBe(200);

      act(() => {
        result.current.add(1, customItems[1]);
      });

      expect(result.current.slots[1]?.value).toBe(200);
    });

    it('handles items with additional properties beyond the base constraint', () => {
      interface ExtendedItem {
        id: number;
        name: string;
        category: 'A' | 'B';
        metadata?: Record<string, unknown>;
      }

      const extendedItems: ExtendedItem[] = [
        { id: 1, name: 'Item A1', category: 'A' },
        { id: 2, name: 'Item B1', category: 'B', metadata: { special: true } },
      ];

      const { result } = renderHook(() => useSlots(extendedItems, [null, null], 2));

      act(() => {
        result.current.add(0, extendedItems[1]);
      });

      expect(result.current.slots[0]?.category).toBe('B');
      expect(result.current.slots[0]?.metadata?.special).toBe(true);
    });
  });

  describe('Performance and optimization scenarios', () => {
    it('handles frequent add/remove cycles without memory leaks', () => {
      const initialSlots = [null, null];
      const testPool = [createTestItem(1), createTestItem(2)];
      const { result } = renderHook(() => useSlots(testPool, initialSlots, 2));

      // Simulate frequent operations
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.add(0, testPool[0]);
          result.current.remove(0);
          result.current.add(1, testPool[1]);
          result.current.remove(1);
        });
      }

      expect(result.current.slots).toEqual([null, null]);
      expect(result.current.pool).toEqual(testPool);
    });
  });
});
