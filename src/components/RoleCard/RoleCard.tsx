import { X } from 'lucide-react';

import { AddRoleCardContent } from '../AddRoleCardContent/AddRoleCardContent';
import { InfoRoleCardContent } from '../InfoRoleCardContent/InfoRoleCardContent';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export type RoleCardProps =
  | {
      variant: 'empty';
      role: string;
      onOpenSheet: () => void;
    }
  | {
      variant: 'filled';
      name: string;
      points: number;
      price: number;
      onRemove: () => void;
    };

export function RoleCard(props: RoleCardProps) {
  const renderCardContent = () => {
    if (props.variant === 'empty') {
      return <AddRoleCardContent onOpenSheet={props.onOpenSheet} role={props.role} />;
    } else {
      return <InfoRoleCardContent name={props.name} points={props.points} price={props.price} />;
    }
  };

  return (
    <Card className="relative h-20 w-70">
      <CardContent className="group flex h-full items-center justify-between px-3">
        {renderCardContent()}
      </CardContent>
      {props.variant === 'filled' && (
        <Button
          size="icon"
          variant="ghost"
          className="bg-card absolute top-2 right-2 h-6 w-6 rounded-full text-white shadow-md"
          aria-label="Remove role"
          onClick={props.onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Card>
  );
}
