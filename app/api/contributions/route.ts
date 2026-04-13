import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 5
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

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

function isValidYouTubeUrl(url: string): boolean {
  if (!url) return true // optional field
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/.test(url)
}

export async function GET() {
  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json([])
  }

  const { data, error } = await supabase
    .from('contributions')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json([])
  }

  return NextResponse.json(data)
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

  let body: {
    showId?: string
    title?: string
    lat?: number
    lng?: number
    address?: string
    youtubeUrl?: string
    summary?: string
    email?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { showId, title, lat, lng, address, youtubeUrl, summary, email } = body

  if (!showId || !title || lat == null || lng == null) {
    return NextResponse.json(
      { error: 'showId, title, lat, and lng are required' },
      { status: 400 }
    )
  }

  if (!['mea-culpa', 'el-dia-menos-pensado'].includes(showId)) {
    return NextResponse.json({ error: 'Invalid showId' }, { status: 400 })
  }

  if (typeof lat !== 'number' || typeof lng !== 'number' || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  if (youtubeUrl && !isValidYouTubeUrl(youtubeUrl)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  if (summary && summary.length > 300) {
    return NextResponse.json({ error: 'Summary too long (max 300 chars)' }, { status: 400 })
  }

  const { error } = await supabase.from('contributions').insert({
    show_id: showId,
    title,
    lat,
    lng,
    address: address || null,
    youtube_url: youtubeUrl || null,
    summary: summary || null,
    email: email || null,
    status: 'pending',
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to save contribution' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
