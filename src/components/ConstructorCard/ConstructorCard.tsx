import type { Constructor } from '@/contracts/Roles';
import { Car, CirclePlus, Trash } from 'lucide-react';

import { RoleCard } from '../RoleCard/RoleCard';
import { Button } from '../ui/button';

interface ConstructorCardProps {
  constructor: Constructor | null;
  onOpenSheet: () => void;
  onRemove: () => void;
}

export function ConstructorCard({ constructor, onOpenSheet, onRemove }: ConstructorCardProps) {
  const renderCardContent = () => {
    if (!constructor) {
      return (
        <Button
          onClick={onOpenSheet}
          variant="ghost"
          className="flex items-center gap-2 !bg-transparent"
        >
          <CirclePlus />
          Add Constructor
        </Button>
      );
    } else {
      return (
        <>
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
        </>
      );
    }
  };

  return <RoleCard renderCardContent={renderCardContent} />;
}
