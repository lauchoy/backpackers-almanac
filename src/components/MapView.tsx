// Interactive map with terrain, routes, markers — BUILD-SPEC §4

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap, getRouteColor } from '../lib/map';
import { TRIP_DAYS, ANCHORS, TRIP_CENTER, TRIP_ZOOM } from '../data/itinerary';
import type { TripDay } from '../data/itinerary';

interface MapViewProps {
  selectedDay: TripDay | null;
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
}

export default function MapView({ selectedDay, mapRef }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = createMap(containerRef.current, TRIP_CENTER, TRIP_ZOOM);
    mapRef.current = map;

    map.on('load', () => {
      // Add route lines for each day
      TRIP_DAYS.filter((d) => d.anchors.length >= 2).forEach((day) => {
        const color = getRouteColor(day.num);

        // Build approximate line from anchors (GPX overrides would happen here)
        const coords: [number, number][] = day.anchors.map((a) => [a.lon, a.lat]);

        map.addSource(`route-source-${day.num}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { day: day.num, label: day.label },
            geometry: {
              type: 'LineString',
              coordinates: coords,
            },
          },
        });

        map.addLayer({
          id: `route-glow-${day.num}`,
          type: 'line',
          source: `route-source-${day.num}`,
          paint: {
            'line-color': color,
            'line-width': 6,
            'line-opacity': 0.15,
            'line-blur': 4,
          },
        });

        map.addLayer({
          id: `route-${day.num}`,
          type: 'line',
          source: `route-source-${day.num}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': 2.5,
            'line-opacity': 0.9,
            'line-dasharray': ['step', ['get', 'day'], ['literal', []], 3, ['literal', [3, 2]]],
          },
        });
      });

      // Add markers
      const markerEl = document.createElement('div');
      markerEl.className = 'w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-500/80 shadow-lg shadow-amber-500/40';
      markerEl.style.cssText = markerEl.className;

      // Camp marker
      new maplibregl.Marker({ color: '#22c55e' })
        .setLngLat([ANCHORS.yosemiteCreekCamp.lon, ANCHORS.yosemiteCreekCamp.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setText('⛺ Yosemite Creek camp'))
        .addTo(map);

      // Summit markers
      [
        { a: ANCHORS.eaglePeak, emoji: '🦅' },
        { a: ANCHORS.northDome, emoji: '🏔️' },
        { a: ANCHORS.indianRockArch, emoji: '🪨' },
      ].forEach(({ a, emoji }) => {
        new maplibregl.Marker({ color: '#f59e0b' })
          .setLngLat([a.lon, a.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setText(`${emoji} ${a.label} — ${a.ele_ft} ft`))
          .addTo(map);
      });

      // Trailhead marker
      new maplibregl.Marker({ color: '#3b82f6' })
        .setLngLat([ANCHORS.upperFallsTrailhead.lon, ANCHORS.upperFallsTrailhead.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setText(`🥾 ${ANCHORS.upperFallsTrailhead.label}`))
        .addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fly to selected day
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDay || selectedDay.anchors.length === 0) return;

    const lngs = selectedDay.anchors.map((a) => a.lon);
    const lats = selectedDay.anchors.map((a) => a.lat);
    const bounds = new maplibregl.LngLatBounds(
      [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
      [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
    );

    map.fitBounds(bounds, { padding: 100, duration: 1500, maxZoom: 14 });

    // Highlight active route, dim others
    TRIP_DAYS.forEach((d) => {
      const layer = map.getLayer(`route-${d.num}`);
      if (layer) {
        map.setPaintProperty(`route-${d.num}`, 'line-opacity', d.num === selectedDay.num ? 1 : 0.25);
        map.setPaintProperty(`route-${d.num}`, 'line-width', d.num === selectedDay.num ? 3.5 : 1.5);
      }
    });
  }, [selectedDay]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'manipulation' }}
    />
  );
}
