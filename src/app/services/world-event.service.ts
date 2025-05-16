import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Country, CountryStatus } from '../models/country.model';
import { HttpClient } from '@angular/common/http';

export interface WorldEvent {
  type: 'attack' | 'rebel' | 'recover' | 'missile' | 'armyMove' | 'disaster' | 'propaganda' | 'worldWar' | 'taiwanAttack' | 'playerDirectAttack';
  fromCountryId?: string;
  toCountryId?: string;
  payload?: any;
}

@Injectable({ providedIn: 'root' })
export class WorldEventService {
  private countriesSubject = new BehaviorSubject<Country[]>([]);
  countries$ = this.countriesSubject.asObservable();

  private eventSubject = new Subject<WorldEvent>();
  events$ = this.eventSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCountriesFromGeoJSON();
    setInterval(() => this.randomEvent(), Math.floor(Math.random() * 15000) + 2000);
  }

  private loadCountriesFromGeoJSON() {
    this.http.get<any>('/assets/countries.geo.json').subscribe(
      geojson => {
        const countries: Country[] = geojson.features.map((feature: any, i: number) => ({
          id: feature.properties.name,
          name: feature.properties.name,
          owner: 'Neutral',
          population: Math.floor(Math.random() * 100000000) + 1000000,
          loyalty: 50,
          income: Math.floor(Math.random() * 1000) + 100,
          status: 'Idle',
          army: { infantry: 3000, tank: 100, warship: 20, fighter: 20 }
        }));
        this.countriesSubject.next(countries);
      },
      err => {
        // fallback to default
        this.countriesSubject.next(this.getInitialCountries());
      }
    );
  }

  private getInitialCountries(): Country[] {
    return [
      { id: '1', name: 'Alpha', owner: 'You', population: 1000000, loyalty: 80, income: 500, status: 'Idle', army: { infantry: 3000, tank: 100, warship: 20, fighter: 20 } },
      { id: '2', name: 'Bravo', owner: 'Other', population: 800000, loyalty: 60, income: 400, status: 'Idle', army: { infantry: 3000, tank: 100, warship: 20, fighter: 20 } },
      { id: '3', name: 'Charlie', owner: 'Neutral', population: 600000, loyalty: 50, income: 300, status: 'Idle', army: { infantry: 3000, tank: 100, warship: 20, fighter: 20 } },
      { id: '4', name: 'Delta', owner: 'Other', population: 1200000, loyalty: 70, income: 600, status: 'Idle', army: { infantry: 3000, tank: 100, warship: 20, fighter: 20 } },
    ];
  }

  private randomEvent() {
    const countries = this.countriesSubject.value;
    if (countries.length < 2) return;
    // 1. 隨機選 5~10 個攻擊方
    const attackerCount = Math.min(
      countries.length,
      Math.floor(Math.random() * 6) + 5 // 5~10
    );
    const shuffledAttackers = [...countries].sort(() => 0.5 - Math.random());
    const attackers = shuffledAttackers.slice(0, attackerCount);

    attackers.forEach(attacker => {
      // 2. 每個攻擊方隨機選 1~10 個目標（排除自己）
      const possibleTargets = countries.filter(c => c.id !== attacker.id);
      if (possibleTargets.length === 0) return;
      const targetCount = Math.min(
        possibleTargets.length,
        Math.floor(Math.random() * 10) + 1 // 1~10
      );
      const shuffledTargets = [...possibleTargets].sort(() => 0.5 - Math.random());
      const selectedTargets = shuffledTargets.slice(0, targetCount);

      selectedTargets.forEach(target => {
        const attackEvent: WorldEvent = {
          type: 'attack',
          fromCountryId: attacker.id,
          toCountryId: target.id
        };
        this.eventSubject.next(attackEvent);
      });
    });
  }

  public pushEvent(event: WorldEvent) {
    this.eventSubject.next(event);
  }
} 