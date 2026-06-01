// Apple-style PWA root — fixed-viewport map app
// Map is the surface. Everything else is a glass overlay.
// No body scroll. iOS sheet for data panels.

import { useState, useRef, useCallback, useEffect } from 'react';
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
type SheetState = 'closed' | 'peek' | 'half';

function App() {
  const [selectedDay, setSelectedDay] = useState<TripDay>(TRIP_DAYS[1]);
  const [activePanel, setActivePanel] = useState<Panel>('weather');
  const [sheet, setSheet] = useState<SheetState>('peek');
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Disable map interaction when sheet is expanded beyond peek
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (sheet === 'half') {
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.touchZoomRotate.disable();
    } else {
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.touchZoomRotate.enable();
    }
  }, [sheet]);

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

  const toggleSheet = () => {
    setSheet((s) => (s === 'half' ? 'peek' : 'half'));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-dvh w-full bg-black text-white overflow-hidden font-sans"
        style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
      >
        <OfflineBanner />

        {/* Map — full-surface background */}
        <div className="absolute inset-0">
          <MapView selectedDay={selectedDay} mapRef={mapRef} />
        </div>

        {/* //////////////////// OVERLAYS //////////////////// */}

        {/* Header — Apple translucent glass nav */}
        <header
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2"
          style={{
            paddingTop: 'max(12px, env(safe-area-inset-top))',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          }}
        >
          <div>
            <h1 className="text-[15px] font-semibold tracking-[-0.24px] leading-tight text-white">
              {TRIP_META.name}
            </h1>
            <p className="text-[11px] text-white/60 tracking-[-0.08px]">
              {TRIP_META.dates} · {TRIP_META.model}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <IconBtn onClick={handleRefresh} label="Refresh" icon="↻" />
            <IconBtn onClick={handleDownload} label="Download" icon="↓" />
            <IconBtn onClick={handlePrint} label="Print" icon="⎙" />
            <IconBtn
              onClick={() => { setSyncing(true); handleSyncNotion().finally(() => setSyncing(false)); }}
              label="Sync to Notion"
              icon="⟳"
              active={syncing}
            />
          </div>
        </header>

        {/* Day selector — floating at bottom when sheet is closed/peek */}
        {sheet !== 'half' && (
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <DayPanel selectedDay={selectedDay} onSelect={setSelectedDay} />
          </div>
        )}

        {/* Sheet handle — always visible when sheet isn't fully closed */}
        {sheet !== 'closed' && (
          <button
            onClick={toggleSheet}
            className="absolute left-1/2 z-40 -translate-x-1/2 w-9 h-1.5 rounded-full bg-white/30 active:bg-white/50 transition-colors"
            style={{ bottom: sheet === 'peek' ? '148px' : 'calc(50vh + 8px)' }}
            aria-label={sheet === 'half' ? 'Collapse data panel' : 'Expand data panel'}
          />
        )}

        {/* //////////////////// BOTTOM SHEET //////////////////// */}
        <div
          className="absolute left-0 right-0 bottom-0 z-20 flex flex-col transition-all duration-350 ease-out"
          style={{
            height: sheet === 'half' ? '50vh' : sheet === 'peek' ? '140px' : '0px',
            background: 'rgba(20,20,22,0.92)',
            backdropFilter: 'saturate(180%) blur(30px)',
            WebkitBackdropFilter: 'saturate(180%) blur(30px)',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            overflow: 'hidden',
          }}
        >
          {/* Drag handle (decorative, inside the sheet) */}
          <div className="flex-shrink-0 flex justify-center pt-2 pb-1">
            <div className="w-9 h-1 rounded-full bg-white/20" />
          </div>

          {sheet === 'half' ? (
            <>
              {/* Tab bar */}
              <div className="flex-shrink-0 flex px-4 pb-1 border-b border-white/8">
                {([
                  ['weather', 'Weather'],
                  ['info', 'Info'],
                  ['packing', 'Pack'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActivePanel(key)}
                    className={`flex-1 py-2.5 text-[13px] font-medium tracking-[-0.08px] transition-colors ${
                      activePanel === key
                        ? 'text-amber-400'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                    style={{ minHeight: 44 }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Scrollable content */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <CampConditions />
                <WindDial />
                <ElevationProfile day={selectedDay} />
                {activePanel === 'weather' && <WeatherCard onRefresh={handleRefresh} />}
                {activePanel === 'info' && <InfoCenter />}
                {activePanel === 'packing' && <PackingList />}
              </div>
            </>
          ) : (
            /* Peek state — just elevation profile */
            <div className="flex-1 overflow-hidden flex flex-col justify-center px-4">
              <div className="text-[11px] font-medium text-white/40 text-center tracking-[-0.08px] mb-1">
                {selectedDay.label}
              </div>
              <div className="text-[13px] font-semibold text-white/80 text-center tracking-[-0.08px]">
                {selectedDay.miles !== '—' ? `${selectedDay.miles} mi · ${selectedDay.elevation}` : selectedDay.description}
              </div>
              <div className="text-[11px] text-white/30 text-center mt-1">
                ↑ tap to expand data
              </div>
            </div>
          )}
        </div>

        {/* Map attribution — tiny, bottom-right corner */}
        {sheet !== 'half' && (
          <div
            className="absolute z-10 text-[8px] text-white/25 pointer-events-none"
            style={{ bottom: sheet === 'peek' ? '160px' : '80px', right: '4px' }}
          >
            Protomaps © OSM · Open-Meteo · NWS · NPS
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}

/** Apple-style icon button — min 44pt tap target */
function IconBtn({ onClick, label, icon, active }: {
  onClick: () => void;
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full transition-all active:scale-90 ${
        active ? 'text-amber-400 bg-amber-500/15' : 'text-white/60 hover:text-white active:bg-white/10'
      }`}
      style={{ width: 36, height: 36, minWidth: 44, minHeight: 44, fontSize: 16 }}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export default App;
