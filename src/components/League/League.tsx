import { Leaderboard } from '../Leaderboard/Leaderboard';

export function League() {
  return (
    <div className="p-2">
      <div className="p-4">
        <header>
          <div className="flex flex-col items-start pb-1">
            <p className="text-muted-foreground font-medium">League</p>
            <h2 className="text-3xl font-bold">COTA 2025</h2>
          </div>
        </header>
      </div>
      <Leaderboard />
    </div>
  );
}
