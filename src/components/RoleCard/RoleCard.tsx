import type { ReactNode } from 'react';

import { Card, CardContent } from '../ui/card';

export function RoleCard({ renderCardContent }: { renderCardContent: () => ReactNode }) {
  return (
    <Card className="w-80 h-30">
      <CardContent className="flex items-center justify-between group h-full">
        {renderCardContent()}
      </CardContent>
    </Card>
  );
}
