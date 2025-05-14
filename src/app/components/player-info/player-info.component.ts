import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../services/game-state.service';
import { Subscription } from 'rxjs';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="player-info-panel">
      <div class="panel-header">
        <h2 class="commander-title">
          <span class="rank">Commander</span>
          <span class="name">{{ player.name }}</span>
        </h2>
      </div>
      
      <div class="stats-container">
        <div class="stat-card gold">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <div class="stat-value">{{ player.gold | number }}</div>
            <div class="stat-label">Treasury</div>
          </div>
        </div>

        <div class="stat-card territories">
          <div class="stat-icon">🏳️</div>
          <div class="stat-info">
            <div class="stat-value">{{ player.ownedCountries }}</div>
            <div class="stat-label">Territories</div>
          </div>
        </div>

        <div class="stat-card population">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ player.totalPopulation | number }}</div>
            <div class="stat-label">Population</div>
          </div>
        </div>

        <div class="stat-card income">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <div class="stat-value">+{{ player.income }}/day</div>
            <div class="stat-label">Income</div>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <button class="action-button diplomacy">
          <span class="icon">🤝</span>
          Diplomacy
        </button>
        <button class="action-button research">
          <span class="icon">🔬</span>
          Research
        </button>
      </div>
    </div>
  `,
  styles: [`
    .player-info-panel {
      background: linear-gradient(180deg, rgba(20, 30, 48, 0.95) 0%, rgba(16, 24, 38, 0.95) 100%);
      border: 1px solid rgba(64, 106, 255, 0.5);
      border-radius: 12px;
      overflow: hidden;
      width: 300px;
      animation: slideFadeIn 0.5s ease-out;
    }

    .panel-header {
      background: linear-gradient(90deg, rgba(26, 39, 63, 0.9) 0%, rgba(20, 30, 48, 0.9) 100%);
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(64, 106, 255, 0.3);
    }

    .commander-title {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .rank {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.875rem;
      color: #8ba3ff;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .name {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.25rem;
      color: #4a9eff;
      font-weight: 700;
      text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
    }

    .stats-container {
      padding: 1rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background: rgba(26, 39, 63, 0.5);
      border: 1px solid rgba(64, 106, 255, 0.2);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: rgba(64, 106, 255, 0.5);
      box-shadow: 0 0 15px rgba(64, 106, 255, 0.2);
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-info {
      flex-grow: 1;
    }

    .stat-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #8ba3ff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .action-bar {
      padding: 1rem;
      display: flex;
      gap: 0.5rem;
      border-top: 1px solid rgba(64, 106, 255, 0.2);
    }

    .action-button {
      flex: 1;
      background: rgba(64, 106, 255, 0.1);
      border: 1px solid rgba(64, 106, 255, 0.3);
      color: #4a9eff;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      background: rgba(64, 106, 255, 0.2);
      border-color: rgba(64, 106, 255, 0.5);
      box-shadow: 0 0 10px rgba(64, 106, 255, 0.2);
    }

    .action-button:active {
      transform: scale(0.98);
    }

    .icon {
      font-size: 1.25rem;
    }

    @keyframes slideFadeIn {
      0% {
        opacity: 0;
        transform: translateX(20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .player-info-panel {
        width: 100%;
      }
      
      .stats-container {
        grid-template-columns: 1fr;
      }
      
      .action-bar {
        flex-direction: column;
      }
    }
  `]
})
export class PlayerInfoComponent implements OnInit, OnDestroy {
  player: Player = {
    name: 'Alpha',
    gold: 1000000,
    ownedCountries: 0,
    totalPopulation: 0,
    income: 100,
    ownedTerritories: 0
  };

  private subscription: Subscription | null = null;

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {
    this.subscription = this.gameState.player$.subscribe(player => {
      this.player = player;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}