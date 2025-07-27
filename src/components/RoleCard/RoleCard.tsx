import { Car, CirclePlus, CircleUserRound } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

interface RoleCardProps {
  role: string;
  name: string;
  onAddRole: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, name, onAddRole }) => {
  const renderContent = () => {
    if (name === '') {
      return (
        <Button
          className="flex items-center gap-2 text-gray-500 !bg-transparent hover:text-gray-400 hover:!border-transparent"
          onClick={onAddRole}
        >
          <CirclePlus />
          Add {role}
        </Button>
      );
    } else {
      return (
        <Button className="flex items-center gap-2 text-white-500 !bg-transparent hover:!border-transparent focus:!border-transparent">
          {role === 'Driver' ? <CircleUserRound /> : <Car />}
          {name}
        </Button>
      );
    }
  };

  return (
    <Card className="w-60 h-20">
      <CardContent className="flex items-center justify-center gap-2">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RoleCard;
