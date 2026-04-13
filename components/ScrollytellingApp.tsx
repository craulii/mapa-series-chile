'use client'

import { useState, useEffect, useCallback } from 'react'
import MapWrapper from './Map'
import type { Episode } from './Map'
import EpisodePanel from './EpisodePanel'
import ContributeModal from './ContributeModal'
import { SCROLL_LAT_RANGE } from '@/lib/mapbox'

interface ScrollytellingAppProps {
  episodes: Episode[]
}

export default function ScrollytellingApp({ episodes }: ScrollytellingAppProps) {
  const [selectedEpisodes, setSelectedEpisodes] = useState<Episode[]>([])
  const [contributeOpen, setContributeOpen] = useState(false)
  const [scrollLat, setScrollLat] = useState(SCROLL_LAT_RANGE.north)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Map scroll position to latitude
  useEffect(() => {
    function onScroll() {
      const scrollContainer = document.getElementById('scroll-driver')
      if (!scrollContainer) return

      const rect = scrollContainer.getBoundingClientRect()
      const containerTop = scrollContainer.offsetTop
      const containerHeight = scrollContainer.scrollHeight - window.innerHeight
      const scrollInContainer = window.scrollY - containerTop

      const t = Math.max(0, Math.min(1, scrollInContainer / containerHeight))
      const lat = SCROLL_LAT_RANGE.north + t * (SCROLL_LAT_RANGE.south - SCROLL_LAT_RANGE.north)

      setScrollLat(lat)
      setScrollProgress(t * 100)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleEpisodeClick = useCallback((eps: Episode[]) => {
    setSelectedEpisodes(eps)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedEpisodes([])
  }, [])

  return (
    <div id="scroll-driver" className="relative" style={{ height: '500vh' }}>
      {/* Fixed map background */}
      <div className="fixed inset-0 z-0">
        <MapWrapper
          episodes={episodes}
          onEpisodeClick={handleEpisodeClick}
          scrollLat={scrollLat}
        />
        {/* Atmospheric overlays */}
        <div className="fog-overlay" />
        <div className="vignette-overlay" />
      </div>

      {/* Vertical progress bar — right side */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-10 h-48 w-1 rounded-full bg-white/10">
        <div
          className="w-full rounded-full bg-gradient-to-b from-accent-red to-accent-gold transition-all duration-100"
          style={{ height: `${scrollProgress}%` }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-accent-red transition-all duration-100"
          style={{ top: `calc(${scrollProgress}% - 6px)` }}
        />
      </div>

      {/* Location labels along the scroll */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-10 h-48 flex flex-col justify-between pointer-events-none">
        <span className="text-[10px] text-white/30">Arica</span>
        <span className="text-[10px] text-white/30">Punta Arenas</span>
      </div>

      {/* Episode panel — left side */}
      <EpisodePanel
        episodes={selectedEpisodes}
        onClose={handleClosePanel}
        onContribute={() => setContributeOpen(true)}
      />

      {/* Legend — bottom right */}
      <div className="fixed bottom-6 right-6 z-10 flex flex-col gap-2 px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="w-3 h-3 rounded-full bg-accent-red" />
          Mea Culpa
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="w-3 h-3 rounded-full bg-accent-gold" />
          El Dia Menos Pensado
        </div>
        <div className="text-[10px] text-white/40">
          {episodes.length} ubicaciones
        </div>
      </div>

      {/* Suggest location button */}
      <button
        type="button"
        onClick={() => setContributeOpen(true)}
        className="fixed bottom-6 left-6 z-10 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-white/60 hover:text-white hover:border-white/30 transition-colors"
      >
        + Sugerir ubicacion
      </button>

      {/* Title overlay */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 px-5 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
        <h1 className="text-sm font-semibold text-white/80 font-[family-name:var(--font-source-serif)]">
          <span className="text-accent-red">Mea Culpa</span>
          {' & '}
          <span className="text-accent-gold">El Dia Menos Pensado</span>
        </h1>
      </div>

      {/* Contribute modal */}
      <ContributeModal
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
      />
    </div>
  )
}
