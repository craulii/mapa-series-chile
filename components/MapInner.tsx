'use client'

import { useRef, useEffect, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  MAPBOX_TOKEN,
  MAP_STYLE,
  INITIAL_VIEW,
  FOG_CONFIG,
  TERRAIN_CONFIG,
  DEM_SOURCE,
  CHILE_BOUNDS,
  CLUSTER_CONFIG,
  FIXED_LNG,
} from '@/lib/mapbox'

export interface Episode {
  id: string
  show: string
  showName: string
  title: string
  season: number
  episode: number
  city: string
  region: string
  address: string
  lat: number
  lng: number
  summary: string
  youtubeUrl: string
  coverImage: string
}

interface MapInnerProps {
  episodes: Episode[]
  onEpisodeClick: (episodes: Episode[]) => void
  scrollLat: number
}

export default function MapInner({ episodes, onEpisodeClick, scrollLat }: MapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const episodesRef = useRef(episodes)
  episodesRef.current = episodes

  const onEpisodeClickRef = useRef(onEpisodeClick)
  onEpisodeClickRef.current = onEpisodeClick

  // Sync scroll position to map center
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    map.setCenter([FIXED_LNG, scrollLat])
  }, [scrollLat])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      maxBounds: CHILE_BOUNDS,
      dragPan: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      touchZoomRotate: true,
      scrollZoom: false,
      doubleClickZoom: true,
      antialias: true,
      maxPitch: 0,
      minPitch: 0,
    })

    // Disable rotation on touch but keep zoom
    map.touchZoomRotate.disableRotation()

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('style.load', () => {
      map.setFog(FOG_CONFIG as mapboxgl.FogSpecification)
      map.addSource('mapbox-dem', DEM_SOURCE)
      map.setTerrain(TERRAIN_CONFIG)

      // Chile border
      map.addLayer({
        id: 'chile-border',
        type: 'line',
        source: { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' },
        'source-layer': 'admin',
        filter: ['all',
          ['==', 'admin_level', 0],
          ['==', 'disputed', 'false'],
          ['==', 'maritime', 'false'],
        ],
        paint: {
          'line-color': '#4a9eff',
          'line-width': 1.5,
          'line-opacity': 0.5,
        },
      })

      // Episode GeoJSON source with clustering
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: episodesRef.current.map((ep) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [ep.lng, ep.lat] },
          properties: {
            id: ep.id,
            show: ep.show,
            showName: ep.showName,
            title: ep.title,
            season: ep.season,
            episode: ep.episode,
            city: ep.city,
            region: ep.region,
            address: ep.address,
            summary: ep.summary,
            youtubeUrl: ep.youtubeUrl,
            coverImage: ep.coverImage,
          },
        })),
      }

      map.addSource('episodes', {
        type: 'geojson',
        data: geojson,
        ...CLUSTER_CONFIG,
      })

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'episodes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#dc2626',
            5, '#b91c1c',
            10, '#991b1b',
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            18,
            5, 24,
            10, 30,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.85,
        },
      })

      // Cluster count text
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'episodes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Unclustered points
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'episodes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match', ['get', 'show'],
            'mea-culpa', '#dc2626',
            'el-dia-menos-pensado', '#d97706',
            '#dc2626',
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      })

      // Click on cluster → show episodes in cluster
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        if (!features.length) return
        const props = features[0].properties
        if (!props) return

        const clusterId = props.cluster_id as number
        const pointCount = props.point_count as number
        const source = map.getSource('episodes') as mapboxgl.GeoJSONSource

        source.getClusterLeaves(clusterId, pointCount, 0, (err, leaves) => {
          if (err || !leaves) return
          const ids = leaves.map((f) => f.properties?.id).filter(Boolean)
          const matched = episodesRef.current.filter((ep) => ids.includes(ep.id))
          onEpisodeClickRef.current(matched)
        })
      })

      // Click on individual point
      map.on('click', 'unclustered-point', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
        if (!features.length) return
        const id = features[0].properties?.id
        const matched = episodesRef.current.find((ep) => ep.id === id)
        if (matched) onEpisodeClickRef.current([matched])
      })

      // Click on empty area → close panel
      map.on('click', (e) => {
        const hits = map.queryRenderedFeatures(e.point, {
          layers: ['clusters', 'unclustered-point'],
        })
        if (hits.length === 0) {
          onEpisodeClickRef.current([])
        }
      })

      // Cursor changes
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = '' })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
        <p className="text-white/40 text-sm">Configura NEXT_PUBLIC_MAPBOX_TOKEN para ver el mapa</p>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
