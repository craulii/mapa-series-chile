'use client'

import dynamic from 'next/dynamic'
import type { Episode } from './MapInner'

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
        <p className="text-white/40 text-sm">Cargando mapa...</p>
      </div>
    </div>
  )
}

interface MapProps {
  episodes: Episode[]
  onEpisodeClick: (episodes: Episode[]) => void
  scrollLat: number
}

export default function MapWrapper(props: MapProps) {
  return <MapInner {...props} />
}

export type { Episode }
