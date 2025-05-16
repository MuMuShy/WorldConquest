import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameMapComponent } from './components/game-map/game-map.component';
import { CountryPanelComponent } from './components/country-panel/country-panel.component';
import { TilePopupComponent } from './components/tile-popup/tile-popup.component';
import { EventMarqueeComponent } from './components/event-marquee.component';
import { GameHudComponent } from './components/game-hud/game-hud.component';
import { FactionSelectComponent } from './components/faction-select/faction-select.component';
import { GameStateService } from './services/game-state.service';
import { Player } from './models/player.model';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameMapComponent, CountryPanelComponent, TilePopupComponent, EventMarqueeComponent, GameHudComponent, FactionSelectComponent],
  template: `
    <app-faction-select *ngIf="showFactionDialog" (factionSelected)="onFactionSelected($event)"></app-faction-select>
    <app-event-marquee class="event-marquee-float"></app-event-marquee>
    <div class="main-layout">
    <app-game-hud></app-game-hud>
      <div class="map-main-container">
        <app-game-map></app-game-map>
      </div>
      <div class="bottom-panel-container">
        <app-country-panel *ngIf="showCountryPanel"></app-country-panel>
        <app-tile-popup *ngIf="showTilePopup"></app-tile-popup>
      </div>
    </div>
  `,
  styles: [
    `.main-layout {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .main-header {
      background: linear-gradient(90deg, #1a273f 0%, #141e30 100%);
      border-bottom: 2px solid #406aff66;
      min-height: 110px;
      max-height: 180px;
      padding: 0 2.5rem 0 2.5rem;
      width: 100vw;
      box-sizing: border-box;
      z-index: 50;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .header-top-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 54px;
      margin-bottom: 10px;
      width: 100%;
    }
    .player-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      font-size: 1.5rem;
      color: #e0e7ff;
    }
    .player-avatar {
      font-size: 2.5rem;
    }
    .player-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #4a9eff;
    }
    .player-rank {
      font-size: 1.15rem;
      color: #8ba3ff;
      margin-left: 0.7rem;
    }
    .player-detail-btn {
      background: rgba(64, 106, 255, 0.1);
      border: 1px solid rgba(64, 106, 255, 0.3);
      color: #4a9eff;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      font-size: 1.1rem;
      margin-left: auto;
      cursor: pointer;
      transition: all 0.2s;
      height: 44px;
      align-self: center;
      white-space: nowrap;
    }
    .player-detail-btn:hover {
      background: rgba(64, 106, 255, 0.2);
      border-color: rgba(64, 106, 255, 0.5);
    }
    @media (max-width: 1100px) {
      .main-header {
        padding: 0 0.7rem;
        min-height: 90px;
      }
      .header-top-row {
        height: 44px;
        margin-bottom: 6px;
      }
      .player-meta {
        font-size: 1.15rem;
        gap: 0.7rem;
      }
      .player-avatar {
        font-size: 1.7rem;
      }
      .player-name {
        font-size: 1.1rem;
      }
      .player-rank {
        font-size: 1rem;
      }
      .player-detail-btn {
        font-size: 1rem;
        height: 36px;
        padding: 0.3rem 1rem;
      }
    }
    @media (max-width: 700px) {
      .main-header {
        min-height: 80px;
        max-height: 120px;
        padding: 0 0.2rem;
      }
      .header-top-row {
        flex-direction: column;
        align-items: flex-start;
        height: auto;
        margin-bottom: 4px;
      }
      .player-meta {
        font-size: 1.05rem;
        gap: 0.4rem;
      }
      .player-avatar {
        font-size: 1.2rem;
      }
      .player-name {
        font-size: 1rem;
      }
      .player-rank {
        font-size: 0.95rem;
      }
      .player-detail-btn {
        width: 100%;
        margin: 0.2rem 0 0 0;
        font-size: 0.95rem;
        height: 32px;
        padding: 0.2rem 0.7rem;
        align-self: flex-start;
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
export class AppComponent implements OnInit {
  showCountryPanel = false;
  showTilePopup = false;
  showFactionDialog = false;
  player: Player | null = null;

  constructor(private gameState: GameStateService) {}

  ngOnInit() {
    this.gameState.player$.subscribe(player => {
      this.player = player;
      this.showFactionDialog = !player.faction;
    });
  }

  onFactionSelected(faction: 'alliance' | 'empire') {
    this.gameState.setPlayerFaction(faction);
    this.showFactionDialog = false;
  }

  showPlayerDetail() {
    // Implementation of showPlayerDetail method
  }
}