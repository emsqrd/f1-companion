import type { Team } from '@/contracts/Team';
import { getTeams } from '@/services/teamService';
import { useEffect, useState } from 'react';

import { AppContainer } from '../AppContainer/AppContainer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function Leaderboard() {
  const [teams, setTeams] = useState<Team[] | null>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams();
        setTeams(data);
      } catch {}
    };
    fetchTeams();
  }, []);

  return (
    <AppContainer maxWidth="md">
      <Table className="bg-card overflow-hidden rounded-lg">
        <TableHeader className="bg-secondary sticky top-0 font-bold">
          <TableRow>
            <TableHead className="text-center text-lg font-bold">Rank</TableHead>
            <TableHead className="min-w-48 text-lg font-bold">Team</TableHead>
            <TableHead className="text-center text-lg font-bold">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams?.map((team) => (
            <TableRow key={team.id} className="cursor-pointer">
              <TableCell className="text-center align-top text-lg">{team.rank}</TableCell>
              <TableCell className="min-w-48 align-top">
                <div className="flex flex-col">
                  <div className="text-lg">{team.name}</div>
                  <div className="text-muted-foreground">{team.ownerName}</div>
                </div>
              </TableCell>
              <TableCell className="text-center align-top text-lg">{team.totalPoints}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppContainer>
  );
}
