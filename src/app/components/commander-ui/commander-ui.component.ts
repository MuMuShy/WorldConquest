import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Commander {
  name: string;
  rank: string;
  experience: number;
  nextRankXP: number;
  gold: number;
  armySize: number;
  territories: number;
  influence: number;
  buffs: Array<{
    name: string;
    value: string;
    icon: string;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    urgent: boolean;
  }>;
}

@Component({
  selector: 'app-commander-ui',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Commander Panel -->
    <div class="commander-ui" [class.panel-closed]="!isPanelOpen">
      <div class="commander-panel" [class.panel-open]="isPanelOpen">
        <!-- Profile Section -->
        <div class="profile-section">
          <div class="commander-avatar">
            <div class="rank-insignia">{{ commander.rank[0] }}</div>
          </div>
          <div class="commander-info">
            <div class="rank">{{ commander.rank }}</div>
            <div class="name">{{ commander.name }}</div>
          </div>
          <div class="xp-bar">
            <div 
              class="xp-progress" 
              [style.width.%]="(commander.experience / commander.nextRankXP) * 100">
            </div>
            <span class="xp-text">{{ commander.experience }}/{{ commander.nextRankXP }} XP</span>
          </div>
        </div>

        <!-- Resources Section -->
        <div class="resources-grid">
          <div class="resource-card">
            <div class="resource-icon">💰</div>
            <div class="resource-info">
              <div class="resource-value">{{ commander.gold | number }}</div>
              <div class="resource-label">Treasury</div>
            </div>
          </div>

          <div class="resource-card">
            <div class="resource-icon">🪖</div>
            <div class="resource-info">
              <div class="resource-value">{{ commander.armySize | number }}</div>
              <div class="resource-label">Military Power</div>
            </div>
          </div>

          <div class="resource-card">
            <div class="resource-icon">🗺️</div>
            <div class="resource-info">
              <div class="resource-value">{{ commander.territories }}</div>
              <div class="resource-label">Territories</div>
            </div>
          </div>

          <div class="resource-card">
            <div class="resource-icon">📡</div>
            <div class="resource-info">
              <div class="resource-value">{{ commander.influence }}%</div>
              <div class="resource-label">Global Influence</div>
            </div>
          </div>
        </div>

        <!-- Buffs Section -->
        <div class="buffs-section">
          <h3 class="section-title">Active Effects</h3>
          <div class="buffs-grid">
            <div 
              *ngFor="let buff of commander.buffs" 
              class="buff-card"
              [class.positive]="!buff.value.includes('-')"
              [class.negative]="buff.value.includes('-')">
              <span class="buff-icon">{{ buff.icon }}</span>
              <span class="buff-name">{{ buff.name }}</span>
              <span class="buff-value">{{ buff.value }}</span>
            </div>
          </div>
        </div>

        <!-- Alerts Section -->
        <div class="alerts-section">
          <h3 class="section-title">Incoming Transmissions</h3>
          <div class="alerts-list">
            <div 
              *ngFor="let alert of commander.alerts" 
              class="alert-item"
              [class.urgent]="alert.urgent">
              <div class="alert-type">{{ alert.type }}</div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: relative;
      display: block;
      height: 100%;
    }

    .commander-ui {
      position: relative;
      height: 100%;
      z-index: 10;
    }

    .commander-ui.panel-closed {
      z-index: -1;
    }

    .commander-panel {
      position: fixed;
      top: 0;
      left: 0;
      width: 350px;
      height: 100%;
      background: linear-gradient(180deg, rgba(20, 30, 48, 0.95) 0%, rgba(16, 24, 38, 0.95) 100%);
      border-right: 1px solid rgba(64, 106, 255, 0.5);
      padding: 1.5rem;
      color: #e0e7ff;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(64, 106, 255, 0.5) rgba(26, 39, 63, 0.5);
    }

    .commander-panel.panel-open {
      transform: translateX(0);
    }

    /* Profile Section Styles */
    .profile-section {
      text-align: center;
      margin-bottom: 2rem;
      margin-top: 2rem;
    }

    .commander-avatar {
      width: 80px;
      height: 80px;
      margin: 0 auto 1rem;
      background: linear-gradient(135deg, rgba(64, 106, 255, 0.2) 0%, rgba(51, 85, 204, 0.2) 100%);
      border: 2px solid rgba(64, 106, 255, 0.7);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(64, 106, 255, 0.3);
    }

    .rank-insignia {
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      color: #4a9eff;
      text-shadow: 0 0 10px rgba(74, 158, 255, 0.5);
    }

    .commander-info {
      margin-bottom: 1rem;
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

    .xp-bar {
      background: rgba(26, 39, 63, 0.5);
      border: 1px solid rgba(64, 106, 255, 0.3);
      border-radius: 4px;
      height: 8px;
      position: relative;
      overflow: hidden;
    }

    .xp-progress {
      background: linear-gradient(90deg, #4a9eff, #8ba3ff);
      height: 100%;
      transition: width 0.3s ease;
    }

    .xp-text {
      position: absolute;
      top: -20px;
      right: 0;
      font-size: 0.75rem;
      color: #8ba3ff;
    }

    /* Resources Grid */
    .resources-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .resource-card {
      background: rgba(26, 39, 63, 0.5);
      border: 1px solid rgba(64, 106, 255, 0.2);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;
    }

    .resource-card:hover {
      border-color: rgba(64, 106, 255, 0.5);
      box-shadow: 0 0 15px rgba(64, 106, 255, 0.2);
      transform: translateY(-2px);
    }

    .resource-icon {
      font-size: 1.5rem;
    }

    .resource-info {
      flex-grow: 1;
    }

    .resource-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .resource-label {
      font-size: 0.75rem;
      color: #8ba3ff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Buffs Section */
    .section-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1rem;
      color: #8ba3ff;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .buffs-grid {
      display: grid;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .buff-card {
      background: rgba(26, 39, 63, 0.5);
      border: 1px solid rgba(64, 106, 255, 0.2);
      border-radius: 6px;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .buff-card.positive {
      border-color: rgba(76, 175, 80, 0.3);
    }

    .buff-card.negative {
      border-color: rgba(244, 67, 54, 0.3);
    }

    .buff-icon {
      font-size: 1.25rem;
    }

    .buff-name {
      flex-grow: 1;
      font-size: 0.875rem;
      color: #e0e7ff;
    }

    .buff-value {
      font-family: 'Orbitron', sans-serif;
      font-weight: 600;
    }

    .positive .buff-value {
      color: #4caf50;
    }

    .negative .buff-value {
      color: #f44336;
    }

    /* Alerts Section */
    .alerts-list {
      display: grid;
      gap: 0.5rem;
    }

    .alert-item {
      background: rgba(26, 39, 63, 0.5);
      border: 1px solid rgba(64, 106, 255, 0.2);
      border-radius: 6px;
      padding: 0.75rem;
      transition: all 0.2s ease;
    }

    .alert-item.urgent {
      border-color: rgba(244, 67, 54, 0.5);
      animation: urgentPulse 2s infinite;
    }

    .alert-type {
      font-size: 0.75rem;
      color: #8ba3ff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .alert-message {
      font-size: 0.875rem;
      color: #e0e7ff;
    }

    @keyframes urgentPulse {
      0% { border-color: rgba(244, 67, 54, 0.5); }
      50% { border-color: rgba(244, 67, 54, 0.8); }
      100% { border-color: rgba(244, 67, 54, 0.5); }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .commander-panel {
        width: 100%;
      }

      .resources-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CommanderUIComponent {
  isPanelOpen = true;

  @Input() commander: Commander = {
    name: 'Supreme Commander MUMU',
    rank: 'Admiral',
    experience: 7500,
    nextRankXP: 10000,
    gold: 1500000,
    armySize: 250000,
    territories: 12,
    influence: 45,
    buffs: [
      { name: 'Military Efficiency', value: '+15%', icon: '⚔️' },
      { name: 'Resource Production', value: '+10%', icon: '⚡' },
      { name: 'Diplomatic Relations', value: '-5%', icon: '🤝' }
    ],
    alerts: [
      { type: 'Intelligence Report', message: 'New technology discovered in sector 7', urgent: false },
      { type: 'Military Alert', message: 'Enemy forces gathering near eastern border', urgent: true },
      { type: 'Diplomatic Update', message: 'Trade agreement proposed by neighboring faction', urgent: false }
    ]
  };

  togglePanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
  }
}