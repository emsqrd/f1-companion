import { X } from 'lucide-react';

import { AddRoleCardContent } from '../AddRoleCardContent/AddRoleCardContent';
import { InfoRoleCardContent } from '../InfoRoleCardContent/InfoRoleCardContent';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface RoleCardProps {
  adding: boolean;
  role: string;
  name: string;
  points: number;
  price: number;
  onOpenSheet: () => void;
  onRemove: () => void;
}

export function RoleCard({
  adding,
  role,
  name,
  points,
  price,
  onOpenSheet,
  onRemove,
}: RoleCardProps) {
  const renderCardContent = () => {
    if (adding) {
      return <AddRoleCardContent onOpenSheet={onOpenSheet} role={role} />;
    } else {
      return <InfoRoleCardContent name={name} points={points} price={price} />;
    }
  };

  return (
    <Card className="relative h-20 w-70">
      <CardContent className="group flex h-full items-center justify-between px-3">
        {renderCardContent()}
      </CardContent>
      {!adding && (
        <Button
          size="icon"
          variant="ghost"
          className="bg-card absolute top-2 right-2 h-6 w-6 rounded-full text-white shadow-md"
          aria-label={`Remove ${role}`}
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Card>
  );
}
