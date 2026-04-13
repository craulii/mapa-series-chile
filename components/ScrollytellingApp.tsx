'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import MapWrapper from './Map'
import type { MapHandle } from './Map'
import EpisodePanel from './EpisodePanel'
import ContributeModal from './ContributeModal'

interface Episode {
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
  mapView: {
    center: [number, number]
    zoom: number
    bearing: number
    pitch: number
  }
}

interface ScrollytellingAppProps {
  episodes: Episode[]
}

export default function ScrollytellingApp({ episodes }: ScrollytellingAppProps) {
  const mapRef = useRef<MapHandle>(null)
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null)
  const [contributeOpen, setContributeOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  const activeEpisode = episodes.find((e) => e.id === activeEpisodeId) || null

  // Scroll progress tracker
  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Intersection Observer for scroll sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const episodeId = entry.target.getAttribute('data-episode-id')
            if (episodeId === 'overview') {
              setActiveEpisodeId(null)
              mapRef.current?.flyToOverview()
            } else if (episodeId) {
              setActiveEpisodeId(episodeId)
              const ep = episodes.find((e) => e.id === episodeId)
              if (ep) {
                mapRef.current?.flyTo(ep.mapView)
              }
            }
          }
        }
      },
      {
        threshold: 0.5,
        rootMargin: '-35% 0px -35% 0px',
      }
    )

    sectionRefs.current.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [episodes])

  const registerSection = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el)
    } else {
      sectionRefs.current.delete(id)
    }
  }, [])

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-30 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-accent-red to-accent-gold transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Episode counter */}
      {activeEpisode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-white/60">
          {episodes.findIndex((e) => e.id === activeEpisodeId) + 1} / {episodes.length} — {activeEpisode.city}
        </div>
      )}

      {/* Fixed map background */}
      <div className="fixed inset-0 z-0">
        <MapWrapper
          ref={mapRef}
          episodes={episodes}
          activeEpisodeId={activeEpisodeId}
        />
      </div>

      {/* Scroll sections */}
      <div className="relative z-10 pointer-events-none">
        {/* Overview section - triggers zoom out */}
        <div
          ref={(el) => registerSection('overview', el)}
          data-episode-id="overview"
          className="h-screen"
        />

        {/* Episode sections */}
        {episodes.map((ep, i) => (
          <div
            key={ep.id}
            ref={(el) => registerSection(ep.id, el)}
            data-episode-id={ep.id}
            className="h-[80vh] flex items-center"
          >
            {/* Invisible scroll section — the EpisodePanel shows the content */}
            <div className="lg:w-[calc(100%-420px)] w-full px-6 pointer-events-auto">
              <div className="lg:hidden">
                {/* On mobile, content is in bottom sheet — this is just a spacer */}
              </div>
            </div>
          </div>
        ))}

        {/* End spacer */}
        <div className="h-[50vh] flex items-center justify-center pointer-events-auto">
          <div className="text-center">
            <p className="text-white/30 text-sm mb-4">Has recorrido todo Chile</p>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                mapRef.current?.flyToOverview()
              }}
              className="px-6 py-2 rounded-full border border-white/20 text-sm text-white/50 hover:text-white hover:border-white/40 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>

      {/* Episode info panel */}
      <EpisodePanel
        episode={activeEpisode}
        onContribute={() => setContributeOpen(true)}
      />

      {/* Contribute modal */}
      <ContributeModal
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
      />
    </div>
  )
}
