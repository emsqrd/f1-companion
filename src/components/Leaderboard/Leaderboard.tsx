import { getTeams } from '@/services/teamService';
import { useNavigate } from 'react-router';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function Leaderboard() {
  const teams = getTeams();
  const navigate = useNavigate();

  // Generate random points between 0 and 8000 for mocking purposes
  const getRandomPoints = () => Math.floor(Math.random() * 8001);

  return (
    <div className="mx-auto max-w-sm px-4 md:max-w-lg md:px-8">
      <h2 className="mb-2 text-2xl font-semibold">League Leaderboard</h2>
      <Table className="bg-card overflow-hidden rounded-lg">
        <TableHeader className="bg-secondary sticky top-0 font-bold">
          <TableRow>
            <TableHead className="text-center font-bold">Rank</TableHead>
            <TableHead className="min-w-48 font-bold">Team</TableHead>
            <TableHead className="text-center font-bold">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, idx) => (
            <TableRow
              key={team.id}
              className="cursor-pointer"
              onClick={() => navigate(`/team/${team.id}`)}
            >
              <TableCell className="text-center align-top">{idx + 1}</TableCell>
              <TableCell className="min-w-48 align-top">
                <div className="flex flex-col">
                  <div>{team.name}</div>
                  <div className="text-muted-foreground text-xs">{team.owner}</div>
                </div>
              </TableCell>
              <TableCell className="text-center align-top">
                {getRandomPoints().toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
