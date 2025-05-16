import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type ResourceType = 'money' | 'soldiers' | 'crystals' | 'power' | 'infantry' | 'tank' | 'warship' | 'fighter';

@Component({
  selector: 'app-resource-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resource-counter" [ngClass]="resourceClass">
      <div class="resource-icon" [innerHTML]="getResourceIcon()"></div>
      <div class="resource-value" [ngClass]="{'animate-pulse': isAnimating}">
        {{ value | number }}
      </div>
    </div>
  `,
  styles: [`
    .resource-counter {
      min-width: 120px;
    }
    
    .resource-value {
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .money {
      border-left: 3px solid var(--money);
      color: var(--money);
    }
    
    .soldiers {
      border-left: 3px solid var(--soldiers);
      color: var(--soldiers);
    }
    
    .crystals {
      border-left: 3px solid var(--crystal);
      color: var(--crystal);
    }
    
    .power {
      border-left: 3px solid var(--power);
      color: var(--power);
    }
    
    @media (max-width: 768px) {
      .resource-counter {
        min-width: 90px;
        padding: var(--space-1) var(--space-2);
        font-size: 0.9rem;
      }
    }
  `]
})
export class ResourceDisplayComponent implements OnChanges {
  @Input() type!: ResourceType;
  @Input() value!: number;
  
  isAnimating = false;
  resourceClass = '';
  previousValue = 0;
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type']) {
      this.resourceClass = this.type;
    }
    
    if (changes['value'] && !changes['value'].firstChange) {
      this.previousValue = changes['value'].previousValue;
      if (this.previousValue !== this.value) {
        this.triggerAnimation();
      }
    }
  }
  
  triggerAnimation(): void {
    this.isAnimating = true;
    setTimeout(() => {
      this.isAnimating = false;
    }, 1000);
  }
  
  getResourceIcon(): SafeHtml {
    let svg = '';
    switch (this.type) {
      case 'money':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 6v12"/><path d="M8 10h8"/><path d="M10 14h4"/></svg>`; break;
      case 'soldiers':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8l6-4 6 4"/><path d="M18 10l4 2"/><path d="M6 10l-4 2"/><path d="M12 10v10"/><path d="M8 16l-4 4"/><path d="M16 16l4 4"/></svg>`; break;
      case 'crystals':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-8 10 8 8 8-8Z"/><path d="m9 13 3-2 3 2"/><path d="M12 18v-5"/></svg>`; break;
      case 'power':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16.88A7.52 7.52 0 0 1 12 19a7.52 7.52 0 0 1-6-2.12M12 3v10"/><path d="M3 7h4"/><path d="M17 7h4"/></svg>`; break;
      case 'infantry':
        svg = `<span style='font-size:20px;'>🪖</span>`; break;
      case 'tank':
        svg = `<span style='font-size:20px;'>🛡️</span>`; break;
      case 'warship':
        svg = `<span style='font-size:20px;'>🚢</span>`; break;
      case 'fighter':
        svg = `<span style='font-size:20px;'>✈️</span>`; break;
      default:
        svg = '';
    }
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}