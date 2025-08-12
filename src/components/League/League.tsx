import { getTeams } from '@/services/teamService';
import { Link } from 'react-router';

import { Card, CardContent } from '../ui/card';

export function League() {
  const teams = getTeams();

  // Generate random points between 0 and 8000 for mocking purposes
  const getRandomPoints = () => Math.floor(Math.random() * 8001);

  return (
    <>
      <div className="flex flex-col items-start pb-1">
        <p className="font-semibold">League</p>
        <h2 className="text-3xl font-semibold">COTA 2025</h2>
      </div>
      <hr className="border-border mb-4" />
      <ol className="grid grid-cols-1 gap-2">
        {teams.map((team, idx) => (
          <li key={team.id}>
            <Link to={`/team/${team.id}`}>
              <Card className="rounded-sm py-2">
                <CardContent>
                  <div className="flex flex-col items-start gap-1">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="text-muted-foreground font-mono text-sm">#{idx + 1}</div>
                      <div className="font-semibold">{team.name}</div>
                    </div>
                    <div className="flex w-full items-center gap-14">
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground text-sm">Owner:</div>
                        <div>{team.owner}</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div>{getRandomPoints().toLocaleString()} pts.</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
