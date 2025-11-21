import type { Constructor } from '@/contracts/Role';

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
    { id: 9, name: 'Kick Sauber', countryAbbreviation: 'CHE' },
    { id: 10, name: 'Kick Sauber', countryAbbreviation: 'CHE' },
    { id: 11, name: 'McLaren', countryAbbreviation: 'GBR' },
    { id: 12, name: 'McLaren', countryAbbreviation: 'GBR' },
    { id: 13, name: 'Mercedes', countryAbbreviation: 'GER' },
    { id: 14, name: 'Mercedes', countryAbbreviation: 'GER' },
    { id: 15, name: 'Racing Bulls', countryAbbreviation: 'ITA' },
    { id: 16, name: 'Racing Bulls', countryAbbreviation: 'ITA' },
    { id: 17, name: 'Red Bull', countryAbbreviation: 'AUT' },
    { id: 18, name: 'Red Bull', countryAbbreviation: 'AUT' },
    { id: 19, name: 'Williams', countryAbbreviation: 'GBR' },
    { id: 20, name: 'Williams', countryAbbreviation: 'GBR' },
  ];

  return constructors;
}
