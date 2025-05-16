import { Injectable } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import type { CountryStatus } from '../models/country.model';
import { getFeatureCenter } from '../utils/geo-utils';

@Injectable({ providedIn: 'root' })
export class MapEffectService {
  private map: any;
  private fireAnims: Array<{lng: number, lat: number, start: number, progress: number, toCountryId?: string}> = [];
  private missileSource: any;

  setMap(map: any) {
    this.map = map;
    this.missileSource = map.getSource('missile-trace');
  }

  handleEvent(event: any, updateCountryStatus?: (id: string, status: CountryStatus) => void) {
    if (!this.map) return;
    if (event.type === 'attack' && event.fromCountryId && event.toCountryId) {
      const features = this.map.querySourceFeatures('countries');
      const fromFeature = features.find((f: any) => f.properties && f.properties['name'] === event.fromCountryId);
      const toFeature = features.find((f: any) => f.properties && f.properties['name'] === event.toCountryId);
      if (!fromFeature || !toFeature) return;
      const fromCenter = getFeatureCenter(fromFeature);
      const toCenter = getFeatureCenter(toFeature);
      if (!fromCenter || !toCenter) return;
      this.launchMissile({
        from: [fromCenter.lng, fromCenter.lat],
        to: [toCenter.lng, toCenter.lat],
        toCountryId: event.toCountryId,
        updateCountryStatus
      });
    }
    if (event.type === 'playerDirectAttack' && event.toCountryId) {
      const features = this.map.querySourceFeatures('countries');
      const toFeature = features.find((f: any) => f.properties && f.properties['name'] === event.toCountryId);
      if (!toFeature) return;
      const toCenter = getFeatureCenter(toFeature);
      if (!toCenter) return;
      this.showExplosion({ at: [toCenter.lng, toCenter.lat] });
      if (updateCountryStatus) {
        updateCountryStatus(event.toCountryId, 'UnderAttack');
        setTimeout(() => {
          updateCountryStatus(event.toCountryId, 'Idle');
        }, 2000);
      }
    }
  }

  launchMissile(opts: {
    from: [number, number],
    to: [number, number],
    toCountryId?: string,
    onHit?: () => void,
    updateCountryStatus?: (id: string, status: CountryStatus) => void
  }) {
    if (!this.map || !this.missileSource) return;
    const { from, to, toCountryId, onHit, updateCountryStatus } = opts;
    // 飛彈動畫
    const fromLngLat = new mapboxgl.LngLat(from[0], from[1]);
    const toLngLat = new mapboxgl.LngLat(to[0], to[1]);
    const distance = fromLngLat.distanceTo(toLngLat);
    const minSteps = 30;
    const maxSteps = 120;
    const minInterval = 12;
    const maxInterval = 24;
    const steps = Math.round(minSteps + (maxSteps - minSteps) * Math.min(distance / 5000, 1));
    const interval = Math.max(minInterval, Math.min(maxInterval, (800 + (distance / 1000) * 500) / steps));
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    const maxHeight = len * 0.3;
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
    const features = this.missileSource._data.features;
    features.push(missileFeature);
    const timer = setInterval(() => {
      if (i < coords.length) {
        missileFeature.geometry.coordinates.push(coords[i]);
        this.missileSource.setData({
          type: 'FeatureCollection',
          features
        });
        i++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          features.splice(features.indexOf(missileFeature), 1);
          this.missileSource.setData({
            type: 'FeatureCollection',
            features
          });
        }, 800);
        // 爆炸特效
        this.showExplosion({ at: to });
        // 命中時狀態變更
        if (updateCountryStatus && typeof toCountryId === 'string') {
          updateCountryStatus(toCountryId, 'UnderAttack');
          setTimeout(() => {
            updateCountryStatus(toCountryId, 'Idle');
          }, 3000);
        }
        if (onHit) onHit();
      }
    }, interval);
  }

  showExplosion(opts: { at: [number, number] }) {
    const { at } = opts;
    this.fireAnims.push({ lng: at[0], lat: at[1], start: Date.now(), progress: 0 });
    this.renderFireEffect();
  }

  private renderFireEffect() {
    if (!this.map) return;
    const now = Date.now();
    this.fireAnims = this.fireAnims.filter(f => now - f.start < 1000);
    this.fireAnims.forEach(f => {
      f.progress = Math.min(1, (now - f.start) / 1000);
    });
    const features = this.fireAnims.map(f => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
      properties: { progress: f.progress }
    }));
    const source = this.map.getSource('explosion-effect');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
    if (this.fireAnims.length > 0) {
      setTimeout(() => this.renderFireEffect(), 40);
    }
  }
} 