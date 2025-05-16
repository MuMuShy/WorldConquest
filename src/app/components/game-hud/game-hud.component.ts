import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../services/game-state.service';
import { Player } from '../../models/player.model';
import { PlayerAvatarComponent } from '../player-avatar/player-avatar.component';
import { ResourceDisplayComponent } from '../resource-display/resource-display.component';
// import { NotificationFeedComponent } from '../notification-feed/notification-feed.component';
import { StatsDisplayComponent } from '../stats-display/stats-display.component';

@Component({
  selector: 'app-game-hud',
  standalone: true,
  imports: [
    CommonModule,
    PlayerAvatarComponent,
    ResourceDisplayComponent,
    // NotificationFeedComponent,
    StatsDisplayComponent
  ],
  templateUrl: './game-hud.component.html',
  styleUrls: ['./game-hud.component.css']
})
export class GameHudComponent implements OnInit {
  player: Player | null = null;
  notifications: string[] = [];
  
  constructor(private gameStateService: GameStateService) {}
  
  ngOnInit(): void {
    this.gameStateService.player$.subscribe(player => {
      this.player = player;
    });
    
    // this.gameStateService.notifications$.subscribe(notifications => {
    //   this.notifications = notifications;
    // });
  }
}