import { CirclePlus } from 'lucide-react';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

interface AddRoleSheetProps<T extends { id: string | number }> {
  role: string;
  pool: T[];
  onAddRole: (item: T) => void;
  getLabel: (item: T) => string;
}

export const AddRoleSheet = <T extends { id: string | number }>(): React.FC<AddRoleSheetProps<T>> =>
  function InnerAddRoleSheet({ role, pool, onAddRole, getLabel }) {
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
          <ScrollArea className="flex-1 h-full pr-4 pl-4 min-h-0">
            <ul className="space-y-2 divide-y">
              {pool.map((item) => {
                const label = getLabel(item);
                const key = item.id;
                return (
                  <li key={key} className="flex justify-between items-center pb-4">
                    {label}
                    <Button
                      variant="ghost"
                      className="!bg-transparent"
                      aria-label={`Add ${label}`}
                      onClick={() => onAddRole(item)}
                    >
                      <CirclePlus />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  };

export default AddRoleSheet;
