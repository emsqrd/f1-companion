import type { BaseRole } from '@/contracts/Role';
import { useLineup } from '@/hooks/useLineup';
import { useEffect, useState } from 'react';

import { ScrollArea } from '../ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

/**
 * Props for card components displayed in the picker grid.
 * T represents the role type (Driver, Constructor, etc.)
 */
interface RoleCardProps<T extends BaseRole> {
  /** The item to display, or null for empty slots */
  item: T | null;
  /** Callback to open the selection sheet */
  onOpenSheet: () => void;
  /** Callback to remove the item from this slot */
  onRemove: () => void;
}

/**
 * Props for list item components displayed in the selection sheet.
 * T represents the role type (Driver, Constructor, etc.)
 */
interface RoleListItemProps<T extends BaseRole> {
  /** The item to display in the list */
  item: T;
  /** Callback when the item is selected */
  onSelect: () => void;
}

/**
 * Props for the internal RolePickerContent component.
 * This component handles the core picker logic with slots and selection.
 */
interface RolePickerContentProps<T extends BaseRole> {
  /** Pool of available items to choose from */
  itemPool: T[];
  /** Number of slots to display */
  slotsCount: number;
  /** Initially selected items */
  initialItems?: T[];
  /** Component to render each card in the grid */
  CardComponent: React.ComponentType<RoleCardProps<T>>;
  /** Component to render each item in the selection list */
  ListItemComponent: React.ComponentType<RoleListItemProps<T>>;
  /** Async function to add an item to the team */
  addToTeam: (itemId: number, slotPosition: number) => Promise<void>;
  /** Async function to remove an item from the team */
  removeFromTeam: (slotPosition: number) => Promise<void>;
  /** Title for the selection sheet */
  sheetTitle: string;
  /** Description for the selection sheet */
  sheetDescription: string;
  /** CSS classes for the grid layout */
  gridClassName?: string;
}

/**
 * Internal component that handles the picker UI and slot management logic.
 * This is where the generic business logic lives - managing slots, handling
 * add/remove operations with rollback, and coordinating the sheet UI.
 */
function RolePickerContent<T extends BaseRole>({
  itemPool,
  slotsCount,
  initialItems = [],
  CardComponent,
  ListItemComponent,
  addToTeam,
  removeFromTeam,
  sheetTitle,
  sheetDescription,
  gridClassName = 'grid grid-cols-1 gap-4 sm:grid-cols-2',
}: RolePickerContentProps<T>) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const { lineup, pool, add, remove } = useLineup<T>(itemPool, initialItems, slotsCount);

  /**
   * Handles adding an item to a slot with optimistic update and rollback on error.
   */
  const handleAdd = async (slotPosition: number, item: T) => {
    try {
      // Optimistically update local state
      add(slotPosition, item);
      // Persist to backend
      await addToTeam(item.id, slotPosition);
    } catch (error) {
      // Rollback on error
      remove(slotPosition);
      throw error;
    }
  };

  /**
   * Handles removing an item from a slot with optimistic update and rollback on error.
   */
  const handleRemove = async (slotPosition: number) => {
    const item = lineup[slotPosition];
    try {
      // Optimistically update local state
      remove(slotPosition);
      // Persist to backend
      await removeFromTeam(slotPosition);
    } catch (error) {
      // Rollback on error
      if (item) {
        add(slotPosition, item);
      }
      throw error;
    }
  };

  return (
    <>
      {/* Grid of cards representing lineup positions */}
      <div className={gridClassName}>
        {lineup.map((item, idx) => (
          <CardComponent
            key={idx}
            item={item}
            onOpenSheet={() => setActiveSlot(idx)}
            onRemove={() => handleRemove(idx)}
          />
        ))}
      </div>

      {/* Selection sheet */}
      <Sheet open={activeSlot !== null} onOpenChange={(o) => !o && setActiveSlot(null)}>
        <SheetTrigger asChild>
          {/* Invisible trigger - we open imperatively via setActiveSlot */}
          <div />
        </SheetTrigger>
        <SheetContent className="flex h-full w-80 flex-col">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
            <SheetDescription>{sheetDescription}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-full min-h-0 flex-1 pr-4 pl-4">
            <ul className="space-y-2">
              {pool.map((item) => (
                <ListItemComponent
                  key={item.id}
                  item={item}
                  onSelect={() => {
                    if (activeSlot !== null) {
                      handleAdd(activeSlot, item);
                      setActiveSlot(null);
                    }
                  }}
                />
              ))}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Props for the main RolePicker component.
 * This defines the external API for using the generic picker.
 */
export interface RolePickerProps<T extends BaseRole> {
  /** Number of slots to display (e.g., 5 for drivers, 2 for constructors) */
  slotsCount?: number;
  /** Initially selected items */
  initialItems?: T[];
  /** Component to render each card in the grid */
  CardComponent: React.ComponentType<RoleCardProps<T>>;
  /** Component to render each item in the selection list */
  ListItemComponent: React.ComponentType<RoleListItemProps<T>>;
  /** Async function to fetch available items */
  fetchItems: () => Promise<T[]>;
  /** Async function to add an item to the team */
  addToTeam: (itemId: number, slotPosition: number) => Promise<void>;
  /** Async function to remove an item from the team */
  removeFromTeam: (slotPosition: number) => Promise<void>;
  /** Title for the selection sheet */
  sheetTitle: string;
  /** Description for the selection sheet */
  sheetDescription: string;
  /** Message to display while loading */
  loadingMessage: string;
  /** Prefix for error messages (e.g., "Failed to load active") */
  errorPrefix: string;
  /** CSS classes for the grid layout */
  gridClassName?: string;
}

/**
 * Generic RolePicker component for selecting items (drivers, constructors, etc.) for a team.
 * 
 * This component handles:
 * - Data fetching with loading and error states
 * - Slot management with add/remove operations
 * - Optimistic updates with automatic rollback on error
 * - Generic rendering via component props
 * 
 * @example
 * ```tsx
 * <RolePicker<Driver>
 *   slotsCount={5}
 *   CardComponent={DriverCard}
 *   ListItemComponent={DriverListItem}
 *   fetchItems={getActiveDrivers}
 *   addToTeam={addDriverToTeam}
 *   removeFromTeam={removeDriverFromTeam}
 *   sheetTitle="Select Driver"
 *   sheetDescription="Choose a driver from the list below to add to your team."
 *   loadingMessage="Loading Drivers..."
 *   errorPrefix="Failed to load active drivers"
 * />
 * ```
 */
export function RolePicker<T extends BaseRole>({
  slotsCount = 5,
  initialItems,
  CardComponent,
  ListItemComponent,
  fetchItems,
  addToTeam,
  removeFromTeam,
  sheetTitle,
  sheetDescription,
  loadingMessage,
  errorPrefix,
  gridClassName,
}: RolePickerProps<T>) {
  const [itemPool, setItemPool] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchItems();
        setItemPool(data);
      } catch {
        setError(errorPrefix);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [fetchItems, errorPrefix]);

  if (error) {
    return <div role="error">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="text-center">
          <div
            role="status"
            className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
          ></div>
          <p className="text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <RolePickerContent
      itemPool={itemPool}
      slotsCount={slotsCount}
      initialItems={initialItems}
      CardComponent={CardComponent}
      ListItemComponent={ListItemComponent}
      addToTeam={addToTeam}
      removeFromTeam={removeFromTeam}
      sheetTitle={sheetTitle}
      sheetDescription={sheetDescription}
      gridClassName={gridClassName}
    />
  );
}
