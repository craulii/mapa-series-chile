import rawEpisodes from '@/data/episodes.json'
import ScrollytellingApp from '@/components/ScrollytellingApp'

const episodes = rawEpisodes.map((ep) => ({
  ...ep,
  mapView: {
    ...ep.mapView,
    center: ep.mapView.center as [number, number],
  },
}))

export default function Home() {
  return (
    <main>
      {/* Hero landing */}
      <section className="relative z-20 min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent">
        <div className="max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-12 bg-accent-red/50" />
            <span className="text-xs tracking-[0.3em] uppercase text-accent-red/80 font-medium">
              Series Chilenas
            </span>
            <span className="h-px w-12 bg-accent-red/50" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 font-[family-name:var(--font-source-serif)]">
            Mapa de{' '}
            <span className="text-accent-red">Mea Culpa</span>
            {' & '}
            <span className="text-accent-gold">El Dia Menos Pensado</span>
          </h1>

          <p className="text-lg text-white/60 mb-10 max-w-lg mx-auto leading-relaxed">
            Recorre Chile de norte a sur explorando las ubicaciones reales donde
            ocurrieron los casos mas emblematicos de la television chilena.
          </p>

          <a
            href="#map-start"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent-red hover:bg-accent-red/80 transition-all duration-300 font-medium text-white hover:scale-105"
          >
            Explorar el mapa
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-white/30">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent-red/70" />
              Mea Culpa
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent-gold/70" />
              El Dia Menos Pensado
            </div>
            <div>
              {episodes.length} ubicaciones
            </div>
          </div>
        </div>
      </section>

      {/* Map scrollytelling */}
      <div id="map-start">
        <ScrollytellingApp episodes={episodes} />
      </div>
    </main>
  )
}
