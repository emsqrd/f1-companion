import type { League } from '@/contracts/League';
import { getLeagues } from '@/services/leagueService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { AppContainer } from '../AppContainer/AppContainer';
import { Card, CardContent } from '../ui/card';

export function LeagueList() {
  const [leagues, setLeagues] = useState<League[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getLeagues();
        setLeagues(data);
      } catch (err) {
        console.error('Failed to load leagues: ', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="text-center">
          <div
            role="status"
            className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
          ></div>
          <p className="text-muted-foreground">Loading Leagues...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContainer maxWidth="md" className="p-8">
      <h2 className="mb-2 text-2xl font-semibold">My Leagues</h2>
      <div>
        <ul>
          {leagues?.map((league) => (
            <Card
              key={league.id}
              className="mb-4 cursor-pointer"
              onClick={() => navigate(`/league/${league.id}`)}
            >
              <CardContent>{league.name}</CardContent>
            </Card>
          ))}
        </ul>
      </div>
    </AppContainer>
  );
}
