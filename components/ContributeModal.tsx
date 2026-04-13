'use client'

import { useState } from 'react'

interface ContributeModalProps {
  open: boolean
  onClose: () => void
}

export default function ContributeModal({ open, onClose }: ContributeModalProps) {
  const [form, setForm] = useState({
    showId: 'mea-culpa',
    title: '',
    address: '',
    lat: '',
    lng: '',
    youtubeUrl: '',
    summary: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  if (!open) return null

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setResult(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    const lat = parseFloat(form.lat)
    const lng = parseFloat(form.lng)
    if (isNaN(lat) || isNaN(lng)) {
      setResult('error')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: form.showId,
          title: form.title,
          lat,
          lng,
          address: form.address,
          youtubeUrl: form.youtubeUrl,
          summary: form.summary,
          email: form.email,
        }),
      })
      if (res.ok) {
        setResult('success')
        setForm({
          showId: 'mea-culpa',
          title: '',
          address: '',
          lat: '',
          lng: '',
          youtubeUrl: '',
          summary: '',
          email: '',
        })
      } else {
        setResult('error')
      }
    } catch {
      setResult('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111118] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-[family-name:var(--font-source-serif)]">
            Sugerir Ubicacion
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {result === 'success' ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-lg font-medium">Contribucion enviada</p>
            <p className="text-sm text-white/60 mt-2">
              Tu sugerencia sera revisada por un administrador.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-6 py-2 rounded-full bg-accent-red hover:bg-accent-red/80 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Serie</label>
              <select
                value={form.showId}
                onChange={(e) => updateField('showId', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50"
              >
                <option value="mea-culpa">Mea Culpa</option>
                <option value="el-dia-menos-pensado">El Dia Menos Pensado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Nombre del capitulo *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50"
                placeholder="Ej: El caso de la calle Maipu"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Direccion</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50"
                placeholder="Ej: Calle Maipu 450, Temuco"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Latitud *</label>
                <input
                  type="text"
                  required
                  value={form.lat}
                  onChange={(e) => updateField('lat', e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50"
                  placeholder="-33.4489"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Longitud *</label>
                <input
                  type="text"
                  required
                  value={form.lng}
                  onChange={(e) => updateField('lng', e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50"
                  placeholder="-70.6693"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Link de YouTube</label>
              <input
                type="url"
                value={form.youtubeUrl}
                onChange={(e) => updateField('youtubeUrl', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">
                Resumen breve ({form.summary.length}/300)
              </label>
              <textarea
                value={form.summary}
                onChange={(e) => updateField('summary', e.target.value.slice(0, 300))}
                rows={3}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50 resize-none"
                placeholder="Describe brevemente el caso..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Email (opcional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-accent-red/50"
                placeholder="tu@email.com"
              />
            </div>

            {result === 'error' && (
              <p className="text-sm text-accent-red">
                Error al enviar. Verifica los campos e intenta nuevamente.
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-accent-red hover:bg-accent-red/80 transition-colors font-medium disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar sugerencia'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
