import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameMapComponent } from './components/game-map/game-map.component';
import { CountryPanelComponent } from './components/country-panel/country-panel.component';
import { TilePopupComponent } from './components/tile-popup/tile-popup.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameMapComponent, CountryPanelComponent, TilePopupComponent],
  template: `
    <div class="main-layout">
      <header class="main-header">
        <div class="info-item"><span class="icon">💰</span>{{ player.gold | number }}</div>
        <div class="info-item"><span class="icon">🏳️</span>{{ player.ownedCountries }}</div>
        <div class="info-item"><span class="icon">👥</span>{{ player.totalPopulation | number }}</div>
        <div class="info-item"><span class="icon">📈</span>{{ player.income }}/day</div>
        <div class="action-bar">
          <button>🤝 Diplomacy</button>
          <button>🔬 Research</button>
        </div>
      </header>
      <div class="map-main-container">
        <app-game-map></app-game-map>
      </div>
      <div class="bottom-panel-container">
        <app-country-panel *ngIf="showCountryPanel"></app-country-panel>
        <app-tile-popup *ngIf="showTilePopup"></app-tile-popup>
      </div>
    </div>
  `,
  styles: [`
    .main-layout {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .main-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1.2rem;
      background: linear-gradient(90deg, rgba(26, 39, 63, 0.95) 0%, rgba(20, 30, 48, 0.95) 100%);
      border-bottom: 2px solid rgba(64, 106, 255, 0.3);
      min-height: 56px;
      max-height: 90px;
      padding: 0 1.5rem;
      width: 100vw;
      box-sizing: border-box;
    }
    .info-item {
      font-size: 1.1rem;
      color: #e0e7ff;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .action-bar {
      margin-left: auto;
      display: flex;
      gap: 0.5rem;
    }
    @media (max-width: 768px) {
      .main-header {
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0 0.5rem;
      }
      .action-bar {
        width: 100%;
        margin-left: 0;
        justify-content: flex-start;
      }
    }
    .map-main-container {
      flex: 1 1 0;
      min-height: 0;
      width: 100vw;
      max-width: 100vw;
      position: relative;
    }
    .bottom-panel-container {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }
    .bottom-panel-container > * {
      pointer-events: auto;
      margin-bottom: 8px;
    }
    @media (max-width: 768px) {
      .bottom-panel-container {
        width: 100vw;
        padding-bottom: 4px;
      }
    }
  `]
})
export class AppComponent {
  showCountryPanel = false;
  showTilePopup = false;
  player = {
    gold: 1000000,
    ownedCountries: 5,
    totalPopulation: 5000000,
    income: 1200
  };
}