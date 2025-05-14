import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, firstValueFrom } from 'rxjs';
import mapboxgl from 'mapbox-gl';
import * as GeoJSON from 'geojson';
import { environment } from '../../environments/environment';
import { Country, CountryStatus } from '../models/country.model';

// === 新增：計算 GeoJSON 國家中心點 ===
function getFeatureCenter(feature: any): { lng: number, lat: number } {
  const bounds = new mapboxgl.LngLatBounds();
  let coords: number[][] = [];
  if (feature.geometry.type === 'Polygon') {
    coords = feature.geometry.coordinates[0];
  } else if (feature.geometry.type === 'MultiPolygon') {
    coords = feature.geometry.coordinates[0][0];
  }
  coords.forEach((coord: number[]) => {
    bounds.extend(coord as [number, number]);
  });
  const center = bounds.getCenter();
  return { lng: center.lng, lat: center.lat };
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  public map: mapboxgl.Map | null = null;
  private countriesData: GeoJSON.FeatureCollection | null = null;
  private statusMarkers: { [key: string]: mapboxgl.Marker } = {};
  private animationInterval: number | null = null;
  public onCountryClick = new Subject<{
    country: Country,
    position: { x: number, y: number },
    tile: GeoJSON.Feature
  }>();
  
  constructor(private http: HttpClient) {
    (mapboxgl as any).accessToken = environment.mapboxToken;
  }

  public async initializeMap(containerId: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.map = new mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 3,
        minZoom: 1.2,
        maxZoom: 4.5,
        attributionControl: false,
        dragRotate: false
      });

      this.map.on('load', async () => {
        await this.loadCountriesData();
        this.addCountriesToMap();
        this.configureMap();
        this.startAnimationLoop();
        resolve();
      });
    });
  }

  private async loadCountriesData(): Promise<void> {
    try {
      const response = await firstValueFrom(this.http.get('/assets/countries.geo.json'));
      this.countriesData = this.processGeoJSON(response);
    } catch (error) {
      console.error('Failed to load countries data:', error);
      this.countriesData = this.generateSimplifiedData();
    }
  }

  private processGeoJSON(data: any): GeoJSON.FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: data.features.map((feature: any) => ({
        ...feature,
        properties: {
          ...feature.properties,
          id: feature.properties.name,
          name: feature.properties.name,
          owner: 'Neutral',
          population: Math.floor(Math.random() * 100000000) + 1000000,
          loyalty: 50,
          income: Math.floor(Math.random() * 1000) + 100,
          status: 'Idle' as CountryStatus,
          attackFrame: 0
        }
      }))
    };
  }
  
  private setupStatusLayers(): void {
    if (!this.map) return;

    this.map.addLayer({
      id: 'countries-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': [
          'match',
          ['get', 'status'],
          'UnderAttack', [
            'interpolate',
            ['linear'],
            ['get', 'attackFrame'],
            0, 'rgba(244, 67, 54, 0.7)',
            1, 'rgba(244, 67, 54, 0.2)'
          ],
          'Rebelling', 'rgba(255, 193, 7, 0.5)',
          'Propaganda', 'rgba(33, 150, 243, 0.5)',
          'Recovering', 'rgba(76, 175, 80, 0.3)',
          'rgba(158, 158, 158, 0.5)'
        ],
        'fill-opacity': 0.6
      }
    });

    this.map.addLayer({
      id: 'countries-outline',
      type: 'line',
      source: 'countries',
      paint: {
        'line-color': 'rgba(255, 255, 255, 0.5)',
        'line-width': 1
      }
    });
  }

  private startAnimationLoop(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.animationInterval = window.setInterval(() => {
      if (!this.map || !this.countriesData) return;

      let needsUpdate = false;
      const updatedData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: this.countriesData.features.map((feature: any) => {
          const newFeature = { ...feature };
          if (newFeature.properties.status === 'UnderAttack') {
            needsUpdate = true;
            newFeature.properties = {
              ...newFeature.properties,
              attackFrame: (newFeature.properties.attackFrame + 1) % 2
            };
          }
          return newFeature;
        })
      };

      if (needsUpdate) {
        const source = this.map.getSource('countries') as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(updatedData);
        }
        this.countriesData = updatedData;
      }
    }, 500);
  }

  public addCountriesToMap(): void {
    if (!this.map || !this.countriesData) return;

    const existingSource = this.map.getSource('countries');
    if (existingSource) {
      (existingSource as mapboxgl.GeoJSONSource).setData(this.countriesData);
    } else {
      this.map.addSource('countries', {
        type: 'geojson',
        data: this.countriesData
      });

      this.setupStatusLayers();
      this.setupMapEvents();
    }
  }

  private setupMapEvents(): void {
    if (!this.map) return;

    this.map.on('click', 'countries-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const clickedFeature = e.features[0];
        const countryName = clickedFeature.properties?.['name'];
        
        const countryData = this.countriesData?.features.find(
          (f: any) => f.properties?.['name'] === countryName
        );
        
        if (countryData) {
          const clickedCountry: Country = {
            id: countryData.properties?.['name'],
            name: countryData.properties?.['name'],
            owner: countryData.properties?.['owner'],
            population: countryData.properties?.['population'],
            loyalty: countryData.properties?.['loyalty'],
            income: countryData.properties?.['income'],
            status: countryData.properties?.['status'] || 'Idle'
          };
          
          const position = {
            x: e.point.x,
            y: e.point.y
          };
          
          this.onCountryClick.next({ 
            country: clickedCountry,
            position,
            tile: clickedFeature
          });
        }
      }
    });

    this.map.on('mouseenter', 'countries-fill', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'countries-fill', () => {
      if (this.map) this.map.getCanvas().style.cursor = '';
    });
  }

  public updateCountryStatus(countryId: string, status: CountryStatus): void {
    if (!this.map || !this.countriesData) return;
    
    const updatedData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: this.countriesData.features.map((feature: any) => {
        if (feature.properties?.['name'] === countryId) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              status,
              attackFrame: status === 'UnderAttack' ? 0 : feature.properties.attackFrame
            }
          };
        }
        return feature;
      })
    };
    
    const source = this.map.getSource('countries') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(updatedData);
    }
    
    this.countriesData = updatedData;
    
    const countryFeature = updatedData.features.find(
      (feature: any) => feature.properties?.['name'] === countryId
    );
    
    if (countryFeature) {
      //this.updateStatusMarker(countryId, status, countryFeature);
    }
  }

  private updateStatusMarker(countryId: string, status: CountryStatus, feature: any): void {
    if (!this.map) return;

    if (this.statusMarkers[countryId]) {
      this.statusMarkers[countryId].remove();
      delete this.statusMarkers[countryId];
    }

    if (status === 'Idle') return;

    const bounds = new mapboxgl.LngLatBounds();
    const coordinates = feature.geometry.coordinates.flat(2);
    coordinates.forEach((coord: number[]) => {
      bounds.extend(coord as [number, number]);
    });
    
    const center = bounds.getCenter();

    const el = document.createElement('div');
    el.className = 'country-status-marker';
    el.innerHTML = `
      <div class="status-label status-${status.toLowerCase()}">
        ${feature.properties['name']}: ${status}
      </div>
    `;

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(center)
      .addTo(this.map);

    this.statusMarkers[countryId] = marker;
  }

  public updateCountryOwnership(countryId: string, owner: string): void {
    if (!this.map || !this.countriesData) return;
    
    const updatedData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: this.countriesData.features.map((feature: any) => {
        if (feature.properties?.['name'] === countryId) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              owner
            }
          };
        }
        return feature;
      })
    };
    
    const source = this.map.getSource('countries') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(updatedData);
    }
    
    this.countriesData = updatedData;
  }

  public destroyMap(): void {
    if (this.map) {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
      }
      Object.values(this.statusMarkers).forEach(marker => marker.remove());
      this.statusMarkers = {};
      this.map.remove();
      this.map = null;
    }
  }

  private configureMap(): void {
    if (!this.map) return;
    
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
  }

  private generateSimplifiedData(): GeoJSON.FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: [
        this.createSimplifiedCountry('United States', [-98, 39], 'Neutral', 331000000),
        this.createSimplifiedCountry('Russia', [105, 61], 'Neutral', 144000000),
        this.createSimplifiedCountry('China', [104, 35], 'Neutral', 1439000000),
        this.createSimplifiedCountry('Brazil', [-55, -10], 'Neutral', 212000000),
        this.createSimplifiedCountry('India', [78, 21], 'Neutral', 1380000000)
      ]
    };
  }

  private createSimplifiedCountry(
    name: string,
    center: number[],
    owner: string,
    population: number
  ): GeoJSON.Feature {
    const [lon, lat] = center;
    const width = 20;
    const height = 15;
    
    return {
      type: 'Feature',
      properties: {
        id: name,
        name: name,
        owner,
        population,
        loyalty: 50,
        income: Math.floor(population / 1000000),
        status: 'Idle' as CountryStatus,
        attackFrame: 0
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [lon - width, lat - height],
          [lon + width, lat - height],
          [lon + width, lat + height],
          [lon - width, lat + height],
          [lon - width, lat - height]
        ]]
      }
    };
  }
}