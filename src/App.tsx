// App root — BUILD-SPEC §4, §6
// Mobile-first topographic field instrument

import { useState, useRef, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import maplibregl from 'maplibre-gl';
import MapView from './components/MapView';
import DayPanel from './components/DayPanel';
import ElevationProfile from './components/ElevationProfile';
import WeatherCard from './components/WeatherCard';
import WindDial from './components/WindDial';
import InfoCenter from './components/InfoCenter';
import CampConditions from './components/CampConditions';
import PackingList from './components/PackingList';
import { TRIP_DAYS, TRIP_META } from './data/itinerary';
import type { TripDay } from './data/itinerary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

type Panel = 'weather' | 'info' | 'packing';

function App() {
  const [selectedDay, setSelectedDay] = useState<TripDay>(TRIP_DAYS[1]); // Day 1 default
  const [activePanel, setActivePanel] = useState<Panel>('weather');
  const mapRef = useRef<maplibregl.Map | null>(null);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-dvh w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {/* Top Bar */}
        <header className="flex-shrink-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-3 py-2 flex items-center justify-between z-10">
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">
              {TRIP_META.name}
            </h1>
            <p className="text-[9px] text-slate-500 leading-tight">
              {TRIP_META.dates} · {TRIP_META.model}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors px-3 py-1 rounded-lg border border-amber-400/30 hover:border-amber-400/60"
          >
            ↻ Refresh
          </button>
        </header>

        {/* Map */}
        <div className="flex-1 relative min-h-0">
          <MapView selectedDay={selectedDay} mapRef={mapRef} />

          {/* Day selector overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <DayPanel selectedDay={selectedDay} onSelect={setSelectedDay} />
          </div>
        </div>

        {/* Elevation profile */}
        <ElevationProfile day={selectedDay} />

        {/* Data panels — tabbed */}
        <div className="flex-shrink-0">
          <CampConditions />
          <WindDial />

          {/* Tab bar */}
          <div className="flex bg-slate-900/95 border-b border-slate-700/50">
            {([
              ['weather', 'Weather'],
              ['info', 'Info Center'],
              ['packing', 'Pack List'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActivePanel(key)}
                className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${
                  activePanel === key
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-shrink-0 max-h-[45vh] overflow-y-auto">
            {activePanel === 'weather' && <WeatherCard onRefresh={handleRefresh} />}
            {activePanel === 'info' && <InfoCenter />}
            {activePanel === 'packing' && <PackingList />}
          </div>
        </div>

        {/* Attribution bar */}
        <footer className="flex-shrink-0 bg-slate-900/95 border-t border-slate-700/50 px-3 py-1 flex items-center justify-between text-[8px] text-slate-600">
          <span>Protomaps © OSM · Open-Meteo CC BY 4.0 · NWS · NPS</span>
          <span>map data approximate — drop GPX</span>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
