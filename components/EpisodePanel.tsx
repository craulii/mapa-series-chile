'use client'

import { useState, useEffect } from 'react'
import StarRating from './StarRating'
import YouTubePreview from './YouTubePreview'

interface EpisodeData {
  id: string
  show: string
  showName: string
  title: string
  season: number
  episode: number
  city: string
  region: string
  address: string
  summary: string
  youtubeUrl: string
  coverImage: string
}

interface EpisodePanelProps {
  episodes: EpisodeData[]
  onClose: () => void
  onContribute: () => void
}

export default function EpisodePanel({ episodes, onClose, onContribute }: EpisodePanelProps) {
  const visible = episodes.length > 0

  return (
    <>
      {/* Desktop panel — left side */}
      <div
        className={`
          hidden lg:block fixed top-0 left-0 w-[420px] h-full z-20
          transition-all duration-400
          ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}
        `}
      >
        <div className="h-full bg-black/80 backdrop-blur-xl border-r border-white/5 overflow-y-auto">
          <div className="relative p-6 pt-8 space-y-5">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              aria-label="Cerrar"
            >
              ✕
            </button>

            {episodes.length === 1 ? (
              <SingleEpisode episode={episodes[0]} onContribute={onContribute} />
            ) : (
              <ClusterList episodes={episodes} onContribute={onContribute} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <MobileSheet
        episodes={episodes}
        visible={visible}
        onClose={onClose}
        onContribute={onContribute}
      />
    </>
  )
}

function SingleEpisode({ episode, onContribute }: { episode: EpisodeData; onContribute: () => void }) {
  const badgeColor =
    episode.show === 'mea-culpa' ? 'bg-accent-red/80 text-white' : 'bg-accent-gold/80 text-white'

  return (
    <>
      <div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          {episode.showName}
        </span>
        <span className="ml-2 text-xs text-white/40">
          T{episode.season} E{episode.episode}
        </span>
      </div>

      <h2 className="text-2xl font-bold leading-tight font-[family-name:var(--font-source-serif)]">
        {episode.title}
      </h2>

      <YouTubePreview url={episode.youtubeUrl} title={episode.title} />

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/40">📍</span>
          <span className="text-white/80">{episode.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/40">🗺️</span>
          <span className="text-white/60">{episode.city}, {episode.region}</span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-white/70">{episode.summary}</p>

      <StarRating episodeId={episode.id} />

      <button
        type="button"
        onClick={onContribute}
        className="w-full py-2.5 rounded-full border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
      >
        + Sugerir ubicacion
      </button>
    </>
  )
}

function ClusterList({ episodes, onContribute }: { episodes: EpisodeData[]; onContribute: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setExpandedId(null)
  }, [episodes])

  return (
    <>
      <h2 className="text-xl font-bold font-[family-name:var(--font-source-serif)]">
        {episodes.length} capitulos en esta zona
      </h2>

      <div className="space-y-3">
        {episodes.map((ep) => {
          const isExpanded = expandedId === ep.id
          const badgeColor =
            ep.show === 'mea-culpa' ? 'bg-accent-red/80 text-white' : 'bg-accent-gold/80 text-white'

          return (
            <div key={ep.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : ep.id)}
                className="w-full p-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeColor}`}>
                    {ep.showName}
                  </span>
                  <span className="text-xs text-white/40">T{ep.season} E{ep.episode}</span>
                </div>
                <h3 className="font-bold text-sm">{ep.title}</h3>
                <p className="text-xs text-white/50">{ep.city}, {ep.region}</p>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  <YouTubePreview url={ep.youtubeUrl} title={ep.title} />
                  <p className="text-xs text-white/60">📍 {ep.address}</p>
                  <p className="text-sm text-white/70">{ep.summary}</p>
                  <StarRating episodeId={ep.id} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onContribute}
        className="w-full py-2.5 rounded-full border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors"
      >
        + Sugerir ubicacion
      </button>
    </>
  )
}

function MobileSheet({
  episodes,
  visible,
  onClose,
  onContribute,
}: {
  episodes: EpisodeData[]
  visible: boolean
  onClose: () => void
  onContribute: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [episodes])

  if (!visible) return null

  const first = episodes[0]
  const isCluster = episodes.length > 1

  return (
    <div
      className={`
        lg:hidden fixed bottom-0 left-0 right-0 z-20
        transition-transform duration-400 ease-out
        ${visible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div
        className={`
          bg-black/90 backdrop-blur-xl border-t border-white/10 rounded-t-2xl
          transition-all duration-300
          ${expanded ? 'max-h-[80vh]' : 'max-h-[140px]'}
          overflow-hidden
        `}
      >
        {/* Drag handle + close */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex justify-center cursor-pointer"
            aria-label={expanded ? 'Contraer' : 'Expandir'}
          >
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Collapsed preview */}
        <div className="px-4 pb-3">
          {isCluster ? (
            <h3 className="text-lg font-bold font-[family-name:var(--font-source-serif)]">
              {episodes.length} capitulos en esta zona
            </h3>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  first.show === 'mea-culpa' ? 'bg-accent-red/80' : 'bg-accent-gold/80'
                } text-white`}>
                  {first.showName}
                </span>
                <span className="text-xs text-white/40">{first.city}</span>
              </div>
              <h3 className="text-lg font-bold font-[family-name:var(--font-source-serif)] truncate">
                {first.title}
              </h3>
            </>
          )}
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-6 space-y-4 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
            {episodes.length === 1 ? (
              <>
                <YouTubePreview url={first.youtubeUrl} title={first.title} />
                <div className="text-sm text-white/80">📍 {first.address}</div>
                <p className="text-sm text-white/70">{first.summary}</p>
                <StarRating episodeId={first.id} />
              </>
            ) : (
              <ClusterList episodes={episodes} onContribute={onContribute} />
            )}
            <button
              type="button"
              onClick={onContribute}
              className="w-full py-2 rounded-full border border-white/10 text-sm text-white/60 hover:text-white transition-colors"
            >
              + Sugerir ubicacion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
