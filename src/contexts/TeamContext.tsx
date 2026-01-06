import { getMyTeam } from '@/services/teamService';
import * as Sentry from '@sentry/react';
import { useCallback, useMemo, useState } from 'react';

import { TeamContext } from './TeamContext.ts';

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [myTeamId, setMyTeamId] = useState<number | null>(null);

  const refreshMyTeam = useCallback(async () => {
    try {
      const team = await getMyTeam();
      setMyTeamId(team?.id ?? null);
    } catch (error) {
      Sentry.captureException(error);
      setMyTeamId(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      myTeamId,
      hasTeam: myTeamId !== null,
      setMyTeamId,
      refreshMyTeam,
    }),
    [myTeamId, refreshMyTeam],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
