# Mapa Series Chile

Aplicacion web interactiva tipo "scrollytelling map" que muestra en un mapa 3D de Chile las ubicaciones reales donde ocurrieron los capitulos de **Mea Culpa** y **El Dia Menos Pensado**.

El usuario scrollea por la pagina y el mapa vuela de norte a sur por Chile, mostrando cada ubicacion con informacion del capitulo, video de YouTube, y sistema de ratings.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Mapbox GL JS** — mapa 3D con proyeccion de globo y terreno
- **Supabase** — base de datos (ratings, contribuciones, auth admin)
- **Tailwind CSS 4** — estilos
- **Vercel** — deployment

## Requisitos

- Node.js 20+
- Cuenta de [Mapbox](https://account.mapbox.com/) (token publico)
- Cuenta de [Supabase](https://supabase.com/) (proyecto con las tablas creadas)

## Setup

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd mapa-series-chile
npm install
```

### 2. Configurar Mapbox

1. Ve a https://account.mapbox.com/access-tokens/
2. Copia tu token publico (empieza con `pk.`)
3. No se necesitan scopes especiales — el token default funciona para terrain y globe

### 3. Configurar Supabase

1. Crea un proyecto en https://supabase.com/dashboard
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ve a **Settings > API** y copia:
   - Project URL
   - `anon` public key
   - `service_role` key (seccion "Service Role")
4. Ve a **Authentication > Users > Add User** para crear el usuario admin

### 4. Variables de entorno

Crea `.env.local` en la raiz:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.tu_token_aqui
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 5. Ejecutar

```bash
npm run dev
```

Abre http://localhost:3000

## Agregar nuevos episodios

Edita `data/episodes.json` y agrega un objeto con esta estructura:

```json
{
  "id": "mc-ciudad-01",
  "show": "mea-culpa",
  "showName": "Mea Culpa",
  "title": "Titulo del Capitulo",
  "season": 1,
  "episode": 1,
  "city": "Ciudad",
  "region": "Region",
  "address": "Direccion exacta",
  "lat": -33.4489,
  "lng": -70.6693,
  "summary": "Resumen del caso en 2-3 lineas.",
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "coverImage": "/covers/mc-ciudad-01.jpg",
  "mapView": {
    "center": [-70.6693, -33.4489],
    "zoom": 15,
    "bearing": 0,
    "pitch": 60
  }
}
```

Los episodios se ordenan automaticamente de norte a sur (por latitud).

**Nota:** `center` usa formato `[longitud, latitud]` (convencion Mapbox).

## Deploy en Vercel

```bash
# Login y linkear proyecto
vercel link

# Agregar variables de entorno
vercel env add NEXT_PUBLIC_MAPBOX_TOKEN production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Deploy
vercel --prod
```

Despues de conectar con GitHub, cada `git push` hace auto-deploy.

## Estructura del proyecto

```
app/
  page.tsx                    Pagina principal (hero + scrollytelling)
  admin/page.tsx              Panel admin (login + aprobar contribuciones)
  api/ratings/route.ts        API de ratings (GET/POST)
  api/contributions/route.ts  API de contribuciones (GET/POST)
  layout.tsx                  Layout con fonts y metadata
  globals.css                 Tailwind 4 theme + estilos globales

components/
  ScrollytellingApp.tsx       Orchestrador (IntersectionObserver + estado)
  Map.tsx                     Wrapper con dynamic import (ssr: false)
  MapInner.tsx                Mapbox GL JS (globe, terrain, markers, flyTo)
  EpisodePanel.tsx            Panel lateral / bottom sheet
  StarRating.tsx              Rating 1-5 estrellas
  YouTubePreview.tsx          Preview de YouTube (thumbnail + iframe lazy)
  ContributeModal.tsx         Modal para sugerir ubicaciones

data/
  episodes.json               Datos estaticos de episodios

lib/
  supabase.ts                 Clientes Supabase (browser + server)
  mapbox.ts                   Config del mapa (fog, terrain, estilos)

supabase/
  migrations/                 SQL schema (ratings, contributions, RLS)
```

## Funciona sin Supabase

El mapa y los episodios del JSON se muestran siempre. Solo los ratings y las contribuciones comunitarias requieren Supabase configurado. Si las variables de entorno no estan, esas funciones se deshabilitan silenciosamente.
