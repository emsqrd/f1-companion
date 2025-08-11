export interface BaseRole {
  id: number;
  countryAbbreviation: string;
  price: number;
  points: number;
}

export interface Driver extends BaseRole {
  firstName: string;
  lastName: string;
}

export interface Constructor extends BaseRole {
  name: string;
}
