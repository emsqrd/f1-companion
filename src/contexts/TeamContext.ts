import { createContext } from 'react';

export interface TeamContextType {
  myTeamId: number | null;
  hasTeam: boolean;
  isCheckingTeam: boolean;
  refreshMyTeam: () => void;
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined);
