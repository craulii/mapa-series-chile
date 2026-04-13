'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

interface Contribution {
  id: string
  show_id: string
  title: string
  lat: number
  lng: number
  address: string | null
  youtube_url: string | null
  summary: string | null
  email: string | null
  status: string
  created_at: string
}

export default function AdminPage() {
  const [supabase] = useState<SupabaseClient | null>(() => createBrowserClient())
  const [session, setSession] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session)
      setLoading(false)
    })
  }, [supabase])

  useEffect(() => {
    if (session && supabase) {
      fetchContributions()
    }
  }, [session, filter, supabase])

  async function fetchContributions() {
    if (!supabase) return
    const { data } = await supabase
      .from('contributions')
      .select('*')
      .eq('status', filter)
      .order('created_at', { ascending: false })
    if (data) setContributions(data)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setLoginError(error.message)
    } else {
      setSession(true)
    }
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    if (!supabase) return
    const { error } = await supabase
      .from('contributions')
      .update({ status })
      .eq('id', id)
    if (!error) {
      setContributions((prev) => prev.filter((c) => c.id !== id))
    }
  }

  async function handleLogout() {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    )
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/40 p-6 text-center">
        Supabase no esta configurado. Agrega las variables de entorno para habilitar el panel admin.
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center font-[family-name:var(--font-source-serif)]">
            Admin Panel
          </h1>
          <p className="text-sm text-center text-white/40">
            Mapa Series Chile
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent-red/50"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-accent-red/50"
          />
          {loginError && (
            <p className="text-sm text-accent-red">{loginError}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-accent-red hover:bg-accent-red/80 transition-colors font-medium"
          >
            Iniciar sesion
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-source-serif)]">
            Contribuciones
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Cerrar sesion
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                filter === status
                  ? 'bg-accent-red text-white'
                  : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobadas' : 'Rechazadas'}
            </button>
          ))}
        </div>

        {/* Contributions list */}
        {contributions.length === 0 ? (
          <p className="text-white/30 text-center py-12">
            No hay contribuciones {filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobadas' : 'rechazadas'}.
          </p>
        ) : (
          <div className="space-y-4">
            {contributions.map((c) => (
              <div
                key={c.id}
                className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                      {c.show_id === 'mea-culpa' ? 'Mea Culpa' : 'El Dia Menos Pensado'}
                    </span>
                    <h3 className="text-lg font-semibold mt-1">{c.title}</h3>
                  </div>
                  <span className="text-xs text-white/30">
                    {new Date(c.created_at).toLocaleDateString('es-CL')}
                  </span>
                </div>

                {c.address && (
                  <p className="text-sm text-white/60">📍 {c.address}</p>
                )}
                <p className="text-xs text-white/40">
                  Coords: {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                </p>
                {c.summary && (
                  <p className="text-sm text-white/70">{c.summary}</p>
                )}
                {c.youtube_url && (
                  <a
                    href={c.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-red hover:underline"
                  >
                    Ver video
                  </a>
                )}
                {c.email && (
                  <p className="text-xs text-white/30">Contacto: {c.email}</p>
                )}

                {filter === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(c.id, 'approved')}
                      className="px-5 py-2 rounded-full bg-green-600/80 hover:bg-green-600 text-sm transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(c.id, 'rejected')}
                      className="px-5 py-2 rounded-full bg-red-600/30 hover:bg-red-600/60 text-sm transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
