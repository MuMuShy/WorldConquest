import mapboxgl from 'mapbox-gl';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldTimeComponent } from '../world-time/world-time.component';
import { CountryPanelComponent } from '../country-panel/country-panel.component';
import { ZoomControlsComponent } from '../zoom-controls/zoom-controls.component';
import { TilePopupComponent } from '../tile-popup/tile-popup.component';
import { WorldEventService } from '../../services/world-event.service';
import { MapService } from '../../services/map.service';
import { GameStateService } from '../../services/game-state.service';
import { Country } from '../../models/country.model';
import { Subscription } from 'rxjs';
import { MapEffectService } from '../../services/map-effect.service';
import type { CountryStatus } from '../../models/country.model';
import { getFeatureCenter } from '../../utils/geo-utils';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-game-map',
  standalone: true,
  imports: [CommonModule, WorldTimeComponent, CountryPanelComponent, ZoomControlsComponent, TilePopupComponent],
  templateUrl: './game-map.component.html',
  styleUrls: ['./game-map.component.css']
})
export class GameMapComponent implements OnInit, OnDestroy, AfterViewInit {
  isMapLoaded = false;
  countries: Country[] = [];
  selectedCountry: Country | null = null;
  selectedTile: any = null;
  showTilePopup = false;
  popupPosition = { x: 0, y: 0 };
  private sub = new Subscription();
  player: Player | null = null;
  isAttacking = false;

  constructor(
    private worldEvent: WorldEventService,
    private mapService: MapService,
    private gameState: GameStateService,
    private mapEffect: MapEffectService
  ) {}

  ngOnInit() {
    this.sub.add(this.worldEvent.countries$.subscribe(countries => {
      this.countries = countries;
    }));
    this.sub.add(this.gameState.player$.subscribe(player => {
      this.player = player;
    }));
    this.gameState.initGame();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.mapService.destroyMap();
    this.gameState.stopGameLoop();
  }

  private initMap(): void {
    this.mapService.initializeMap('map-container').then(() => {
      this.isMapLoaded = true;
      this.mapService.addCountriesToMap();
      this.setupMapEvents();
      const map = this.mapService.map;
      this.onMapStyleLoaded(map);
    });
  }

  private setupMapEvents(): void {
    this.mapService.onCountryClick.subscribe(data => {
      this.selectedCountry = data.country;
      this.selectedTile = data.tile;
      this.popupPosition = data.position || { x: 0, y: 0 };
      this.showTilePopup = false;
    });
  }

  closeCountryPanel(): void {
    this.selectedCountry = null;
    this.selectedTile = null;
  }

  onOccupyCountry(): void {
    if (this.selectedCountry) {
      this.gameState.occupyCountry(this.selectedCountry.id);
      this.mapService.updateCountryOwnership(this.selectedCountry.id, 'You');
      this.mapService.updateCountryStatus(this.selectedCountry.id, 'UnderAttack');
      this.selectedCountry = {
        ...this.selectedCountry,
        owner: 'You',
        loyalty: 50,
        status: 'UnderAttack'
      };
      setTimeout(() => {
        if (this.selectedCountry) {
          this.mapService.updateCountryStatus(this.selectedCountry.id, 'Recovering');
          this.selectedCountry = {
            ...this.selectedCountry,
            status: 'Recovering'
          };
        }
      }, 3000);
    }
  }

  onTaxCountry(): void {
    if (this.selectedCountry) {
      this.gameState.taxCountry(this.selectedCountry.id);
      this.mapService.updateCountryStatus(this.selectedCountry.id, 'Rebelling');
      this.selectedCountry = {
        ...this.selectedCountry,
        loyalty: Math.max(0, this.selectedCountry.loyalty - 10),
        status: 'Rebelling'
      };
      setTimeout(() => {
        if (this.selectedCountry) {
          this.mapService.updateCountryStatus(this.selectedCountry.id, 'Idle');
          this.selectedCountry = {
            ...this.selectedCountry,
            status: 'Idle'
          };
        }
      }, 2000);
    }
  }

