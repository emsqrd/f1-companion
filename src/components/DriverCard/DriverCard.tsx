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
      points={driver?.points ?? 0}
      price={driver?.price ?? 0}
      onOpenSheet={onOpenSheet}
      onRemove={onRemove}
    />
  );
}
