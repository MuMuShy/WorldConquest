import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../models/player.model';

@Component({
  selector: 'app-player-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-avatar.component.html',
  styleUrls: ['./player-avatar.component.css']
})
export class PlayerAvatarComponent implements OnInit {
  @Input() player!: Player;

  constructor() {}

  ngOnInit(): void {}

  getPercentage(current: number, max: number): number {
    return (current / max) * 100;
  }
}