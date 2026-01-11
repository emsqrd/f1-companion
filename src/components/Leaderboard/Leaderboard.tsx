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
            <Link
              key={team.id}
              to="/team/$teamId"
              params={{ teamId: String(team.id) }}
              className="hover:bg-accent focus:ring-ring contents cursor-pointer transition-colors focus:outline-none"
              aria-label={`View team: ${team.name}`}
              preload="intent"
            >
              <TableRow>
                <TableCell className="text-center align-top text-lg">{index + 1}</TableCell>
                <TableCell className="min-w-48 align-top">
                  <div className="flex flex-col">
                    <div className="text-lg">{team.name}</div>
                    <div className="text-muted-foreground">{team.ownerName}</div>
                  </div>
                </TableCell>
              </TableRow>
            </Link>
          ))}
        </TableBody>
      </Table>
    </AppContainer>
  );
}
