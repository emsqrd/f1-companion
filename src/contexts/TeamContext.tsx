import type { Team } from '@/contracts/Team';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/hooks/useAuth';
import { getMyTeam } from '@/services/teamService';
import { useMemo } from 'react';

import { TeamContext } from './TeamContext.ts';

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const {
    data: team,
    isLoading: isCheckingTeam,
    error,
    refetch: refetchTeam,
    setData: setTeam,
    clearError,
  } = useAsyncData<Team>({
    fetchFn: getMyTeam,
    deps: [user],
    enabled: !!user,
    name: 'TeamData',
    errorContext: { userId: user?.id },
  });

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
