import type { Constructor } from '@/contracts/Role';
import { useSlots } from '@/hooks/useSlots';
import { getActiveConstructors } from '@/services/constructorService';
import { addConstructorToTeam, removeConstructorFromTeam } from '@/services/teamService';
import { useEffect, useState } from 'react';

import { ConstructorCard } from '../ConstructorCard/ConstructorCard';
import { ConstructorListItem } from '../ConstructorListItem/ConstructorListItem';
import { ScrollArea } from '../ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

interface ConstructorPickerContentProps {
  constructorPool: Constructor[];
  slotsCount: number;
  initialConstructors?: Constructor[];
}

function ConstructorPickerContent({ constructorPool, slotsCount, initialConstructors = [] }: ConstructorPickerContentProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const { slots, pool, add, remove } = useSlots<Constructor>(constructorPool, initialConstructors, slotsCount);

  const handleAdd = async (slotPosition: number, constructor: Constructor) => {
    try {
      add(slotPosition, constructor);
      await addConstructorToTeam(constructor.id, slotPosition);
    } catch (error) {
      // Rollback on error
      remove(slotPosition);
      throw error;
    }
  };

  const handleRemove = async (slotPosition: number) => {
    const constructor = slots[slotPosition];
    try {
      remove(slotPosition);
      await removeConstructorFromTeam(slotPosition);
    } catch (error) {
      // Rollback on error
      if (constructor) {
        add(slotPosition, constructor);
      }
      throw error;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {slots.map((constructor, idx) => (
          <ConstructorCard
            key={idx}
            constructor={constructor}
            onOpenSheet={() => setActiveSlot(idx)}
            onRemove={() => handleRemove(idx)}
          ></ConstructorCard>
        ))}
      </div>

      <Sheet open={activeSlot !== null} onOpenChange={(o) => !o && setActiveSlot(null)}>
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
        <SheetContent className="flex h-full w-80 flex-col">
          <SheetHeader>
            <SheetTitle>Select Constructor</SheetTitle>
            <SheetDescription>
              Choose a constructor from the list below to add to your team.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-full min-h-0 flex-1 pr-4 pl-4">
            <ul className="space-y-2">
              {pool.map((constructor) => (
                <ConstructorListItem
                  key={constructor.id}
                  constructor={constructor}
                  onSelect={() => {
                    if (activeSlot !== null) {
                      handleAdd(activeSlot, constructor);
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

interface ConstructorPickerProps {
  slotsCount?: number;
  initialConstructors?: Constructor[];
}

export function ConstructorPicker({ slotsCount = 2, initialConstructors }: ConstructorPickerProps) {
  const [initialConstructorPool, setInitialConstructorPool] = useState<Constructor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveConstructors = async () => {
      try {
        const data = await getActiveConstructors();
        setInitialConstructorPool(data);
      } catch {
        setError('Failed to load active constructors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveConstructors();
  }, []);

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
          <p className="text-muted-foreground">Loading Constructors...</p>
        </div>
      </div>
    );
  }

  return (
    <ConstructorPickerContent 
      constructorPool={initialConstructorPool} 
      slotsCount={slotsCount} 
      initialConstructors={initialConstructors}
    />
  );
}
