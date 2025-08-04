import type { Driver } from '@/contracts/Roles';
import { CirclePlus, CircleUserRound, Trash } from 'lucide-react';

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
        <>
          <span className="flex items-center gap-2">
            <CircleUserRound />
            {`${driver.firstName} ${driver.lastName}`}
          </span>
          <Button
            size="icon"
            className="text-red-500 hover:text-red-700 !bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove Driver"
            onClick={onRemove}
          >
            <Trash />
          </Button>
        </>
      );
    }
  };

  return <RoleCard renderCardContent={renderCardContent} />;
}
