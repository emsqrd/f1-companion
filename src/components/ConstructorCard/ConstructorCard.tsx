import type { Constructor } from '@/contracts/Roles';

import { RoleCard } from '../RoleCard/RoleCard';

interface ConstructorCardProps {
  constructor: Constructor | null;
  onOpenSheet: () => void;
  onRemove: () => void;
}

export function ConstructorCard({ constructor, onOpenSheet, onRemove }: ConstructorCardProps) {
  return (
    <RoleCard
      adding={!constructor}
      role="Constructor"
      name={constructor?.name ?? ''}
      points={constructor?.points ?? 0}
      price={constructor?.price ?? 0}
      onOpenSheet={onOpenSheet}
      onRemove={onRemove}
    />
  );
}
