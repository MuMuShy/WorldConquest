import mapboxgl from 'mapbox-gl';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorldTimeComponent } from '../world-time/world-time.component';
import { PlayerInfoComponent } from '../player-info/player-info.component';
import { CountryPanelComponent } from '../country-panel/country-panel.component';
import { ZoomControlsComponent } from '../zoom-controls/zoom-controls.component';
import { TilePopupComponent } from '../tile-popup/tile-popup.component';
import { WorldEventService } from '../../services/world-event.service';
import { MapService } from '../../services/map.service';
import { GameStateService } from '../../services/game-state.service';
import { Country } from '../../models/country.model';
import { Subscription } from 'rxjs';
import * as THREE from 'three';

@Component({
  selector: 'app-game-map',
  standalone: true,
  imports: [CommonModule, WorldTimeComponent, PlayerInfoComponent, CountryPanelComponent, ZoomControlsComponent, TilePopupComponent],
  templateUrl: './game-map.component.html',
  styleUrls: ['./game-map.component.css']
})
export class GameMapComponent implements OnInit, OnDestroy, AfterViewInit {
  isMapLoaded = false;
  countries: Country[] = [];
  selectedCountry: Country | null = null;
  selectedTile: any = null;
  showTilePopup = false;
  popupPosition = { x: 0, y: 0 };
  private sub = new Subscription();

  // 新增：飛彈動畫佇列
  missileQueue: Array<{
    from: string;
    to: string;
    startTime: number;
    duration: number;
  }> = [];
  missileAnimation: {
    from: string;
    to: string;
    startTime: number;
    duration: number;
  } | null = null;

  private _isDrawing = false;
  private threeLayer: any = null;

  private missileLayerReady = false;

  // 火焰特效陣列
  fireAnims: Array<{lng: number, lat: number, start: number, progress: number}> = [];

  constructor(
    private worldEvent: WorldEventService,
    private mapService: MapService,
    private gameState: GameStateService
  ) {}

  ngOnInit() {
    this.sub.add(this.worldEvent.countries$.subscribe(countries => {
      this.countries = countries;
    }));

    // 初始化地圖互動
    this.gameState.initGame();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.mapService.destroyMap();
    this.gameState.stopGameLoop();
  }

  private initMap(): void {
    this.mapService.initializeMap('map-container').then(() => {
      this.isMapLoaded = true;
      this.mapService.addCountriesToMap();
      this.setupMapEvents();

      const map = this.mapService.map;
      this.onMapStyleLoaded(map);
    });
  }

  private setupMapEvents(): void {
    this.mapService.onCountryClick.subscribe(data => {
      this.selectedCountry = data.country;
      this.selectedTile = data.tile;
      this.popupPosition = data.position || { x: 0, y: 0 };
      this.showTilePopup = false;
    });
  }

  closeCountryPanel(): void {
    this.selectedCountry = null;
    this.selectedTile = null;
  }

  onOccupyCountry(): void {
    if (this.selectedCountry) {
      this.gameState.occupyCountry(this.selectedCountry.id);
      this.mapService.updateCountryOwnership(this.selectedCountry.id, 'You');
      this.mapService.updateCountryStatus(this.selectedCountry.id, 'UnderAttack');
      this.selectedCountry = {
        ...this.selectedCountry,
        owner: 'You',
        loyalty: 50,
        status: 'UnderAttack'
      };
      setTimeout(() => {
        if (this.selectedCountry) {
          this.mapService.updateCountryStatus(this.selectedCountry.id, 'Recovering');
          this.selectedCountry = {
            ...this.selectedCountry,
            status: 'Recovering'
          };
        }
      }, 3000);
    }
  }

  onTaxCountry(): void {
    if (this.selectedCountry) {
      this.gameState.taxCountry(this.selectedCountry.id);
      this.mapService.updateCountryStatus(this.selectedCountry.id, 'Rebelling');
      this.selectedCountry = {
        ...this.selectedCountry,
        loyalty: Math.max(0, this.selectedCountry.loyalty - 10),
        status: 'Rebelling'
      };
      setTimeout(() => {
        if (this.selectedCountry) {
          this.mapService.updateCountryStatus(this.selectedCountry.id, 'Idle');
          this.selectedCountry = {
            ...this.selectedCountry,
            status: 'Idle'
          };
        }
      }, 2000);
    }
  }

  onPropaganda(): void {
    if (this.selectedCountry) {
      this.gameState.runPropaganda(this.selectedCountry.id);
      this.mapService.updateCountryStatus(this.selectedCountry.id, 'Propaganda');
      this.selectedCountry = {
        ...this.selectedCountry,
        loyalty: Math.min(100, this.selectedCountry.loyalty + 10),
        status: 'Propaganda'
      };
      setTimeout(() => {
        if (this.selectedCountry) {
          this.mapService.updateCountryStatus(this.selectedCountry.id, 'Idle');
          this.selectedCountry = {
            ...this.selectedCountry,
            status: 'Idle'
          };
        }
      }, 2000);
    }
  }

