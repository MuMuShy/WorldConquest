import { Army } from './country.model';

export interface PlayerBuff {
  name: string;
  value: string;
  icon: string;
}

export interface PlayerAlert {
  type: string;
  message: string;
  urgent: boolean;
}

export type Faction = 'alliance' | 'empire' | null;

export interface Player {
  id: number;
  name: string;
  level: number;
  avatar: string;
  ownedCountries: number;
  totalPopulation: number;
  ownedTerritories: number;
  income: number;
  influence: number; // 全球影響力 %
  buffs: PlayerBuff[];
  alerts: PlayerAlert[];
  wallet?: string; // web3 地址
  warToken?: number; // $WAR 治理幣
  nfts?: string[]; // 擁有的土地 NFT id
  resources: {
    money: number;
    soldiers: number;
    crystals: number;
    power: number;
  };
  stats: {
    attack: number;
    defense: number;
    speed: number;
  };
  health: {
    current: number;
    max: number;
  };
  energy: {
    current: number;
    max: number;
  };
  experience: {
    current: number;
    required: number;
  };
  faction?: Faction;
  army: Army;
}