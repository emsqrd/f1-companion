import { Car, CircleUserRound, Trash } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import AddRoleSheet from '../AddRoleSheet/AddRoleSheet';

interface RoleCardProps {
  role: string;
  name: string;
  pool: string[];
  onAddRole: (name: string) => void;
  onRemoveRole: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, name, pool, onAddRole, onRemoveRole }) => {
  const renderContent = () => {
    const roleCard = (
      <div className="flex items-center justify-between gap-2 group">
        <Button className="flex items-center gap-2 text-white-500 !bg-transparent hover:!border-transparent">
          <span className="flex items-center gap-2">
            {role === 'Driver' ? <CircleUserRound /> : <Car />}
            {name}
          </span>
        </Button>
        <Button
          size="icon"
          className="text-red-500 hover:text-red-700 !bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove ${role}`}
          onClick={onRemoveRole}
        >
          <Trash />
        </Button>
      </div>
    );

    if (name === '') {
      return <AddRoleSheet role={role} pool={pool} onAddRole={onAddRole} />;
    } else {
      return roleCard;
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
