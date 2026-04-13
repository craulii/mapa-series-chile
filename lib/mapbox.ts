export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export const FIXED_LNG = -70.6

export const SCROLL_LAT_RANGE = {
  north: -18.0,
  south: -54.0,
}

export const INITIAL_VIEW = {
  center: [FIXED_LNG, -35.5] as [number, number],
  zoom: 5.5,
  pitch: 30,
  bearing: 0,
}

export const CHILE_BOUNDS: [[number, number], [number, number]] = [
  [-78, -57],
  [-64, -16],
]

export const FOG_CONFIG = {
  color: 'rgb(12, 15, 28)',
  'high-color': 'rgb(18, 30, 55)',
  'horizon-blend': 0.08,
  'space-color': 'rgb(5, 5, 12)',
  'star-intensity': 0.4,
  range: [0.5, 12] as [number, number],
}

export const TERRAIN_CONFIG = {
  source: 'mapbox-dem',
  exaggeration: 1.0,
}

export const DEM_SOURCE = {
  type: 'raster-dem' as const,
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14,
}

export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11'

export const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
}
