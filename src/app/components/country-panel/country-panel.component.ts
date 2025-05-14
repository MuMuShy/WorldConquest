import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-country-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="country-panel" *ngIf="country">
      <div class="panel-header">
        <div class="header-content">
          <div class="country-status" [class]="'status-' + country.status.toLowerCase()">
            {{ country.status }}
          </div>
          <h2 class="country-name">{{ country.name }}</h2>
        </div>
        <button class="close-button" (click)="onClose()" aria-label="Close">×</button>
      </div>
      
      <div class="panel-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ country.population | number }}</div>
              <div class="stat-label">Population</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">❤️</div>
            <div class="stat-info">
              <div class="stat-value">{{ country.loyalty }}%</div>
              <div class="stat-label">Loyalty</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <div class="stat-value">{{ country.income }}/day</div>
              <div class="stat-label">Income</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👑</div>
            <div class="stat-info">
              <div class="stat-value owner" [class]="'owner-' + country.owner.toLowerCase()">
                {{ country.owner }}
              </div>
              <div class="stat-label">Control</div>
            </div>
          </div>
        </div>
        
        <div class="actions-grid">
          <button 
            *ngIf="country.owner !== 'You'"
            class="action-button occupy"
            (click)="onOccupy()">
            <span class="action-icon">⚔️</span>
            <span class="action-text">Occupy Territory</span>
          </button>
          
          <ng-container *ngIf="country.owner === 'You'">
            <button 
              class="action-button tax"
              [disabled]="country.loyalty < 10"
              (click)="onTax()">
              <span class="action-icon">💰</span>
              <span class="action-text">Collect Tax</span>
              <span class="action-cost">-10 Loyalty</span>
            </button>
            
            <button 
              class="action-button propaganda"
              (click)="onPropaganda()">
              <span class="action-icon">📢</span>
              <span class="action-text">Run Propaganda</span>
              <span class="action-cost">+10 Loyalty</span>
            </button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .country-panel {
      background: linear-gradient(180deg, rgba(20, 30, 48, 0.95) 0%, rgba(16, 24, 38, 0.95) 100%);
      border: 1px solid rgba(64, 106, 255, 0.5);
      border-radius: 12px;
      width: 360px;
      animation: slideFadeIn 0.3s ease-out;
      overflow: hidden;
    }

    .panel-header {
      background: linear-gradient(90deg, rgba(26, 39, 63, 0.9) 0%, rgba(20, 30, 48, 0.9) 100%);
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(64, 106, 255, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      flex-grow: 1;
    }

    .country-status {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    .status-idle { 
      background: rgba(158, 158, 158, 0.2);
      color: #9e9e9e;
    }
    
    .status-underattack { 
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }
    
    .status-rebelling { 
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }
    
    .status-propaganda { 
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }
    
    .status-recovering { 
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    .country-name {
      margin: 0;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #4a9eff;
      text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
    }

    .close-button {
      background: none;
      border: none;
      color: #8ba3ff;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: rgba(64, 106, 255, 0.1);
      color: #ff4c4c;
    }

    .panel-content {
      padding: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
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

    .owner-neutral { color: #9e9e9e; }
    .owner-you { color: #4caf50; }
    .owner-other { color: #f44336; }

    .actions-grid {
      display: grid;
      gap: 1rem;
    }

    .action-button {
      background: rgba(64, 106, 255, 0.1);
      border: 1px solid rgba(64, 106, 255, 0.3);
      border-radius: 8px;
      padding: 1rem;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.2s ease;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 1rem;
    }

    .action-button:hover:not(:disabled) {
      background: rgba(64, 106, 255, 0.2);
      border-color: rgba(64, 106, 255, 0.5);
      box-shadow: 0 0 15px rgba(64, 106, 255, 0.3);
      transform: translateY(-2px);
    }

    .action-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-icon {
      font-size: 1.5rem;
    }

    .action-text {
      font-weight: 500;
      text-align: left;
    }

    .action-cost {
      font-size: 0.875rem;
      color: #8ba3ff;
    }

    .occupy { 
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.2) 100%);
      border-color: rgba(76, 175, 80, 0.3);
    }
    
    .occupy:hover {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.3) 0%, rgba(56, 142, 60, 0.3) 100%);
      border-color: rgba(76, 175, 80, 0.5);
    }

    .tax { 
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(251, 140, 0, 0.2) 100%);
      border-color: rgba(255, 193, 7, 0.3);
    }
    
    .tax:hover {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.3) 0%, rgba(251, 140, 0, 0.3) 100%);
      border-color: rgba(255, 193, 7, 0.5);
    }

    .propaganda { 
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(25, 118, 210, 0.2) 100%);
      border-color: rgba(33, 150, 243, 0.3);
    }
    
    .propaganda:hover {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(25, 118, 210, 0.3) 100%);
      border-color: rgba(33, 150, 243, 0.5);
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
      .country-panel {
        width: 100vw !important;
        min-width: 0 !important;
        max-width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        font-size: 1.2rem !important;
        border-radius: 0 !important;
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        padding: 1.2rem 0.5rem 2.5rem 0.5rem !important;
        transform: none !important;
      }
      .panel-header, .panel-content, .stats-grid, .actions-grid {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .stat-card {
        padding: 0.9rem;
        font-size: 1.2rem;
      }
      .stat-icon {
        font-size: 1.5rem;
      }
      .action-button {
        padding: 1.1rem;
        font-size: 1.2rem;
      }
    }
    @media (max-width: 480px) {
      .country-panel {
        padding: 0.5rem 0.2rem 2rem 0.2rem !important;
      }
      .stat-card {
        padding: 0.6rem;
        font-size: 1rem;
      }
      .action-button {
        padding: 0.7rem;
        font-size: 1rem;
      }
    }
  `]
})
export class CountryPanelComponent {
  @Input() country: Country | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() occupy = new EventEmitter<void>();
  @Output() tax = new EventEmitter<void>();
  @Output() propaganda = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onOccupy(): void {
    this.occupy.emit();
  }

  onTax(): void {
    this.tax.emit();
  }

  onPropaganda(): void {
    this.propaganda.emit();
  }
}