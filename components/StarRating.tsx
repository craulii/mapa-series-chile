'use client'

import { useState, useEffect } from 'react'

interface StarRatingProps {
  episodeId: string
}

interface RatingData {
  average: number
  count: number
  userRating: number | null
}

export default function StarRating({ episodeId }: StarRatingProps) {
  const [rating, setRating] = useState<RatingData>({ average: 0, count: 0, userRating: null })
  const [hovered, setHovered] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [voted, setVoted] = useState(false)

  useEffect(() => {
    setVoted(false)
    fetchRating()
  }, [episodeId])

  async function fetchRating() {
    try {
      const res = await fetch(`/api/ratings?episodeId=${episodeId}`)
      if (res.ok) {
        const data = await res.json()
        setRating(data)
        if (data.userRating) setVoted(true)
      }
    } catch {
      // Supabase unavailable — ratings disabled
    }
  }

  async function submitRating(value: number) {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId, rating: value }),
      })
      if (res.ok) {
        const data = await res.json()
        setRating(data)
        setVoted(true)
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false)
    }
  }

  const displayValue = hovered || rating.userRating || 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            className="text-2xl transition-transform duration-150 hover:scale-110 disabled:opacity-50"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => submitRating(star)}
            aria-label={`Calificar ${star} estrella${star > 1 ? 's' : ''}`}
          >
            <span
              className={
                star <= displayValue
                  ? 'text-accent-gold'
                  : star <= Math.round(rating.average)
                    ? 'text-accent-gold/50'
                    : 'text-white/20'
              }
            >
              ★
            </span>
          </button>
        ))}
      </div>
      <div className="text-sm text-white/60">
        {rating.count > 0 ? (
          <>
            <span className="font-medium text-white/80">{rating.average.toFixed(1)}</span>
            {' '}({rating.count} voto{rating.count !== 1 ? 's' : ''})
          </>
        ) : (
          <span>Sin votos</span>
        )}
      </div>
      {voted && (
        <span className="text-xs text-accent-gold/80 animate-[fadeIn_0.3s_ease]">
          ✓ Votado
        </span>
      )}
    </div>
  )
}
