import { getTeams } from '@/services/teamService';
import { useNavigate } from 'react-router';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function League() {
  const teams = getTeams();
  const navigate = useNavigate();

  // Generate random points between 0 and 8000 for mocking purposes
  const getRandomPoints = () => Math.floor(Math.random() * 8001);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <header>
          <div className="flex flex-col items-start pb-1">
            <p className="text-muted-foreground font-medium">League</p>
            <h2 className="text-3xl font-bold">COTA 2025</h2>
          </div>
        </header>
      </div>
      <div className="mx-auto max-w-sm px-4 md:max-w-lg md:px-8">
        <h2 className="text-xl font-semibold">League Leaderboard</h2>
        <Table>
          <TableHeader className="sticky top-0 font-bold">
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead className="min-w-48">Team</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-card outline">
            {teams.map((team, idx) => (
              <TableRow
                key={team.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/team/${team.id}`)}
              >
                <TableCell>{idx + 1}</TableCell>
                <TableCell className="min-w-48">
                  <div className="flex flex-col">
                    <div>{team.name}</div>
                    <div className="text-muted-foreground text-sm">{team.owner}</div>
                  </div>
                </TableCell>
                <TableCell>{getRandomPoints().toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
