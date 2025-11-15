import type { Team } from '@/contracts/Team';
import { useAuth } from '@/hooks/useAuth';
import { getMyTeam } from '@/services/teamService';
import * as Sentry from '@sentry/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { TeamContext } from './TeamContext';

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [team, setTeamState] = useState<Team | null>(null);
  const [isCheckingTeam, setIsCheckingTeam] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!user) {
      setTeamState(null);
      setIsCheckingTeam(false);
      return;
    }

    setIsCheckingTeam(true);
    setError(null);

    try {
      const teamData = await getMyTeam();
      Sentry.logger.debug(Sentry.logger.fmt`TeamProvider fetched team data`, { teamData });

      // Update team state and isCheckingTeam together to avoid race condition
      setTeamState(teamData);
      setIsCheckingTeam(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch team');
      Sentry.logger.error(Sentry.logger.fmt`TeamProvider error fetching team: ${error.message}`);

      setError(error);
      setIsCheckingTeam(false);

      Sentry.captureException(error, {
        contexts: {
          team: { userId: user.id },
        },
      });
    }
  }, [user]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const setTeam = useCallback((newTeam: Team) => {
    setTeamState(newTeam);
    setError(null); // Clear any previous errors when setting a team
  }, []);

  const refetchTeam = useCallback(async () => {
    await fetchTeam();
  }, [fetchTeam]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      team,
      hasTeam: team !== null,
      isCheckingTeam,
      error,
      setTeam,
      refetchTeam,
      clearError,
    }),
    [team, isCheckingTeam, error, setTeam, refetchTeam, clearError],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
