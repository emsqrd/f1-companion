import type { Driver } from '@/contracts/Role';
import { useSlots } from '@/hooks/useSlots';
import { getAllDrivers } from '@/services/driverService';
import { useMemo, useState } from 'react';

import { DriverCard } from '../DriverCard/DriverCard';
import { DriverListItem } from '../DriverListItem/DriverListItem';
import { ScrollArea } from '../ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

export function DriverPicker({ slotsCount = 4 }: { slotsCount?: number }) {
  const initialDriverPool = getAllDrivers();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const initialSlots = useMemo<Driver[]>(
    () => [1, 2, 9, 11].map((id) => initialDriverPool.find((d) => d.id === id)!),
    [initialDriverPool],
  );

  const { slots, pool, add, remove } = useSlots<Driver>(
    initialDriverPool,
    initialSlots,
    slotsCount,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <SheetDescription>
              Choose a driver from the list below to add to your team.
            </SheetDescription>
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
