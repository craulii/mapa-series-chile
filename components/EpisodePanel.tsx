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
  episode: EpisodeData | null
  onContribute: () => void
}

export default function EpisodePanel({ episode, onContribute }: EpisodePanelProps) {
  const [visible, setVisible] = useState(false)
  const [displayEpisode, setDisplayEpisode] = useState<EpisodeData | null>(null)

  useEffect(() => {
    if (episode) {
      setVisible(false)
      const timer = setTimeout(() => {
        setDisplayEpisode(episode)
        setVisible(true)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      const timer = setTimeout(() => setDisplayEpisode(null), 300)
      return () => clearTimeout(timer)
    }
  }, [episode?.id])

  if (!displayEpisode) return null

  const badgeColor =
    displayEpisode.show === 'mea-culpa'
      ? 'bg-accent-red/80 text-white'
      : 'bg-accent-gold/80 text-white'

  return (
    <>
      {/* Desktop panel */}
      <div
        className={`
          hidden lg:block fixed top-0 right-0 w-[420px] h-full z-20
          overflow-y-auto transition-all duration-500
          ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
        `}
      >
        <div className="h-full bg-black/75 backdrop-blur-xl border-l border-white/5">
          <div className="p-6 pt-8 space-y-5">
            <PanelContent
              episode={displayEpisode}
              badgeColor={badgeColor}
              onContribute={onContribute}
            />
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <MobileSheet
        episode={displayEpisode}
        badgeColor={badgeColor}
        visible={visible}
        onContribute={onContribute}
      />
    </>
  )
}

function PanelContent({
  episode,
  badgeColor,
  onContribute,
}: {
  episode: EpisodeData
  badgeColor: string
  onContribute: () => void
}) {
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

function MobileSheet({
  episode,
  badgeColor,
  visible,
  onContribute,
}: {
  episode: EpisodeData
  badgeColor: string
  visible: boolean
  onContribute: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setExpanded(false)
  }, [episode.id])

  return (
    <div
      className={`
        lg:hidden fixed bottom-0 left-0 right-0 z-20
        transition-all duration-500 ease-out
        ${visible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div
        className={`
          bg-black/85 backdrop-blur-xl border-t border-white/10 rounded-t-2xl
          transition-all duration-300
          ${expanded ? 'max-h-[75vh]' : 'max-h-[140px]'}
          overflow-hidden
        `}
      >
        {/* Drag handle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full pt-3 pb-2 flex justify-center cursor-pointer"
          aria-label={expanded ? 'Contraer panel' : 'Expandir panel'}
        >
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </button>

        {/* Collapsed preview */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeColor}`}>
              {episode.showName}
            </span>
            <span className="text-xs text-white/40">{episode.city}</span>
          </div>
          <h3 className="text-lg font-bold font-[family-name:var(--font-source-serif)] truncate">
            {episode.title}
          </h3>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="px-4 pb-6 space-y-4 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
            <YouTubePreview url={episode.youtubeUrl} title={episode.title} />
            <div className="text-sm text-white/80">{episode.address}</div>
            <p className="text-sm text-white/70">{episode.summary}</p>
            <StarRating episodeId={episode.id} />
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
