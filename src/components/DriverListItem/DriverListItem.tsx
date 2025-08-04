import type { Driver } from '@/contracts/Roles';
import { CirclePlus } from 'lucide-react';

import { Button } from '../ui/button';

interface DriverListItemProps {
  driver: Driver;
  onSelect: () => void;
}

export function DriverListItem({ driver, onSelect }: DriverListItemProps) {
  return (
    <li key={driver.id} className="flex justify-between items-center pb-4">
      <span>
        {driver.firstName} {driver.lastName}
      </span>
      <Button className="!bg-transparent" variant="ghost" onClick={onSelect}>
        <CirclePlus />
      </Button>
    </li>
  );
}
