@AGENTS.md

# Mapa Series Chile

## Proyecto
App web interactiva que muestra en un mapa 3D de Chile las ubicaciones de las series Mea Culpa y El Dia Menos Pensado. El scroll vertical de la pagina mueve el mapa de norte a sur.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Mapbox GL JS — mapa con proyeccion globe, terrain 3D, clustering nativo
- Supabase — ratings, contribuciones comunitarias, auth admin
- Tailwind CSS 4 — configuracion via @theme en globals.css (NO tailwind.config.js)
- Vercel — auto-deploy en push a master

## Arquitectura clave
- `components/MapInner.tsx` — importado con `next/dynamic` + `ssr: false` (mapbox-gl no puede correr en SSR)
- `lib/supabase.ts` — dos clientes: browser (anon key) y server (service role key). Retorna null si no hay env vars
- `data/episodes.json` — fuente principal de datos. mapView.center usa formato [lng, lat] (convencion Mapbox)
- El mapa funciona sin Supabase (graceful degradation)

## Convenciones
- Dark mode por defecto, sin toggle
- Colores accent: rojo (#dc2626) para Mea Culpa, dorado (#d97706) para El Dia Menos Pensado
- Fonts: Inter (sans) + Source Serif 4 (titulos)
- Componentes interactivos llevan "use client"
- API routes usan rate limiting in-memory (10 req/min/IP)

## Servicios
- GitHub: github.com/craulii/mapa-series-chile
- Vercel: mapa-series-chile.vercel.app
- Supabase project ref: hbmqyyoiqbkalqdmpunj

## Comandos
- `npm run dev` — desarrollo local
- `npm run build` — verificar build
- `git push` — trigger auto-deploy en Vercel
