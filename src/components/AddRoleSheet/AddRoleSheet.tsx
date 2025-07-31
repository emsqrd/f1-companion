import { CirclePlus } from 'lucide-react';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface AddRoleSheetProps {
  role: string;
  pool: string[];
  onAddRole: (name: string) => void;
}

const AddRoleSheet: React.FC<AddRoleSheetProps> = ({ role, pool, onAddRole }) => {
  const roleList = pool.map((name) => (
    <li key={name} className="flex justify-between items-center pb-4">
      {name}
      <Button
        variant="ghost"
        className="!bg-transparent"
        aria-label={`Add ${name}`}
        onClick={() => onAddRole(name)}
      >
        <CirclePlus />
      </Button>
    </li>
  ));

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
          <SheetTitle>Add {role}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 h-full pr-4">
          <div>
            <ul className="space-y-2 divide-y p-4">{roleList}</ul>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AddRoleSheet;
