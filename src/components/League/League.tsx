import { getTeams } from '@/services/teamService';
import { Link } from 'react-router';

import { Card, CardContent } from '../ui/card';

export function League() {
  const teams = getTeams();

  return (
    <>
      <div className="flex flex-col items-start pb-1">
        <p className="font-semibold">League</p>
        <h2 className="text-3xl font-semibold">COTA 2025</h2>
      </div>
      <hr className="border-border mb-4" />
      <ol className="grid grid-cols-1 gap-2">
        {teams.map((team) => (
          <li key={team.id}>
            <Link to={`/team/${team.id}`}>
              <Card className="rounded-sm py-2">
                <CardContent>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground font-mono text-sm">
                        #
                        {
                          team.id //rank
                        }
                      </div>
                      <div className="font-semibold">{team.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground text-sm">Owner:</div>
                      <div>{team.owner}</div>
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
