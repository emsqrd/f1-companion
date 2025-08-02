import type { Driver } from '@/contracts/Roles';

export function getAllDrivers(): Driver[] {
  const drivers: Driver[] = [
    { id: 1, firstName: 'Oscar', lastName: 'Piastri', countryAbbreviation: 'AUS' },
    { id: 2, firstName: 'Lando', lastName: 'Norris', countryAbbreviation: 'GBR' },
    { id: 3, firstName: 'Charles', lastName: 'Leclerc', countryAbbreviation: 'MON' },
    { id: 4, firstName: 'Lewis', lastName: 'Hamilton', countryAbbreviation: 'GBR' },
    { id: 5, firstName: 'George', lastName: 'Russell', countryAbbreviation: 'GBR' },
    { id: 6, firstName: 'Kimi', lastName: 'Antonelli', countryAbbreviation: 'ITA' },
    { id: 7, firstName: 'Max', lastName: 'Verstappen', countryAbbreviation: 'NED' },
    { id: 8, firstName: 'Yuki', lastName: 'Tsunoda', countryAbbreviation: 'JPN' },
    { id: 9, firstName: 'Alexander', lastName: 'Albon', countryAbbreviation: 'THA' },
    { id: 10, firstName: 'Carlos', lastName: 'Sainz', countryAbbreviation: 'ESP' },
    { id: 11, firstName: 'Nico', lastName: 'Hulkenberg', countryAbbreviation: 'GER' },
    { id: 12, firstName: 'Gabriel', lastName: 'Bortoleto', countryAbbreviation: 'BRA' },
    { id: 13, firstName: 'Liam', lastName: 'Lawson', countryAbbreviation: 'NZL' },
    { id: 14, firstName: 'Isack', lastName: 'Hadjar', countryAbbreviation: 'FRA' },
    { id: 15, firstName: 'Lance', lastName: 'Stroll', countryAbbreviation: 'CAN' },
    { id: 16, firstName: 'Fernando', lastName: 'Alonso', countryAbbreviation: 'ESP' },
    { id: 17, firstName: 'Esteban', lastName: 'Ocon', countryAbbreviation: 'FRA' },
    { id: 18, firstName: 'Oliver', lastName: 'Bearman', countryAbbreviation: 'GBR' },
    { id: 19, firstName: 'Pierre', lastName: 'Gasly', countryAbbreviation: 'FRA' },
    { id: 20, firstName: 'Franco', lastName: 'Colapinto', countryAbbreviation: 'ARG' },
  ];

  return drivers;
}
