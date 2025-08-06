import type { Driver } from '@/contracts/Roles';
import { useSlots } from '@/hooks/useSlots';
import { getAllDrivers } from '@/services/driverService';
import { useMemo, useState } from 'react';

import { DriverCard } from '../DriverCard/DriverCard';
import { DriverListItem } from '../DriverListItem/DriverListItem';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

export function DriverPicker({ slotsCount = 4 }: { slotsCount?: number }) {
  const initialDriverPool = getAllDrivers();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const initialSlots = useMemo<(Driver | null)[]>(
    () => [1, 2, 9, 11].map((id) => initialDriverPool.find((d) => d.id === id) ?? null),
    [initialDriverPool],
  );

  const { slots, pool, add, remove } = useSlots<Driver>(
    initialDriverPool,
    initialSlots,
    slotsCount,
  );

  return (
    <>
      <h2 className="scroll-m-20 text-center text-3xl font-bold tracking-tight text-balance">
        Drivers
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {slots.map((driver, idx) => (
          <DriverCard
            key={idx}
            driver={driver}
            onOpenSheet={() => setActiveSlot(idx)}
            onRemove={() => remove(idx)}
          />
        ))}
      </div>

      <Sheet open={activeSlot !== null} onOpenChange={(o) => !o && setActiveSlot(null)}>
        <SheetTrigger asChild>
          {/* invisible trigger, since we open imperatively via setActiveSlot */}
          <div />
        </SheetTrigger>
        <SheetContent className="flex h-full w-80 flex-col">
          <SheetHeader>
            <SheetTitle>Select Driver</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full min-h-0 flex-1 pr-4 pl-4">
            <ul className="space-y-2">
              {pool.map((driver) => (
                <DriverListItem
                  key={driver.id}
                  driver={driver}
                  onSelect={() => {
                    if (activeSlot !== null) {
                      add(activeSlot, driver);
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
