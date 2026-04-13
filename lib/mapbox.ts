export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export const INITIAL_VIEW = {
  center: [-70.6693, -33.4489] as [number, number],
  zoom: 4,
  pitch: 50,
  bearing: 0,
}

export const CHILE_OVERVIEW = {
  center: [-70.6693, -35.0] as [number, number],
  zoom: 4.5,
  pitch: 55,
  bearing: 0,
}

export const FOG_CONFIG = {
  color: 'rgb(20, 20, 30)',
  'high-color': 'rgb(40, 50, 80)',
  'horizon-blend': 0.03,
  'space-color': 'rgb(8, 8, 18)',
  'star-intensity': 0.8,
}

export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.5,
}

export const DEM_SOURCE = {
  type: 'raster-dem' as const,
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14,
}

export const MAP_STYLE = 'mapbox://styles/mapbox/outdoors-v12'

export const FLY_TO_DEFAULTS = {
  duration: 2500,
  essential: true,
  curve: 1.42,
}