  onPropaganda(): void {
    if (this.selectedCountry) {
      this.gameState.runPropaganda(this.selectedCountry.id);
      this.mapService.updateCountryStatus(this.selectedCountry.id, 'Propaganda');
      this.selectedCountry = {
        ...this.selectedCountry,
        loyalty: Math.min(100, this.selectedCountry.loyalty + 10),
        status: 'Propaganda'
      };
      setTimeout(() => {
        if (this.selectedCountry) {
          this.mapService.updateCountryStatus(this.selectedCountry.id, 'Idle');
          this.selectedCountry = {
            ...this.selectedCountry,
            status: 'Idle'
          };
        }
      }, 2000);
    }
  }

  onAttackCountry(): void {
    if (!this.selectedCountry || !this.player) return;
    this.isAttacking = true;
    this.worldEvent.pushEvent({ type: 'playerDirectAttack', toCountryId: this.selectedCountry.id });
    setTimeout(() => {
      // 攻擊邏輯：玩家每次攻擊消耗 100 infantry、10 tank、2 warship、2 fighter
      // 傷害：
      // 坦克>士兵、軍艦>坦克、戰機>軍艦、士兵>戰機
      // 其餘 1:1
      const atk = {
        infantry: Math.min(this.player!.army.infantry, 100),
        tank: Math.min(this.player!.army.tank, 10),
        warship: Math.min(this.player!.army.warship, 2),
        fighter: Math.min(this.player!.army.fighter, 2)
      };
      if (atk.infantry + atk.tank + atk.warship + atk.fighter === 0) {
        this.isAttacking = false;
        return;
      }
      let target = { ...this.selectedCountry!.army };
      target.infantry = Math.max(0, target.infantry - (atk.tank * 20));
      target.tank = Math.max(0, target.tank - (atk.warship * 4));
      target.warship = Math.max(0, target.warship - (atk.fighter * 4));
      target.fighter = Math.max(0, target.fighter - Math.floor(atk.infantry * 1.5));
      target.infantry = Math.max(0, target.infantry - atk.infantry);
      target.tank = Math.max(0, target.tank - atk.tank);
      target.warship = Math.max(0, target.warship - atk.warship);
      target.fighter = Math.max(0, target.fighter - atk.fighter);
      this.player!.army.infantry -= atk.infantry;
      this.player!.army.tank -= atk.tank;
      this.player!.army.warship -= atk.warship;
      this.player!.army.fighter -= atk.fighter;
      this.selectedCountry = {
        ...this.selectedCountry!,
        army: target
      };
      this.isAttacking = false;
      // 修正：同步 UI 狀態
      if (this.selectedCountry) {
        this.selectedCountry = {
          ...this.selectedCountry,
          status: 'Idle'
        };
      }
      // TODO: 更新到全域狀態（GameStateService、WorldEventService...）
    }, 2000);
  }

  private onMapStyleLoaded(map: any) {
    console.log('map loaded');
    map.addSource('missile-trace', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    map.addLayer({
      id: 'missile-trace',
      type: 'line',
      source: 'missile-trace',
      paint: {
        'line-color': [
          'interpolate', ['linear'], ['line-progress'],
          0, '#00eaff',
          0.4, '#4a9eff',
          0.7, '#a259ff',
          1, '#00ffd0'
        ],
        'line-width': window.innerWidth < 600 ? 4.2 : 2.2,
        'line-opacity': 0.98,
        'line-blur': 0.2,
        'line-dasharray': [1, 1.2]
      }
    }, 'countries-fill');

    this.mapEffect.setMap(map);
    this.sub.add(this.worldEvent.events$.subscribe(event => {
      this.mapEffect.handleEvent(event, (id: string, status: CountryStatus) => this.mapService.updateCountryStatus(id, status));
    }));

    map.addSource('explosion-effect', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    map.addLayer({
      id: 'explosion-effect',
      type: 'circle',
      source: 'explosion-effect',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'progress'],
          0, 8,
          1, 32
        ],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'progress'],
          0, '#fffbe6',
          0.3, '#ffd600',
          0.6, '#ff9800',
          1, '#ff3d00'
        ],
        'circle-opacity': [
          'interpolate', ['linear'], ['get', 'progress'],
          0, 0.7,
          0.7, 0.5,
          1, 0
        ]
      }
    }, 'missile-trace');
  }
}