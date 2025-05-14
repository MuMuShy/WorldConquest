import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';
import { Country, CountryState } from '../models/country.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private dayCounter = new BehaviorSubject<number>(1);
  private playerData = new BehaviorSubject<Player>({
    name: 'Commander Alpha',
    gold: 100000,
    ownedCountries: 0,
    totalPopulation: 0,
    ownedTerritories: 0,
    income: 0
  });
  private countries = new BehaviorSubject<CountryState>({});
  
  public currentDay$ = this.dayCounter.asObservable();
  public player$ = this.playerData.asObservable();
  public countries$ = this.countries.asObservable();
  
  private gameLoopInterval: any = null;
  private readonly DAY_DURATION = 30000; // 30 seconds per game day
  
  constructor() {}
  
  public initGame(): void {
    this.startGameLoop();
  }
  
  public occupyCountry(countryId: string): void {
    const currentCountries = this.countries.value;
    const country = currentCountries[countryId];
    const player = this.playerData.value;
    
    if (country && country.owner !== 'You') {
      country.owner = 'You';
      country.loyalty = 50;
      
      this.countries.next({
        ...currentCountries,
        [countryId]: country
      });
      
      this.playerData.next({
        ...player,
        ownedCountries: player.ownedCountries + 1,
        ownedTerritories: player.ownedTerritories + 1,
        totalPopulation: player.totalPopulation + country.population,
        income: player.income + country.income
      });
    }
  }
  
  public taxCountry(countryId: string): void {
    const currentCountries = this.countries.value;
    const country = currentCountries[countryId];
    const player = this.playerData.value;
    
    if (country && country.owner === 'You' && country.loyalty >= 10) {
      country.loyalty = Math.max(0, country.loyalty - 10);
      
      this.countries.next({
        ...currentCountries,
        [countryId]: country
      });
      
      this.playerData.next({
        ...player,
        gold: player.gold + country.income
      });
    }
  }
  
  public runPropaganda(countryId: string): void {
    const currentCountries = this.countries.value;
    const country = currentCountries[countryId];
    const player = this.playerData.value;
    const propagandaCost = 100;
    
    if (country && country.owner === 'You' && player.gold >= propagandaCost) {
      country.loyalty = Math.min(100, country.loyalty + 10);
      
      this.countries.next({
        ...currentCountries,
        [countryId]: country
      });
      
      this.playerData.next({
        ...player,
        gold: player.gold - propagandaCost
      });
    }
  }
  
  public setCountries(countries: CountryState): void {
    this.countries.next(countries);
  }
  
  private startGameLoop(): void {
    this.dayCounter.next(1);
    
    this.gameLoopInterval = setInterval(() => {
      const nextDay = this.dayCounter.value + 1;
      this.dayCounter.next(nextDay);
      this.collectDailyIncome();
    }, this.DAY_DURATION);
  }
  
  private collectDailyIncome(): void {
    const currentCountries = this.countries.value;
    const player = this.playerData.value;
    let totalIncome = 0;
    
    Object.values(currentCountries).forEach(country => {
      if (country.owner === 'You') {
        totalIncome += country.income;
      }
    });
    
    this.playerData.next({
      ...player,
      gold: player.gold + totalIncome
    });
  }
  
  public stopGameLoop(): void {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
  }
}