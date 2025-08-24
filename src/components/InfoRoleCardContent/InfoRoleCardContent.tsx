import { formatMillions } from '@/lib/utils';

export interface InfoRoleCardContentProps {
  name: string;
  points: number;
  price: number;
}
export function InfoRoleCardContent({ name, points, price }: InfoRoleCardContentProps) {
  return (
    <div className="flex w-full">
      <span className="aspect-square w-14 self-center rounded-full border-2 border-gray-300"></span>
      <div className="flex flex-1 flex-col items-start justify-between pl-4">
        <h3 className="text-sm font-bold">{name}</h3>
        <div className="flex w-full justify-between pr-2">
          <span className="text-sm">{points} pts.</span>
          <span className="text-sm">${formatMillions(price)}m</span>
        </div>
      </div>
    </div>
  );
}
