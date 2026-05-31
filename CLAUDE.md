# CLAUDE.md — Backpacker's Almanac

## What we're building
A local-first React app: interactive 3D-terrain map of a 4-day Yosemite North Rim
backpacking itinerary, with weather (live + historical + wind), an editable packing
list, and an information center. See BUILD-SPEC.md for full detail.

## Stack (PINNED — do not substitute without asking)
Vite + React 19 + TypeScript + Tailwind 4. Map: MapLibre GL JS 5.x + Protomaps PMTiles
(@protomaps/basemaps) + Terrarium raster-dem terrain + maplibre-contour. Routes:
@tmcw/togeojson. Charts: Recharts. Data: TanStack Query 5. Persistence: Dexie
(IndexedDB). NPS proxy: Hono.

## HARD RULES (anti-hallucination)
1. Use ONLY the endpoints/params in BUILD-SPEC.md §3. If a datum isn't there, render
   "data not available" — NEVER invent an endpoint, param, or response field.
2. There is NO API for wilderness-campsite conditions. The "Yosemite Creek camp" panel
   is DERIVED from Open-Meteo (weather/wind at the camp coordinate) + NWS (zone
   forecast/alerts) + NPS park-wide `yose` alerts. Label it "derived for camp
   coordinate" with timestamps + attribution. The developed "Yosemite Creek Campground"
   (Tioga Rd) is a DIFFERENT place — never conflate them.
3. No API keys in client code. Only NPS needs a key; it lives in server/.env and is
   injected by the Hono proxy. Open-Meteo and NWS need NO key.
4. NWS requires a User-Agent header on every request.
5. Treat itinerary mileages as approximate and ANCHOR coords as approximate; prefer
   GPX geometry. Surface the North-Dome-distance uncertainty in the UI.
6. Every data panel: loading / empty / error / stale states. No silent failures.
7. No localStorage/sessionStorage for large state — use Dexie. (Small UI prefs in
   localStorage are fine.)

## Workflow
- Propose a short plan before large changes; wait for ok on anything touching the
  proxy, data contracts, or the camp-conditions logic.
- Keep modules small and typed. Commit per prompt-milestone.
- After each module: list what was built, what's stubbed, and how to verify.

## Attribution required in-app
Protomaps © OpenStreetMap; weather by Open-Meteo (CC BY 4.0) & NWS; park data via NPS API.
