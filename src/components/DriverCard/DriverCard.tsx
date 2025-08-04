import type { Driver } from '@/contracts/Roles';

import { RoleCard } from '../RoleCard/RoleCard';

interface DriverCardProps {
  driver: Driver | null;
  onOpenSheet: () => void;
  onRemove: () => void;
}

export function DriverCard({ driver, onOpenSheet, onRemove }: DriverCardProps) {
  return (
    <RoleCard
      adding={!driver}
      role="Driver"
      name={`${driver?.firstName} ${driver?.lastName}`}
      points={34}
      price={14.5}
      onOpenSheet={onOpenSheet}
      onRemove={onRemove}
    />
  );
}
