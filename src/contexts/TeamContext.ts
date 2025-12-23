import { createContext } from 'react';

export interface TeamContextType {
  myTeamId: number | null;
  hasTeam: boolean;
  isCheckingTeam: boolean;
  refreshMyTeam: () => Promise<void>;
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined);
