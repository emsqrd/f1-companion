import type { Constructor } from '@/contracts/Roles';
import { useSlots } from '@/hooks/useSlots';
import { getAllConstructors } from '@/services/constructorService';
import { useMemo, useState } from 'react';

import { ConstructorCard } from '../ConstructorCard/ConstructorCard';
import { ConstructorListItem } from '../ConstructorListItem/ConstructorListItem';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

export function ConstructorPicker({ slotsCount = 4 }: { slotsCount?: number }) {
  const initialConstructorsPool = getAllConstructors();

  const initialSlots = useMemo<(Constructor | null)[]>(
    () => [11, 13, 7, 19].map((id) => initialConstructorsPool.find((d) => d.id === id) ?? null),
    [initialConstructorsPool],
  );

  const { slots, pool, add, remove } = useSlots<Constructor>(
    initialConstructorsPool,
    initialSlots,
    slotsCount,
  );
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
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
