import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PlayerStatus {
  name: string;
  gold: number;
  armySize: number;
  ownedCountries: number;
  worldDay: number;
  loyaltyAverage: number;
}

@Component({
  selector: 'app-player-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-panel">
      <div class="panel-header">
        <h2 class="commander-name">{{ status.name }}</h2>
        <div class="world-time">World Time: Day {{ status.worldDay }}</div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Gold Reserve</div>
          <div class="stat-value gold">{{ status.gold | number }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Military Power</div>
          <div class="stat-value">{{ status.armySize | number }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Controlled Territories</div>
          <div class="stat-value">{{ status.ownedCountries }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">Average Loyalty</div>
          <div class="stat-value loyalty">{{ status.loyaltyAverage }}%</div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="action-btn advance-time">
          Advance Time
        </button>
        <button class="action-btn diplomacy">
          Open Diplomacy
        </button>
      </div>
    </div>
  `,
  styles: [`
    .status-panel {
      background: linear-gradient(180deg, rgba(20, 30, 48, 0.95) 0%, rgba(16, 24, 38, 0.95) 100%);
      border: 1px solid rgba(64, 106, 255, 0.5);
      border-radius: 12px;
      padding: 1.5rem;
      color: #e0e7ff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      max-width: 100%;
      width: 100%;
      animation: panelFadeIn 0.5s ease-out;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(64, 106, 255, 0.3);
    }

    .commander-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #b7d0ff;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .world-time {
      font-size: 1rem;
      color: #8ba3ff;
      padding: 0.5rem 1rem;
      background: rgba(64, 106, 255, 0.1);
      border-radius: 6px;
      border: 1px solid rgba(64, 106, 255, 0.3);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      padding: 1rem;
      background: rgba(26, 39, 63, 0.5);
      border-radius: 8px;
      border: 1px solid rgba(64, 106, 255, 0.2);
      transition: all 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-2px);
      border-color: rgba(64, 106, 255, 0.5);
      box-shadow: 0 4px 12px rgba(0, 140, 255, 0.2);
    }

    .stat-label {
      font-size: 0.875rem;
      color: #8ba3ff;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
    }

    .gold {
      color: #ffd700;
    }

    .loyalty {
      color: #4ade80;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .action-btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      color: #ffffff;
    }

    .advance-time {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    }

    .diplomacy {
      background: linear-gradient(135deg, #2196F3 0%, #1e88e5 100%);
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .action-btn:active {
      transform: translateY(0);
    }

    @keyframes panelFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .status-panel {
        padding: 1rem;
      }

      .panel-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .commander-name {
        font-size: 1.25rem;
      }

      .world-time {
        font-size: 0.875rem;
      }
    }
  `]
})
export class PlayerStatusComponent {
  @Input() status: PlayerStatus = {
    name: 'Commander Alpha',
    gold: 1000000,
    armySize: 50000,
    ownedCountries: 5,
    worldDay: 1,
    loyaltyAverage: 85
  };
}