  private onMapStyleLoaded(map: any) {
    console.log('map loaded');
    map.addSource('missile-trace', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    map.addLayer({
      id: 'missile-trace',
      type: 'line',
      source: 'missile-trace',
      paint: {
        'line-color': [
          'interpolate', ['linear'], ['line-progress'],
          0, '#00fff7',
          0.5, '#4a9eff',
          1, '#00ffea'
        ],
        'line-width': 1.2,
        'line-opacity': 0.95,
        'line-blur': 2,
        'line-dasharray': [1, 2]
      }
    }, 'countries-fill');
    console.log('missile-trace source/layer added');
    console.log('all layers:', map.getStyle().layers.map((l: any) => l.id));
    this.missileLayerReady = true;

    // 監聽 attack 事件，觸發動畫
    this.sub.add(this.worldEvent.events$.subscribe(event => {
      console.log('event', event);
      if (event.type === 'attack' && event.fromCountryId && event.toCountryId && this.missileLayerReady) {
        console.log('attack event', event);
        // 查詢國家中心
        const features = map.querySourceFeatures('countries');
        const fromFeature = features.find((f: any) => f.properties && f.properties['name'] === event.fromCountryId);
        const toFeature = features.find((f: any) => f.properties && f.properties['name'] === event.toCountryId);
        console.log('fromFeature', fromFeature);
        console.log('toFeature', toFeature);
        if (!fromFeature || !toFeature) return;
        function getCenter(feature: any) {
          const bounds = new mapboxgl.LngLatBounds();
          let coords: number[][] = [];
          if (feature.geometry.type === 'Polygon') {
            coords = feature.geometry.coordinates[0];
          } else if (feature.geometry.type === 'MultiPolygon') {
            coords = feature.geometry.coordinates[0][0];
          }
          coords.forEach((coord: number[]) => bounds.extend(coord as [number, number]));
          return bounds.getCenter();
        }
        const fromCenter = getCenter(fromFeature);
        const toCenter = getCenter(toFeature);
        this.animateMissileLine(map, [fromCenter.lng, fromCenter.lat], [toCenter.lng, toCenter.lat]);
      }
    }));

    map.addSource('explosion-effect', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    map.addLayer({
      id: 'explosion-effect',
      type: 'circle',
      source: 'explosion-effect',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'progress'],
          0, 8,
          1, 32
        ],
        'circle-color': [
          'interpolate', ['linear'], ['get', 'progress'],
          0, '#fffbe6',
          0.3, '#ffd600',
          0.6, '#ff9800',
          1, '#ff3d00'
        ],
        'circle-opacity': [
          'interpolate', ['linear'], ['get', 'progress'],
          0, 0.7,
          0.7, 0.5,
          1, 0
        ]
      }
    }, 'missile-trace');
  }

  // 新增：動畫函式
  private animateMissileLine(map: any, from: [number, number], to: [number, number]) {
    console.log('missile from', from, 'to', to);
    const missileSource = map.getSource('missile-trace');
    if (!missileSource) {
      console.warn('missile-trace source 尚未初始化');
      return;
    }
    // 根據距離自動調整 steps 與 interval
    const fromLngLat = new mapboxgl.LngLat(from[0], from[1]);
    const toLngLat = new mapboxgl.LngLat(to[0], to[1]);
    const distance = fromLngLat.distanceTo(toLngLat); // 公尺
    const minSteps = 30;
    const maxSteps = 120;
    const minInterval = 12;
    const maxInterval = 24;
    const steps = Math.round(minSteps + (maxSteps - minSteps) * Math.min(distance / 5000, 1));
    const interval = Math.max(minInterval, Math.min(maxInterval, (800 + (distance / 1000) * 500) / steps));
    const duration = steps * interval;
    // 拋物線法線方向
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    const maxHeight = len * 0.3; // 拋物線最大偏移
    const coords: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lng = from[0] + dx * t + nx * maxHeight * 4 * t * (1 - t);
      const lat = from[1] + dy * t + ny * maxHeight * 4 * t * (1 - t);
      coords.push([lng, lat]);
    }
    let i = 0;
    const missileFeature = {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: [coords[0]] },
      properties: {}
    };
    const features = missileSource._data.features;
    features.push(missileFeature);
    const timer = setInterval(() => {
      if (i < coords.length) {
        missileFeature.geometry.coordinates.push(coords[i]);
        missileSource.setData({
          type: 'FeatureCollection',
          features
        });
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          features.splice(features.indexOf(missileFeature), 1);
          missileSource.setData({
            type: 'FeatureCollection',
            features
          });
        }, 800);
        // 新增：在目標產生爆炸特效
        this.fireAnims.push({ lng: to[0], lat: to[1], start: Date.now(), progress: 0 });
        this.renderFireEffect(map);
      }
    }, interval);
  }

  // 渲染火焰特效（簡單用 mapbox marker 或 emoji）
  private renderFireEffect(map: any) {
    const now = Date.now();
    // 1秒動畫
    this.fireAnims = this.fireAnims.filter(f => now - f.start < 1000);
    this.fireAnims.forEach(f => {
      f.progress = Math.min(1, (now - f.start) / 1000);
    });
    const features = this.fireAnims.map(f => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
      properties: { progress: f.progress }
    }));
    const source = map.getSource('explosion-effect');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
    if (this.fireAnims.length > 0) {
      setTimeout(() => this.renderFireEffect(map), 40);
    }
  }

  private _fireMarkers: any[] = [];
}