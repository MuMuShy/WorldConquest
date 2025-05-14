import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-world-time',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="world-time-panel">
      <div class="time-info">
        <div class="time-label">World Time</div>
        <div class="day-counter">Day {{ currentDay }}</div>
      </div>
      <div class="time-controls">
        <button class="control-button pause" aria-label="Pause">
          <span class="icon">⏸</span>
        </button>
        <button class="control-button speed" aria-label="Speed">
          <span class="icon">⏩</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .world-time-panel {
      background: linear-gradient(180deg, rgba(20, 30, 48, 0.95) 0%, rgba(16, 24, 38, 0.95) 100%);
      color: #e0e7ff;
      padding: 1rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(64, 106, 255, 0.5);
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-width: 250px;
      animation: glowPulse 3s infinite;
    }

    .time-info {
      flex-grow: 1;
    }

    .time-label {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8ba3ff;
      margin-bottom: 0.25rem;
    }

    .day-counter {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #4a9eff;
      text-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
    }

    .time-controls {
      display: flex;
      gap: 0.5rem;
    }

    .control-button {
      background: rgba(26, 39, 63, 0.9);
      border: 1px solid rgba(64, 106, 255, 0.5);
      color: #4a9eff;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .control-button:hover {
      background: rgba(64, 106, 255, 0.2);
      border-color: rgba(64, 106, 255, 0.7);
      box-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
    }

    .control-button:active {
      transform: scale(0.95);
    }

    .icon {
      font-size: 1.25rem;
    }

    @keyframes glowPulse {
      0% { box-shadow: 0 0 15px rgba(74, 158, 255, 0.2); }
      50% { box-shadow: 0 0 25px rgba(74, 158, 255, 0.4); }
      100% { box-shadow: 0 0 15px rgba(74, 158, 255, 0.2); }
    }

    @media (max-width: 768px) {
      .world-time-panel {
        min-width: auto;
        width: 100%;
        padding: 0.75rem;
      }

      .day-counter {
        font-size: 1.25rem;
      }

      .control-button {
        width: 32px;
        height: 32px;
      }
    }
  `]
})
export class WorldTimeComponent implements OnInit, OnDestroy {
  currentDay = 0;
  private subscription: Subscription | null = null;

  constructor(private gameState: GameStateService) {}

  ngOnInit(): void {
    this.subscription = this.gameState.currentDay$.subscribe(day => {
      this.currentDay = day;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}