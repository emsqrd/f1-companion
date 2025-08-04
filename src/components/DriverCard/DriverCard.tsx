import type { Driver } from '@/contracts/Roles';
import { CirclePlus, CircleUserRound, Trash } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface DriverCardProps {
  driver: Driver | null;
  onOpenSheet: () => void;
  onRemove: () => void;
}

export function DriverCard({ driver, onOpenSheet, onRemove }: DriverCardProps) {
  if (!driver) {
    return (
      <Card className="w-80 h-30">
        <CardContent className="flex items-center justify-center h-full">
          <Button
            onClick={onOpenSheet}
            variant="ghost"
            className="flex items-center gap-2 !bg-transparent"
          >
            <CirclePlus />
            Add Driver
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-30">
      <CardContent className="flex items-center justify-between group h-full">
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
      </CardContent>
    </Card>
  );
}
