'use client'

import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  MAPBOX_TOKEN,
  MAP_STYLE,
  INITIAL_VIEW,
  FOG_CONFIG,
  TERRAIN_CONFIG,
  DEM_SOURCE,
  FLY_TO_DEFAULTS,
} from '@/lib/mapbox'

export interface Episode {
  id: string
  show: string
  showName: string
  title: string
  city: string
  lat: number
  lng: number
  mapView: {
    center: [number, number]
    zoom: number
    bearing: number
    pitch: number
  }
}

export interface MapHandle {
  flyTo: (view: Episode['mapView']) => void
  flyToOverview: () => void
}

interface MapInnerProps {
  episodes: Episode[]
  activeEpisodeId: string | null
}

const MapInner = forwardRef<MapHandle, MapInnerProps>(function MapInner(
  { episodes, activeEpisodeId },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  const flyTo = useCallback((view: Episode['mapView']) => {
    const map = mapRef.current
    if (!map) return
    map.flyTo({
      center: view.center,
      zoom: view.zoom,
      bearing: view.bearing,
      pitch: view.pitch,
      ...FLY_TO_DEFAULTS,
    })
  }, [])

  const flyToOverview = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    map.flyTo({
      center: [-70.6693, -35.0],
      zoom: 4.5,
      pitch: 50,
      bearing: 0,
      duration: 3000,
      essential: true,
    })
  }, [])

  useImperativeHandle(ref, () => ({ flyTo, flyToOverview }), [flyTo, flyToOverview])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      projection: 'globe',
      center: INITIAL_VIEW.center,
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      antialias: true,
    })

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-left')

    map.on('style.load', () => {
      map.setFog(FOG_CONFIG as mapboxgl.FogSpecification)

      map.addSource('mapbox-dem', DEM_SOURCE)
      map.setTerrain(TERRAIN_CONFIG)

      // Chile border highlight
      map.addLayer({
        id: 'chile-border',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-streets-v8',
        },
        'source-layer': 'admin',
        filter: ['all',
          ['==', 'admin_level', 0],
          ['==', 'disputed', 'false'],
          ['==', 'maritime', 'false'],
        ],
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.5,
          'line-opacity': 0.4,
        },
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Manage markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current.clear()

    episodes.forEach((ep) => {
      const el = document.createElement('div')
      el.className = `w-4 h-4 rounded-full border-2 border-white cursor-pointer transition-all duration-300 ${
        ep.id === activeEpisodeId
          ? 'bg-accent-red scale-150 marker-active'
          : ep.show === 'mea-culpa'
            ? 'bg-red-600/70'
            : 'bg-amber-600/70'
      }`
      el.style.cssText = `
        width: ${ep.id === activeEpisodeId ? '20px' : '14px'};
        height: ${ep.id === activeEpisodeId ? '20px' : '14px'};
        border-radius: 50%;
        border: 2px solid white;
        background: ${
          ep.id === activeEpisodeId
            ? '#dc2626'
            : ep.show === 'mea-culpa'
              ? 'rgba(220,38,38,0.7)'
              : 'rgba(217,119,6,0.7)'
        };
        cursor: pointer;
        transition: all 0.3s ease;
        ${ep.id === activeEpisodeId ? 'animation: marker-pulse 2s infinite;' : ''}
      `

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([ep.lng, ep.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 15, closeButton: false })
            .setHTML(`<div style="color:#000;font-weight:600;font-size:13px">${ep.title}</div><div style="color:#666;font-size:11px">${ep.city}</div>`)
        )
        .addTo(map)

      markersRef.current.set(ep.id, marker)
    })
  }, [episodes, activeEpisodeId])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
        <p className="text-white/40 text-sm">Configura NEXT_PUBLIC_MAPBOX_TOKEN para ver el mapa</p>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
})

export default MapInner
