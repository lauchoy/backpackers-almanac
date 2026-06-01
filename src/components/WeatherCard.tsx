// Weather card — NWS primary, Open-Meteo secondary
// BUILD-SPEC §3.2: NWS is authoritative for US mountain locations

import { useNwsForecast, useClimatology, useForecast } from '../hooks/useWeather';

interface WeatherCardProps {
  onRefresh: () => void;
}

export default function WeatherCard({ onRefresh }: WeatherCardProps) {
  const nws = useNwsForecast();
  const om = useForecast();
  const climate = useClimatology();

  const isStale = nws.isStale;
  const lastFetched = nws.dataUpdatedAt
    ? new Date(nws.dataUpdatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—';

  // Loading
  if (nws.isLoading && om.isLoading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-3 w-24 bg-white/10 rounded mb-3" />
        <div className="h-6 w-48 bg-white/5 rounded" />
      </div>
    );
  }

  // Error — fall back to Open-Meteo
  if (nws.isError && om.isError) {
    return (
      <div className="p-4">
        <p className="text-red-400 text-xs">Weather unavailable</p>
        <button onClick={onRefresh} className="text-amber-400 text-xs mt-1 underline">
          Retry
        </button>
      </div>
    );
  }

  const nwsPeriods = nws.data?.periods || [];
  const omDaily = om.data?.daily;
  const climateDays = climate.data || [];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Forecast
        </h3>
        <div className="flex items-center gap-2">
          {isStale && (
            <span className="text-[9px] text-amber-400/60">last {lastFetched}</span>
          )}
          <button
            onClick={onRefresh}
            className="text-[10px] text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-400/30 active:bg-amber-500/20"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* NWS periods — grouped by day */}
      <div className="grid grid-cols-2 gap-2">
        {nwsPeriods.slice(0, 8).map((period: any, i: number) => {
          // Try to find climate day for comparison
          const d = new Date(period.startTime);
          const dayIdx = climateDays.findIndex((cd: any) => {
            const cdDate = new Date(`${cd.date} 2026`);
            return cdDate.getDate() === d.getDate() && cdDate.getMonth() === d.getMonth();
          });
          const clim = dayIdx >= 0 ? climateDays[dayIdx] : null;

          return (
            <div key={i} className="bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06]">
              <div className="text-[10px] font-medium text-white/50 mb-1">
                {period.name}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-semibold text-white tracking-[-0.02em]">
                  {period.temperature != null ? period.temperature : '—'}°
                </span>
              </div>
              <div className="text-[10px] text-white/60 leading-snug mt-0.5">
                {period.shortForecast}
              </div>
              {period.windSpeed && (
                <div className="text-[9px] text-white/30 mt-1">
                  Wind: {period.windSpeed} {period.windDirection}
                </div>
              )}
              {clim && period.temperature != null && (
                <div className="text-[8px] text-white/20 mt-0.5">
                  typical {clim.avgLow}°–{clim.avgHigh}°
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Open-Meteo comparison row */}
      {omDaily && (
        <div className="mt-2 pt-2 border-t border-white/[0.06]">
          <div className="text-[9px] text-white/20 mb-1">Open-Meteo comparison:</div>
          <div className="flex gap-2 text-[9px] text-white/30">
            {omDaily.time.slice(0, 3).map((date: string, i: number) => (
              <span key={i}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}:{' '}
                {omDaily.temperature_2m_min[i]}°–{omDaily.temperature_2m_max[i]}°
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[7px] text-white/15 mt-2 text-right">
        forecast by NWS/NOAA · climatology by Open-Meteo (CC BY 4.0)
      </p>
    </div>
  );
}
