import type { Driver } from '@/contracts/Roles';
import { CirclePlus, Trash } from 'lucide-react';

import { RoleCard } from '../RoleCard/RoleCard';
import { Button } from '../ui/button';

interface DriverCardProps {
  driver: Driver | null;
  onOpenSheet: () => void;
  onRemove: () => void;
}

export function DriverCard({ driver, onOpenSheet, onRemove }: DriverCardProps) {
  const renderCardContent = () => {
    if (!driver) {
      return (
        <Button
          onClick={onOpenSheet}
          variant="ghost"
          className="flex items-center gap-2 !bg-transparent"
        >
          <CirclePlus />
          Add Driver
        </Button>
      );
    } else {
      return (
        <div className="flex items-start w-full h-full">
          <span className="w-20 aspect-square rounded-full border-2 border-gray-300 flex-none"></span>
          <div className="flex flex-1 flex-col h-full justify-between items-start pl-4">
            <div>{`${driver.firstName} ${driver.lastName}`}</div>
            <div className="mt-auto">
              <span>32 pts.</span>
              <span>$14.5m</span>
            </div>
          </div>
          <Button
            size="icon"
            className="ml-auto text-red-500 hover:text-red-700 !bg-transparent opacity-0 group-hover:opacity-100 transition-opacity flex-none"
            aria-label="Remove Driver"
            onClick={onRemove}
          >
            <Trash />
          </Button>
        </div>
      );
    }
  };

  return <RoleCard renderCardContent={renderCardContent} />;
}
