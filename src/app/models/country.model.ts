export type CountryStatus = 'Idle' | 'UnderAttack' | 'Rebelling' | 'Propaganda' | 'Recovering';

export interface Army {
  infantry: number; // 士兵
  tank: number;     // 坦克
  warship: number;  // 軍艦
  fighter: number;  // 戰機
}

export interface Country {
  id: string;
  name: string;
  owner: 'Neutral' | 'You' | 'Other';
  population: number;
  loyalty: number;
  income: number;
  status: CountryStatus;
  army: Army;
  geometry?: any;
  center?: { lng: number; lat: number };
}

export interface CountryState {
  [key: string]: Country;
}