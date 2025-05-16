import { Component, OnInit, OnDestroy } from '@angular/core';
import { WorldEventService } from '../services/world-event.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

interface EventToast {
  id: number;
  text: string;
  icon: string;
}

@Component({
  selector: 'app-event-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-marquee chat-style" [class.collapsed]="collapsed">
      <button class="collapse-btn" (click)="toggleCollapse()" [attr.aria-label]="collapsed ? '展開事件訊息' : '收合事件訊息'">
        <span *ngIf="collapsed">▲</span>
        <span *ngIf="!collapsed">▼</span>
      </button>
      <div class="event-list" *ngIf="!collapsed">
        <div *ngFor="let toast of toasts" class="event-toast">
          <span class="icon">{{ toast.icon }}</span>
          <span class="text">{{ toast.text }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.event-marquee.chat-style {
      position: fixed;
      left: 24px;
      bottom: 32px;
      z-index: 9999;
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-end;
      pointer-events: none;
      max-width: 90vw;
      width: 320px;
      max-height: 32vh;
      min-height: 60px;
      background: rgba(30,38,58,0.38);
      border-radius: 18px;
      box-shadow: 0 6px 32px 0 #0005, 0 1.5px 8px 0 #4a9eff22;
      overflow-y: auto;
      padding: 14px 10px 14px 10px;
      border: 1.5px solid #4a9eff33;
      backdrop-filter: blur(16px) saturate(1.2);
      -webkit-backdrop-filter: blur(16px) saturate(1.2);
      scrollbar-width: thin;
      scrollbar-color: #4a9eff33 #222a44;
      transition: background 0.3s, box-shadow 0.3s, max-height 0.3s;
    }
    .event-marquee.chat-style.collapsed {
      max-height: 44px;
      min-height: 0;
      padding: 4px 10px 4px 10px;
      overflow: visible;
      background: rgba(30,38,58,0.18);
    }
    .collapse-btn {
      pointer-events: auto;
      background: rgba(40,60,90,0.18);
      border: none;
      color: #8ba3ff;
      font-size: 1.2rem;
      border-radius: 8px;
      margin-bottom: 2px;
      margin-right: 0;
      margin-left: auto;
      cursor: pointer;
      transition: background 0.2s;
      width: 32px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px #0002;
    }
    .collapse-btn:hover {
      background: rgba(74,158,255,0.12);
      color: #4a9eff;
    }
    .event-list {
      width: 100%;
      display: flex;
      flex-direction: column-reverse;
      align-items: flex-end;
      pointer-events: auto;
    }
    .event-toast {
      background: rgba(60,80,120,0.22);
      color: #fffbe6;
      border-radius: 16px;
      margin-top: 12px;
      padding: 0.6rem 0.9rem;
      min-width: 110px;
      max-width: 92%;
      font-size: 0.89rem;
      font-family: 'Orbitron', sans-serif;
      box-shadow: 0 2px 12px #0003, 0 1.5px 8px #4a9eff22;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      opacity: 0.97;
      pointer-events: auto;
      animation: fadeIn 0.3s;
      border: 1.2px solid #4a9eff22;
      word-break: break-all;
      backdrop-filter: blur(6px) saturate(1.1);
      -webkit-backdrop-filter: blur(6px) saturate(1.1);
      transition: background 0.3s, box-shadow 0.3s;
    }
    .icon {
      font-size: 1.1rem;
      filter: drop-shadow(0 0 2px #fff8) drop-shadow(0 0 4px #4a9eff88);
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px);}
      to { opacity: 0.97; transform: translateY(0);}
    }
    @media (max-width: 600px) {
      .event-marquee.chat-style {
        right: 2vw;
        bottom: 6vw;
        max-width: 98vw;
        width: 98vw;
        padding: 6px 2px 6px 2px;
        max-height: 38vh;
      }
      .event-toast {
        min-width: 0;
        max-width: 98vw;
        font-size: 0.85rem;
        padding: 0.5rem 0.5rem;
      }
    }
  `]
})
export class EventMarqueeComponent implements OnInit, OnDestroy {
  toasts: EventToast[] = [];
  collapsed = false;
  private sub: Subscription | undefined = undefined;
  private id = 0;

  constructor(private worldEvent: WorldEventService) {}

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  ngOnInit() {
    this.sub = this.worldEvent.events$.subscribe((event: any) => {
      if (event.type === 'attack' && event.fromCountryId && event.toCountryId) {
        this.pushToast({
          icon: '🚀',
          text: `${event.fromCountryId} 向 ${event.toCountryId} 發射飛彈！`
        });
      }
      // 你可以根據 event.type 顯示不同訊息
    });
  }

  pushToast(data: {icon: string, text: string}) {
    const toast: EventToast = { id: ++this.id, ...data };
    this.toasts.unshift(toast); // 新事件加在最前面
    if (this.toasts.length > 30) {
      this.toasts = this.toasts.slice(0, 30); // 最多保留30則，避免記憶體爆掉
    }
    // 不再自動消失
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
