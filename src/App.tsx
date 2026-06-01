// App root — Mobile-first map-centric layout
// Full-height map + floating bottom sheet for data panels

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
import OfflineBanner from './components/OfflineBanner';
import { downloadTripBrief } from './lib/exportHtml';
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
  const [selectedDay, setSelectedDay] = useState<TripDay>(TRIP_DAYS[1]);
  const [activePanel, setActivePanel] = useState<Panel>('weather');
  const [sheetOpen, setSheetOpen] = useState(false);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries();
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(async () => {
    const { getAllItems } = await import('./store/packingDb');
    const packingItems = await getAllItems();
    downloadTripBrief({ packingItems });
  }, []);

  const handleSyncNotion = useCallback(async () => {
    try {
      await fetch('/api/sync-notion', { method: 'POST' });
    } catch {}
  }, []);

  const [syncing, setSyncing] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-dvh w-full bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden print:h-auto print:overflow-visible print:bg-white print:text-black">
        <OfflineBanner />

        {/* Map — full viewport, the hero */}
        <div className="flex-1 relative min-h-0">
          <MapView selectedDay={selectedDay} mapRef={mapRef} />

          {/* Transparent header overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
            <div className="pointer-events-auto bg-gradient-to-b from-slate-950/80 to-transparent px-3 pt-2 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-slate-100">
                    {TRIP_META.name}
                  </h1>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    {TRIP_META.dates}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleRefresh} className="text-[10px] text-amber-400 bg-slate-950/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-amber-400/30 active:bg-amber-500/20" title="Refresh">↻</button>
                  <button onClick={() => { setSyncing(true); handleSyncNotion().finally(() => setSyncing(false)); }} className={`text-[10px] bg-slate-950/60 backdrop-blur-sm px-2 py-1 rounded-lg border active:bg-amber-500/20 ${syncing ? 'text-amber-400 border-amber-400/60 animate-pulse' : 'text-slate-400 border-slate-600/30'}`} title="Sync to Notion">⟳</button>
                  <button onClick={handleDownload} className="text-[10px] text-amber-400 bg-slate-950/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-amber-400/30 active:bg-amber-500/20 print:hidden" title="Download">↓</button>
                  <button onClick={handlePrint} className="text-[10px] text-slate-400 bg-slate-950/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-600/30 active:bg-slate-700/50 print:hidden" title="Print">⎙</button>
                </div>
              </div>
            </div>
          </div>

          {/* Day selector — floating at bottom of map */}
          <div className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ${sheetOpen ? 'translate-y-full opacity-0' : ''}`}>
            <DayPanel selectedDay={selectedDay} onSelect={setSelectedDay} />
          </div>

          {/* Sheet pull tab — above day selector */}
          {!sheetOpen && (
            <button
              onClick={() => setSheetOpen(true)}
              className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-t-xl px-6 py-1.5 text-[10px] text-slate-400 active:text-slate-200 transition-colors"
            >
              <div className="w-8 h-0.5 bg-slate-600 rounded-full mx-auto mb-1" />
              Data
            </button>
          )}
        </div>

        {/* Bottom sheet — slides up over map */}
        <div className={`flex-shrink-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 transition-all duration-300 ease-out flex flex-col print:flex-shrink print:max-h-none print:overflow-visible ${sheetOpen ? 'max-h-[55vh]' : 'max-h-0 border-t-0'}`}>
          {/* Sheet header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/30">
            <div className="flex gap-2">
              {([
                ['weather', 'Weather'],
                ['info', 'Info'],
                ['packing', 'Pack'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActivePanel(key)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                    activePanel === key
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSheetOpen(false)}
              className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-0.5"
            >
              ✕
            </button>
          </div>

          {/* Sheet content — scrollable */}
          <div className="overflow-y-auto flex-1">
            {/* Elevation profile always visible */}
            <ElevationProfile day={selectedDay} />

            {/* Camp conditions + Wind always visible */}
            <CampConditions />
            <WindDial />

            {/* Tabbed panel content */}
            {activePanel === 'weather' && <WeatherCard onRefresh={handleRefresh} />}
            {activePanel === 'info' && <InfoCenter />}
            {activePanel === 'packing' && <PackingList />}
          </div>
        </div>

        {/* Attribution — tiny footer */}
        {!sheetOpen && (
          <div className="absolute bottom-[92px] right-1 z-10 text-[7px] text-slate-600/70 pointer-events-none">
            Protomaps © OSM · Open-Meteo · NWS · NPS
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
