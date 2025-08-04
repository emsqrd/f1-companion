import type { Constructor } from '@/contracts/Roles';
import { useSlots } from '@/hooks/useSlots';
import { getAllConstructors } from '@/services/constructorService';
import { useState } from 'react';

import { ConstructorCard } from '../ConstructorCard/ConstructorCard';
import { ConstructorListItem } from '../ConstructorListItem/ConstructorListItem';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

export function ConstructorPicker({ slotsCount = 4 }: { slotsCount?: number }) {
  const initialConstructors = getAllConstructors();
  const { slots, pool, add, remove } = useSlots<Constructor>(initialConstructors, slotsCount);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  return (
    <>
      <h1 className="scroll-m-20 text-center text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
        Constructors
      </h1>
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
        <SheetContent className="w-80 h-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Select Constructor</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 h-full pr-4 pl-4 min-h-0">
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
