import { useAuth } from '@/hooks/useAuth';

import { Leaderboard } from '../Leaderboard/Leaderboard';
import { Button } from '../ui/button';

export function League() {
  const { signOut } = useAuth();

  return (
    <div className="p-2">
      <div className="p-4">
        <header className="flex justify-between">
          <div className="flex flex-col items-start pb-1">
            <p className="text-muted-foreground font-medium">League</p>
            <h2 className="text-3xl font-bold">COTA 2025</h2>
          </div>
          <Button onClick={signOut}>Sign Out</Button>
        </header>
      </div>
      <Leaderboard />
    </div>
  );
}
