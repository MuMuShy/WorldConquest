import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-zoom-controls',
  standalone: true,
  templateUrl: './zoom-controls.component.html',
  styleUrls: ['./zoom-controls.component.css']
})
export class ZoomControlsComponent {
  @Output() zoomInEvent = new EventEmitter<void>();
  @Output() zoomOutEvent = new EventEmitter<void>();

  zoomIn(): void {
    this.zoomInEvent.emit();
  }

  zoomOut(): void {
    this.zoomOutEvent.emit();
  }
}