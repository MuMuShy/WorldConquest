export type CountryStatus = 'Idle' | 'UnderAttack' | 'Rebelling' | 'Propaganda' | 'Recovering';

export interface Country {
  id: string;
  name: string;
  owner: 'Neutral' | 'You' | 'Other';
  population: number;
  loyalty: number;
  income: number;
  status: CountryStatus;
  geometry?: any;
}

export interface CountryState {
  [key: string]: Country;
}