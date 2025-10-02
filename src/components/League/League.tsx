import type { League } from '@/contracts/League';
import { getLeagueById } from '@/services/leagueService';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { AppContainer } from '../AppContainer/AppContainer';
import { Leaderboard } from '../Leaderboard/Leaderboard';

export function League() {
  const params = useParams();

  const [league, setLeague] = useState<League | null>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const data = await getLeagueById(Number(params.leagueId));
        setLeague(data);
        setError(null);
      } catch (error) {
        console.error('Failed to load league', error);
        setError('Failed to load league');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeague();
  }, [params.leagueId]);

  if (error) {
    return <div role="error">{error}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-8 md:min-h-screen">
        <div className="text-center">
          <div
            role="status"
            className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"
          ></div>
          <p className="text-muted-foreground">Loading League...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContainer maxWidth="md">
      <header className="m-4">
        <nav aria-label="Breadcrumb" className="mb-4">
          <Link
            to={`/leagues`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm transition-colors"
          >
            <ChevronLeft />
            Back to Leagues
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4">
          <header className="flex justify-between">
            <div className="flex flex-col items-start pb-1">
              <h2 className="text-3xl font-bold">{league?.name}</h2>
            </div>
          </header>
        </div>
        <Leaderboard />
      </div>
    </AppContainer>
  );
}
