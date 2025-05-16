import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-stats-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container glass-panel">
      <h3 class="stats-title">Player Stats</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            Attack
          </div>
          <div class="stat-bar">
            <div class="stat-value" [style.width.%]="getStatPercentage(player.stats.attack)"></div>
          </div>
          <div class="stat-number">{{ player.stats.attack }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Defense
          </div>
          <div class="stat-bar">
            <div class="stat-value" [style.width.%]="getStatPercentage(player.stats.defense)"></div>
          </div>
          <div class="stat-number">{{ player.stats.defense }}</div>
        </div>
        
        <div class="stat-item">
          <div class="stat-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Speed
          </div>
          <div class="stat-bar">
            <div class="stat-value" [style.width.%]="getStatPercentage(player.stats.speed)"></div>
          </div>
          <div class="stat-number">{{ player.stats.speed }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      padding: var(--space-3);
      width: 100%;
    }
    
    .stats-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--text-light);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: var(--space-2);
    }
    
    .stats-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    
    .stat-label {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      width: 80px;
      font-size: 0.9rem;
      color: var(--text-medium);
    }
    
    .stat-bar {
      flex: 1;
      height: 8px;
      background-color: rgba(100, 116, 139, 0.2);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    
    .stat-value {
      height: 100%;
      background-color: var(--primary);
      border-radius: var(--radius-full);
    }
    
    .stat-number {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-light);
      width: 30px;
      text-align: right;
    }
    
    .achievements-section {
      margin-top: var(--space-4);
    }
    
    .achievements-title {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: var(--space-2);
      color: var(--text-light);
    }
    
    .achievements-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .achievement-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      background-color: rgba(30, 41, 59, 0.5);
    }
    
    .achievement-icon {
      font-size: 1.2rem;
    }
    
    .achievement-name {
      flex: 1;
      font-size: 0.9rem;
    }
    
    .achievement-unlocked {
      color: var(--success);
    }
    
    .achievement-locked {
      color: var(--text-dark);
    }
    
    .achievement-progress {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 80px;
    }
    
    .progress-bg {
      height: 4px;
      background-color: rgba(100, 116, 139, 0.2);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background-color: var(--warning);
      border-radius: var(--radius-full);
    }
    
    .progress-text {
      font-size: 0.7rem;
      text-align: right;
    }
    
    @media (max-width: 768px) {
      .stats-container {
        padding: var(--space-2);
      }
      
      .stat-label {
        width: 70px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class StatsDisplayComponent {
  @Input() player!: Player;
  
  getStatPercentage(value: number): number {
    return (value / 100) * 100; // Assuming max stat is 100
  }
  
  getPercentage(current: number, max: number): number {
    return (current / max) * 100;
  }
}