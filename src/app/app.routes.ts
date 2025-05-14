import { Routes } from '@angular/router';
import { GameMapComponent } from './components/game-map/game-map.component';

export const routes: Routes = [
  { path: '', component: GameMapComponent },
  { path: '**', redirectTo: '' }
];