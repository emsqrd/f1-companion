export interface BaseRole {
  id: number;
  countryAbbreviation: string;
}

export interface Driver extends BaseRole {
  firstName: string;
  lastName: string;
}

export interface Constructor extends BaseRole {
  name: string;
}
