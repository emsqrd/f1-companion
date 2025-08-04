import type { Constructor } from '@/contracts/Roles';
import { Car, CirclePlus, Trash } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ConstructorCardProps {
  constructor: Constructor | null;
  onOpenSheet: () => void;
  onRemove: () => void;
}

export function ConstructorCard({ constructor, onOpenSheet, onRemove }: ConstructorCardProps) {
  if (!constructor) {
    return (
      <Card className="w-80 h-30">
        <CardContent className="flex items-center justify-center h-full">
          <Button
            onClick={onOpenSheet}
            variant="ghost"
            className="flex items-center gap-2 !bg-transparent"
          >
            <CirclePlus />
            Add Constructor
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-30">
      <CardContent className="flex items-center justify-between group h-full">
        <span className="flex items-center gap-2">
          <Car />
          {constructor.name}
        </span>
        <Button
          size="icon"
          className="text-red-500 hover:text-red-700 !bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <Trash />
        </Button>
      </CardContent>
    </Card>
  );
}
