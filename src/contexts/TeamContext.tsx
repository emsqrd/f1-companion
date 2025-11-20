import { useAuth } from '@/hooks/useAuth';
import { getMyTeam } from '@/services/teamService';
import * as Sentry from '@sentry/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { TeamContext } from './TeamContext.ts';

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const [isCheckingTeam, setIsCheckingTeam] = useState(false);

  // Fetch team when user changes
  useEffect(() => {
    if (!user) {
      setMyTeamId(null);
      setIsCheckingTeam(false);
      return;
    }

    let mounted = true;
    setIsCheckingTeam(true);

    const fetchTeam = async () => {
      try {
        const team = await getMyTeam();
        if (mounted) {
          setMyTeamId(team?.id ?? null);
          Sentry.logger.debug(
            Sentry.logger.fmt`User team fetched: ${team ? `Team ID ${team.id}` : 'No team'}`,
          );
        }
      } catch (error) {
        const fetchError = error instanceof Error ? error : new Error('Failed to fetch team');
        Sentry.logger.error(Sentry.logger.fmt`Failed to fetch user team: ${fetchError.message}`);
        Sentry.captureException(fetchError, {
          contexts: {
            team: { userId: user.id },
          },
        });
        if (mounted) {
          setMyTeamId(null);
        }
      } finally {
        if (mounted) {
          setIsCheckingTeam(false);
        }
      }
    };

    fetchTeam();

    return () => {
      mounted = false;
    };
  }, [user]);

  const refreshMyTeam = useCallback(async () => {
    if (!user) return;

    setIsCheckingTeam(true);

    try {
      const team = await getMyTeam();
      setMyTeamId(team?.id ?? null);
      Sentry.logger.debug(
        Sentry.logger.fmt`User team refreshed: ${team ? `Team ID ${team.id}` : 'No team'}`,
      );
    } catch (error) {
      const fetchError = error instanceof Error ? error : new Error('Failed to fetch team');
      Sentry.logger.error(Sentry.logger.fmt`Failed to refresh user team: ${fetchError.message}`);
      Sentry.captureException(fetchError, {
        contexts: {
          team: { userId: user.id },
        },
      });
      setMyTeamId(null);
    } finally {
      setIsCheckingTeam(false);
    }
  }, [user]);

  const value = useMemo(
    () => ({
      myTeamId,
      hasTeam: myTeamId !== null,
      isCheckingTeam,
      refreshMyTeam,
    }),
    [myTeamId, isCheckingTeam, refreshMyTeam],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
