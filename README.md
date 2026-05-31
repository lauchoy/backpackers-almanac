# Backpacker's Almanac — Yosemite North Rim

Interactive trip companion for the Yosemite North Rim backpacking route (Upper Yosemite Falls → Yosemite Creek camp → Eagle Peak / North Dome day hikes).

**Stack:** React 19 + TypeScript + Vite + MapLibre GL JS + Protomaps + Tailwind CSS

## Features

- **3D terrain map** — interactive map with 3D relief, hillshade, route lines, and waypoint markers
- **Itinerary** — day-by-day trip plan with elevation profiles
- **Weather** — live forecast + historical "typical early June" climatology + wind compass
- **NPS alerts** — live Yosemite park alerts (proxied via serverless function)
- **Camp conditions** — derived synthesis of Open-Meteo + NWS + NPS for the Yosemite Creek camp coordinate
- **Packing list** — editable, persisted in IndexedDB (Dexie.js)
- **Offline-ready** — PWA with service worker caching

## Setup

```bash
npm install
```

### NPS API Key (required for park alerts)

1. Get a free API key from [nps.gov/subjects/developer](https://www.nps.gov/subjects/developer)
2. Set it as the `NPS_API_KEY` environment variable:
   ```bash
   export NPS_API_KEY=your_key_here
   ```
3. Or add it to your Vercel environment variables for production deployment

### Development

```bash
npm run dev
```

The Vite dev server proxies `/api/nps/*` to a local Hono server (`server/index.ts`).

### Production Build

```bash
npm run build
npm preview
```

### Deploy to Vercel

```bash
vercel --prod
```

Set `NPS_API_KEY` in your Vercel project environment variables.

## Data Sources & Attribution

- **Protomaps** basemap tiles © OpenStreetMap contributors
- **Terrarium DEM** tiles for 3D terrain
- **Open-Meteo** weather data (CC BY 4.0)
- **NWS** (National Weather Service) forecasts and alerts
- **NPS** (National Park Service) park alerts via the NPS API

## Trip Notes

- **Dates:** June 1–6, 2026
- **Route:** Yosemite Falls Trailhead → Yosemite Creek base camp → Eagle Peak / North Dome day hikes
- **Party:** 2 hikers
- All map coordinates and trail distances are **approximate** — drop GPX tracks in `src/data/routes/` for real geometry
