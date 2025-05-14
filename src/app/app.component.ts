import { Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommanderUIComponent } from './components/commander-ui/commander-ui.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommanderUIComponent],
  template: `
    <!-- Map Container (Always Interactive) -->
    <div class="map-container">
      <router-outlet></router-outlet>
    </div>
    
    <!-- Toggle Button (Always Visible) -->
    <button 
      class="toggle-button"
      (click)="commanderUI?.togglePanel()"
      [class.panel-open]="commanderUI?.isPanelOpen"
      aria-label="Toggle Commander Panel">
      <span class="toggle-icon">{{ commanderUI?.isPanelOpen ? '◀' : '▶' }}</span>
    </button>
    
    <!-- UI Layer -->
    <div class="ui-layer" [class.hidden]="!commanderUI?.isPanelOpen">
      <app-commander-ui #commanderUI></app-commander-ui>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    .map-container {
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    .ui-layer {
      position: absolute;
      inset: 0;
      z-index: 2;
      pointer-events: none;

      /* Enable pointer events only on UI components */
      ::ng-deep > * {
        pointer-events: auto;
      }
    }

    .ui-layer.hidden {
      z-index: -1;
    }

    .toggle-button {
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 1000;
      width: 40px;
      height: 40px;
      background: rgba(20, 30, 48, 0.95);
      border: 1px solid rgba(64, 106, 255, 0.5);
      border-radius: 8px;
      color: #4a9eff;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-button:hover {
      background: rgba(26, 39, 63, 0.95);
      box-shadow: 0 0 15px rgba(64, 106, 255, 0.3);
    }

    .toggle-button.panel-open {
      left: 350px;
    }

    @media (max-width: 768px) {
      .toggle-button.panel-open {
        left: calc(100% - 50px);
      }
    }
  `]
})
export class App {
  title = 'World Conquest';
  @ViewChild('commanderUI') commanderUI?: CommanderUIComponent;
}