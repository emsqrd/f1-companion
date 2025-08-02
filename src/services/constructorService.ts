import type { Constructor } from '@/contracts/Roles';

export function getAllConstructors(): Constructor[] {
  const constructors: Constructor[] = [
    { id: 1, name: 'Alpine', countryAbbreviation: 'FRA' },
    { id: 2, name: 'Alpine', countryAbbreviation: 'FRA' },
    { id: 3, name: 'Aston Martin', countryAbbreviation: 'GBR' },
    { id: 4, name: 'Aston Martin', countryAbbreviation: 'GBR' },
    { id: 5, name: 'Ferrari', countryAbbreviation: 'ITA' },
    { id: 6, name: 'Ferrari', countryAbbreviation: 'ITA' },
    { id: 7, name: 'Haas', countryAbbreviation: 'USA' },
    { id: 8, name: 'Haas', countryAbbreviation: 'USA' },
    { id: 9, name: 'McLaren', countryAbbreviation: 'GBR' },
    { id: 10, name: 'McLaren', countryAbbreviation: 'GBR' },
    { id: 11, name: 'Mercedes', countryAbbreviation: 'GER' },
    { id: 12, name: 'Mercedes', countryAbbreviation: 'GER' },
    { id: 13, name: 'Racing Bulls', countryAbbreviation: 'ITA' },
    { id: 14, name: 'Racing Bulls', countryAbbreviation: 'ITA' },
    { id: 15, name: 'Red Bull Racing', countryAbbreviation: 'AUT' },
    { id: 16, name: 'Red Bull Racing', countryAbbreviation: 'AUT' },
    { id: 17, name: 'Sauber', countryAbbreviation: 'CHE' },
    { id: 18, name: 'Sauber', countryAbbreviation: 'CHE' },
    { id: 19, name: 'Williams', countryAbbreviation: 'GBR' },
    { id: 20, name: 'Williams', countryAbbreviation: 'GBR' },
  ];

  return constructors;
}
