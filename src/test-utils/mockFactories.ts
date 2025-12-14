import type { Team, TeamDriver } from '@/contracts/Team';

/**
 * Test utility: Creates a mock TeamDriver with sensible defaults.
 * 
 * @example
 * const driver = createMockTeamDriver({ firstName: 'Lewis', lastName: 'Hamilton' });
 */
export function createMockTeamDriver(overrides: Partial<TeamDriver> = {}): TeamDriver {
  return {
    slotPosition: 0,
    id: 1,
    firstName: 'Test',
    lastName: 'Driver',
    abbreviation: 'TDR',
    countryAbbreviation: 'TST',
    ...overrides,
  };
}

/**
 * Test utility: Creates a mock Team with sensible defaults.
 * 
 * @example
 * // Basic usage
 * const team = createMockTeam();
 * 
 * // With custom properties
 * const team = createMockTeam({ name: 'Red Bull Racing' });
 * 
 * // With drivers
 * const team = createMockTeam({ 
 *   name: 'McLaren',
 *   drivers: [
 *     createMockTeamDriver({ firstName: 'Lando', lastName: 'Norris', slotPosition: 0 }),
 *     createMockTeamDriver({ firstName: 'Oscar', lastName: 'Piastri', slotPosition: 1 }),
 *   ]
 * });
 */
export function createMockTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 1,
    name: 'Test Team',
    ownerName: 'Test Owner',
    drivers: [],
    ...overrides,
  };
}
