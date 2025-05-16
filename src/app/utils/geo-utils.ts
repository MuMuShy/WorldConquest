import mapboxgl from 'mapbox-gl';

export function getFeatureCenter(feature: any): mapboxgl.LngLat | null {
  const bounds = new mapboxgl.LngLatBounds();
  let coords: number[][] = [];
  if (feature.geometry.type === 'Polygon') {
    coords = feature.geometry.coordinates?.[0] || [];
  } else if (feature.geometry.type === 'MultiPolygon') {
    coords = feature.geometry.coordinates?.[0]?.[0] || [];
  }
  if (!coords || coords.length === 0) return null;
  coords.forEach((coord: number[]) => bounds.extend(coord as [number, number]));
  return bounds.getCenter();
} 