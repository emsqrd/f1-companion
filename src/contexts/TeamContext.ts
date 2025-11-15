import type { Team } from '@/contracts/Team';
import { createContext } from 'react';

export interface TeamContextType {
  team: Team | null;
  hasTeam: boolean;
  isCheckingTeam: boolean;
  error: Error | null;
  setTeam: (team: Team) => void;
  refetchTeam: () => Promise<void>;
  clearError: () => void;
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined);
