import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-faction-select',
  standalone: true,
  templateUrl: './faction-select.component.html',
  styleUrls: ['./faction-select.component.css']
})
export class FactionSelectComponent {
  @Output() factionSelected = new EventEmitter<'alliance' | 'empire'>();

  select(faction: 'alliance' | 'empire') {
    this.factionSelected.emit(faction);
  }
} 