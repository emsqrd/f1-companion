import type { Driver } from '@/contracts/Role';
import { useSlots } from '@/hooks/useSlots';
import { getActiveDrivers } from '@/services/driverService';
import { addDriverToTeam, removeDriverFromTeam } from '@/services/teamService';
import { useEffect, useState } from 'react';

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

interface DriverPickerContentProps {
  driverPool: Driver[];
  slotsCount: number;
  initialDrivers?: Driver[];
}

function DriverPickerContent({ driverPool, slotsCount, initialDrivers = [] }: DriverPickerContentProps) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const { slots, pool, add, remove } = useSlots<Driver>(driverPool, initialDrivers, slotsCount);

  const handleAdd = async (slotPosition: number, driver: Driver) => {
    try {
      add(slotPosition, driver);
      await addDriverToTeam(driver.id, slotPosition);
    } catch (error) {
      // Rollback on error
      remove(slotPosition);
      throw error;
    }
  };

  const handleRemove = async (slotPosition: number) => {
    const driver = slots[slotPosition];
    try {
      remove(slotPosition);
      await removeDriverFromTeam(slotPosition);
    } catch (error) {
      // Rollback on error
      if (driver) {
        add(slotPosition, driver);
      }
      throw error;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {slots.map((driver, idx) => (
          <DriverCard
            key={idx}
            driver={driver}
            onOpenSheet={() => setActiveSlot(idx)}
            onRemove={() => handleRemove(idx)}
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
                      handleAdd(activeSlot, driver);
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

interface DriverPickerProps {
  slotsCount?: number;
  initialDrivers?: Driver[];
}

export function DriverPicker({ slotsCount = 5, initialDrivers }: DriverPickerProps) {
  const [initialDriverPool, setInitialDriverPool] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const data = await getActiveDrivers();
        setInitialDriverPool(data);
      } catch {
        setError('Failed to load active drivers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveDrivers();
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

  return <DriverPickerContent driverPool={initialDriverPool} slotsCount={slotsCount} initialDrivers={initialDrivers} />;
}
