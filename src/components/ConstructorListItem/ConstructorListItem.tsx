import type { Constructor } from '@/contracts/Roles';
import { CirclePlus } from 'lucide-react';

import { Button } from '../ui/button';

interface ConstructorListItemProps {
  constructor: Constructor;
  onSelect: () => void;
}

export function ConstructorListItem({ constructor, onSelect }: ConstructorListItemProps) {
  return (
    <li className="flex justify-between items-center pb-4">
      <span>{constructor.name}</span>
      <Button className="!bg-transparent" variant="ghost" onClick={onSelect}>
        <CirclePlus />
      </Button>
    </li>
  );
}
