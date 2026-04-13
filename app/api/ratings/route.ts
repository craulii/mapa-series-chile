import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW)
  rateLimitMap.set(ip, recent)
  if (recent.length >= RATE_LIMIT) return true
  recent.push(now)
  return false
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + '_mapa_series_salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

export async function GET(req: NextRequest) {
  const episodeId = req.nextUrl.searchParams.get('episodeId')
  if (!episodeId) {
    return NextResponse.json({ error: 'episodeId required' }, { status: 400 })
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ average: 0, count: 0, userRating: null })
  }

  const ip = getClientIP(req)
  const ipHash = await hashIP(ip)

  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating, ip_hash')
    .eq('episode_id', episodeId)

  if (!ratings || ratings.length === 0) {
    return NextResponse.json({ average: 0, count: 0, userRating: null })
  }

  const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
  const average = sum / ratings.length
  const userRow = ratings.find((r) => r.ip_hash === ipHash)

  return NextResponse.json({
    average: Math.round(average * 10) / 10,
    count: ratings.length,
    userRating: userRow?.rating || null,
  })
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  let body: { episodeId?: string; rating?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { episodeId, rating } = body
  if (!episodeId || !rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return NextResponse.json({ error: 'Invalid episodeId or rating (1-5)' }, { status: 400 })
  }

  const ipHash = await hashIP(ip)

  const { error } = await supabase
    .from('ratings')
    .upsert(
      { episode_id: episodeId, rating, ip_hash: ipHash },
      { onConflict: 'episode_id,ip_hash' }
    )

  if (error) {
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }

  // Return updated average
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('episode_id', episodeId)

  const sum = ratings?.reduce((acc, r) => acc + r.rating, 0) || 0
  const count = ratings?.length || 0
  const average = count > 0 ? sum / count : 0

  return NextResponse.json({
    average: Math.round(average * 10) / 10,
    count,
    userRating: rating,
  })
}
