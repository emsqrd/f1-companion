import { AddRoleCardContent } from '../AddRoleCardContent/AddRoleCardContent';
import { InfoRoleCardContent } from '../InfoRoleCardContent/InfoRoleCardContent';
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
      return (
        <InfoRoleCardContent
          role={role}
          name={name}
          points={points}
          price={price}
          onRemove={onRemove}
        />
      );
    }
  };

  return (
    <Card className="h-20 w-70">
      <CardContent className="group flex h-full items-center justify-between px-3">
        {renderCardContent()}
      </CardContent>
    </Card>
  );
}
