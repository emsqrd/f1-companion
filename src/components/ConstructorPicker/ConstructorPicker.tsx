import type { Constructor } from '@/contracts/Role';
import { useSlots } from '@/hooks/useSlots';
import { getActiveConstructors } from '@/services/constructorService';
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
}

function ConstructorPickerContent({ constructorPool, slotsCount }: ConstructorPickerContentProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const { slots, pool, add, remove } = useSlots<Constructor>(constructorPool, [], slotsCount);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {slots.map((constructor, idx) => (
          <ConstructorCard
            key={idx}
            constructor={constructor}
            onOpenSheet={() => setActiveSlot(idx)}
            onRemove={() => remove(idx)}
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
                      add(activeSlot, constructor);
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

export function ConstructorPicker({ slotsCount = 2 }: { slotsCount?: number }) {
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
          <p className="text-muted-foreground">Loading Drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <ConstructorPickerContent constructorPool={initialConstructorPool} slotsCount={slotsCount} />
  );
}
