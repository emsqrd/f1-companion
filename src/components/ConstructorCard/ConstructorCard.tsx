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
      points={100}
      price={32}
      onOpenSheet={onOpenSheet}
      onRemove={onRemove}
    />
  );
}
