import { Car, CirclePlus, CircleUserRound, Trash } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface RoleCardProps {
  role: string;
  name: string;
  pool: string[];
  onAddRole: (name: string) => void;
  onRemoveRole: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, name, pool, onAddRole, onRemoveRole }) => {
  const renderContent = () => {
    const driverList = pool.map((name) => (
      <li key={name} className="flex justify-between items-center pb-4">
        {name}
        <Button variant="ghost" className="!bg-transparent" onClick={() => onAddRole(name)}>
          <CirclePlus />
        </Button>
      </li>
    ));

    if (name === '') {
      return (
        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2 text-gray-500 !bg-transparent hover:text-gray-400">
              <CirclePlus />
              Add {role}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-80 flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>Add Driver</SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 h-full pr-4 overflow-y-auto">
              <div>
                <ul className="space-y-2 divide-y p-4">{driverList}</ul>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      );
    } else {
      return (
        <div className="flex items-counter justify-between gap-2 group">
          <Button className="flex items-center gap-2 text-white-500 !bg-transparent hover:!border-transparent">
            <span className="flex items-center gap-2">
              {role === 'Driver' ? <CircleUserRound /> : <Car />}
              {name}
            </span>
          </Button>
          <Button
            size="icon"
            className="text-red-500 hover:text-red-700 !bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemoveRole}
          >
            <Trash />
          </Button>
        </div>
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
