'use client'

import dynamic from 'next/dynamic'
import { forwardRef } from 'react'
import type { MapHandle, Episode } from './MapInner'

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
  activeEpisodeId: string | null
  ref?: React.Ref<MapHandle>
}

const MapWrapper = forwardRef<MapHandle, Omit<MapProps, 'ref'>>(function MapWrapper(props, ref) {
  return <MapInner ref={ref} {...props} />
})

export default MapWrapper
export type { MapHandle, Episode }
