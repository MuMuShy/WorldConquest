import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgStyle, NgClass } from '@angular/common';

@Component({
  selector: 'app-tile-popup',
  standalone: true,
  imports: [NgIf, NgStyle, NgClass],
  templateUrl: './tile-popup.component.html',
  styleUrls: ['./tile-popup.component.css']
})
export class TilePopupComponent {
  @Input() tile: any;
  @Input() set style(value: any) {
    Object.keys(value).forEach(key => {
      if (typeof value[key] === 'string' || typeof value[key] === 'number') {
        this._style[key] = value[key];
      }
    });
  }
  
  @Output() occupyEvent = new EventEmitter<void>();
  @Output() closeEvent = new EventEmitter<void>();
  
  _style: any = {};
  
  onOccupy(): void {
    this.occupyEvent.emit();
  }
  
  onClose(): void {
    this.closeEvent.emit();
  }
}