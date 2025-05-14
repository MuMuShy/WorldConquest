import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../services/map.service';
import { GameStateService } from '../../services/game-state.service';
import { WorldTimeComponent } from '../world-time/world-time.component';
import { PlayerInfoComponent } from '../player-info/player-info.component';
import { CountryPanelComponent } from '../country-panel/country-panel.component';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-game-map',
  standalone: true,
  imports: [CommonModule, WorldTimeComponent, PlayerInfoComponent, CountryPanelComponent],
  template: `
    <div class="game-map-container">
      <!-- Map Container -->
      <div id="map-container" [class.map-loaded]="isMapLoaded"></div>
      
      <!-- UI Elements -->
      <div class="ui-elements" *ngIf="isMapLoaded">
        <!-- Country Panel -->
        <app-country-panel
          *ngIf="selectedCountry"
          class="country-panel-container"
          [country]="selectedCountry"
          (close)="closeCountryPanel()"
          (occupy)="onOccupyCountry()"
          (tax)="onTaxCountry()"
          (propaganda)="onPropaganda()">
        </app-country-panel>
      </div>
    </div>
  `,
  styles: [`
    .game-map-container {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    #map-container {
      position: absolute;
      inset: 0;
      z-index: 0;
      opacity: 0;
      transition: opacity 0.5s ease;
    }

    #map-container.map-loaded {
      opacity: 1;
    }

    .ui-elements {
      position: absolute;
      inset: 0;
      z-index: 10;
      pointer-events: none;

      /* Enable pointer events only on UI components */
      ::ng-deep > * {
        pointer-events: auto;
      }
    }

    .country-panel-container {
      position: absolute;
      top: 50%;
      right: 1rem;
      transform: translateY(-50%);
    }

    @media (max-width: 768px) {
      .country-panel-container {
        top: auto;
        bottom: 1rem;
        right: 0;
        left: 0;
        transform: none;
      }
    }
  `]
})
export class GameMapComponent implements OnInit, AfterViewInit, OnDestroy {
  isMapLoaded = false;
  selectedCountry: Country | null = null;
  selectedTile: GeoJSON.Feature | null = null;

  constructor(
    private mapService: MapService,
    private gameState: GameStateService
  ) {}

  ngOnInit(): void {
    this.gameState.initGame();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
    this.gameState.stopGameLoop();
  }

  private initMap(): void {
    this.mapService.initializeMap('map-container').then(() => {
      this.isMapLoaded = true;
      this.mapService.addCountriesToMap();
      this.setupMapEvents();
    });
  }

  private setupMapEvents(): void {
    this.mapService.onCountryClick.subscribe(data => {
      this.selectedCountry = data.country;
      this.selectedTile = data.tile;
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
}