import { formatMillions } from '@/lib/utils';
import { Trash } from 'lucide-react';

import { Button } from '../ui/button';

interface InfoRoleCardContentProps {
  role: string;
  name: string;
  points: number;
  price: number;
  onRemove: () => void;
}
export function InfoRoleCardContent({
  role,
  name,
  points,
  price,
  onRemove,
}: InfoRoleCardContentProps) {
  return (
    <div className="flex h-full w-full">
      <span className="aspect-square w-14 self-center rounded-full border-2 border-gray-300"></span>
      <div className="flex h-full flex-1 flex-col items-start justify-between pl-4">
        <h3 className="text-sm font-bold">{name}</h3>
        <div className="mt-auto flex gap-6">
          <span className="text-sm">{points} pts.</span>
          <span className="text-sm">${formatMillions(price)}m</span>
        </div>
      </div>
      <Button
        size="icon"
        className="ml-auto items-end !bg-transparent text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-700"
        aria-label={`Remove ${role}`}
        onClick={onRemove}
      >
        <Trash />
      </Button>
    </div>
  );
}
