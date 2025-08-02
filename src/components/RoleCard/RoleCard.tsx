import { Trash } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import AddRoleSheet from '../AddRoleSheet/AddRoleSheet';

interface RoleCardProps<T> {
  role: string;
  selected: T | null;
  pool: T[];
  onAddRole: (item: T) => void;
  onRemoveRole: (item: T) => void;
  getLabel: (item: T) => string;
  getIcon: (item: T) => React.ReactNode;
}

export const RoleCard = <T,>(): React.FC<RoleCardProps<T>> =>
  function InnerRoleCard({ role, selected, pool, onAddRole, onRemoveRole, getLabel, getIcon }) {
    const DriverSheet = AddRoleSheet<T>();

    const label = selected ? getLabel(selected) : '';
    const body = label ? (
      <div className="flex items-center justify-between group">
        <Button className="flex items-center gap-2 text-white-500 !bg-transparent hover:!border-transparent">
          <span className="flex items-center gap-2">
            {getIcon(selected!)}
            {label}
          </span>
        </Button>
        <Button
          size="icon"
          className="text-red-500 hover:text-red-700 !bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove ${role}`}
          onClick={() => onRemoveRole(selected!)}
        >
          <Trash />
        </Button>
      </div>
    ) : (
      <DriverSheet role={role} pool={pool} onAddRole={onAddRole} getLabel={getLabel} />
    );

    return (
      <Card className="w-60 h-20">
        <CardContent className="flex items-center justify-center">{body}</CardContent>
      </Card>
    );
  };
