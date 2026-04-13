export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export const FIXED_LNG = -70.6

export const SCROLL_LAT_RANGE = {
  north: -18.0,
  south: -54.0,
}

export const INITIAL_VIEW = {
  center: [FIXED_LNG, -35.5] as [number, number],
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
}

export const CHILE_BOUNDS: [[number, number], [number, number]] = [
  [-78, -57],
  [-64, -16],
]

export const FOG_CONFIG = {
  color: 'rgb(20, 20, 30)',
  'high-color': 'rgb(40, 50, 80)',
  'horizon-blend': 0.03,
  'space-color': 'rgb(8, 8, 18)',
  'star-intensity': 0.8,
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

export const MAP_STYLE = 'mapbox://styles/mapbox/outdoors-v12'

export const CLUSTER_CONFIG = {
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
}
