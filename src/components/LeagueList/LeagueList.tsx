import type { League } from '@/contracts/League';
import { getMyLeagues } from '@/services/leagueService';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { AppContainer } from '../AppContainer/AppContainer';
import { CreateLeague } from '../CreateLeague/CreateLeague';
import { Card } from '../ui/card';

export function LeagueList() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getMyLeagues();
        setLeagues(data);
      } catch {
        // Error already captured by API client (5xx or network errors)
        setError('Failed to load leagues');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (error) {
    return <div role="alert">{error}</div>;
  }

  if (isLoading) {
    return (
      <div role="loader" className="flex w-full items-center justify-center p-8 md:min-h-screen">
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
      <header className="flex justify-between pb-4">
        <h2 className="mb-2 text-2xl font-semibold">Joined Leagues</h2>
        <CreateLeague
          onLeagueCreated={(league) => navigate({ to: `/league/${league.id}` })}
        ></CreateLeague>
      </header>
      <div aria-label="league-list">
        {leagues.map((league) => (
          <Card key={league.id} className="mb-4 overflow-hidden p-0">
            <button
              type="button"
              className="hover:bg-accent focus:ring-ring w-full cursor-pointer p-6 text-left transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
              aria-label={`View league: ${league.name}`}
              onClick={() => navigate({ to: `/league/${league.id}` })}
            >
              <h3 className="text-lg font-medium">{league.name}</h3>
            </button>
          </Card>
        ))}
      </div>
    </AppContainer>
  );
}
