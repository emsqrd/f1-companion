import type { Constructor } from '@/contracts/Role';

export function getAllConstructors(): Constructor[] {
  const constructors: Constructor[] = [
    { id: 1, name: 'Alpine', countryAbbreviation: 'FRA', price: 5500000, points: 2 },
    { id: 2, name: 'Alpine', countryAbbreviation: 'FRA', price: 5500000, points: 2 },
    { id: 3, name: 'Aston Martin', countryAbbreviation: 'GBR', price: 9500000, points: 60 },
    { id: 4, name: 'Aston Martin', countryAbbreviation: 'GBR', price: 9500000, points: 60 },
    { id: 5, name: 'Ferrari', countryAbbreviation: 'ITA', price: 21800000, points: 66 },
    { id: 6, name: 'Ferrari', countryAbbreviation: 'ITA', price: 21800000, points: 66 },
    { id: 7, name: 'Haas', countryAbbreviation: 'USA', price: 8100000, points: 8 },
    { id: 8, name: 'Haas', countryAbbreviation: 'USA', price: 8100000, points: 8 },
    { id: 9, name: 'Kick Sauber', countryAbbreviation: 'CHE', price: 13000000, points: 53 },
    { id: 10, name: 'Kick Sauber', countryAbbreviation: 'CHE', price: 13000000, points: 53 },
    { id: 11, name: 'McLaren', countryAbbreviation: 'GBR', price: 39100000, points: 152 },
    { id: 12, name: 'McLaren', countryAbbreviation: 'GBR', price: 39100000, points: 152 },
    { id: 13, name: 'Mercedes', countryAbbreviation: 'GER', price: 17100000, points: 102 },
    { id: 14, name: 'Mercedes', countryAbbreviation: 'GER', price: 17100000, points: 102 },
    { id: 15, name: 'Racing Bulls', countryAbbreviation: 'ITA', price: 5500000, points: 24 },
    { id: 16, name: 'Racing Bulls', countryAbbreviation: 'ITA', price: 5500000, points: 24 },
    { id: 17, name: 'Red Bull', countryAbbreviation: 'AUT', price: 15000000, points: 23 },
    { id: 18, name: 'Red Bull', countryAbbreviation: 'AUT', price: 15000000, points: 23 },
    { id: 19, name: 'Williams', countryAbbreviation: 'GBR', price: 7200000, points: 21 },
    { id: 20, name: 'Williams', countryAbbreviation: 'GBR', price: 7200000, points: 21 },
  ];

  return constructors;
}
