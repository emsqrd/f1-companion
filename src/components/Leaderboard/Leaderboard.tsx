import type { Team } from '@/contracts/Team';
import { getTeams } from '@/services/teamService';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { AppContainer } from '../AppContainer/AppContainer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function Leaderboard() {
  const [teams, setTeams] = useState<Team[]>([]);

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
    <AppContainer maxWidth="sm">
      <Table className="bg-card overflow-hidden rounded-lg">
        <TableHeader className="bg-secondary sticky top-0 font-bold">
          <TableRow>
            <TableHead className="text-center text-lg font-bold">Rank</TableHead>
            <TableHead className="min-w-48 text-lg font-bold">Team</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow key={team.id} className="hover:bg-accent transition-colors">
              <TableCell className="text-center align-top text-lg">{index + 1}</TableCell>
              <TableCell className="min-w-48 align-top">
                <Link
                  to="/team/$teamId"
                  params={{ teamId: String(team.id) }}
                  className="focus:ring-ring block cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-offset-2"
                  aria-label={`View team: ${team.name}`}
                  preload="intent"
                >
                  <div className="flex flex-col">
                    <div className="text-lg hover:underline">{team.name}</div>
                    <div className="text-muted-foreground">{team.ownerName}</div>
                  </div>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AppContainer>
  );
}
