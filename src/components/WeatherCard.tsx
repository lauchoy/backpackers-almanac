// Weather card — BUILD-SPEC §5
// Shows live forecast + historical climatology comparison

import { useForecast, useClimatology } from '../hooks/useWeather';
import { TRIP_DAYS } from '../data/itinerary';

interface WeatherCardProps {
  onRefresh: () => void;
}

export default function WeatherCard({ onRefresh }: WeatherCardProps) {
  const forecast = useForecast();
  const climate = useClimatology();

  const isStale = forecast.isStale || climate.isStale;
  const lastFetched = forecast.dataUpdatedAt
    ? new Date(forecast.dataUpdatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—';

  // Loading state
  if (forecast.isLoading && !forecast.data) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 p-4 animate-pulse">
        <div className="h-4 w-32 bg-slate-700/50 rounded mb-3" />
        <div className="h-8 w-48 bg-slate-700/30 rounded" />
      </div>
    );
  }

  // Error state
  if (forecast.isError) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 p-4">
        <p className="text-red-400 text-sm">Weather unavailable</p>
        <button onClick={onRefresh} className="text-amber-400 text-xs mt-1 underline">
          Retry
        </button>
      </div>
    );
  }

  const days = forecast.data?.daily;
  const climateDays = climate.data || [];

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Weather at Camp
        </h3>
        <div className="flex items-center gap-2">
          {isStale && (
            <span className="text-[9px] text-amber-500/60">
              last {lastFetched}
            </span>
          )}
          <button
            onClick={onRefresh}
            className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors px-2 py-0.5 rounded border border-amber-400/30 hover:border-amber-400/60"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Daily forecast for trip days */}
      <div className="grid grid-cols-3 gap-2">
        {days?.time?.slice(0, 6).map((date: string, i: number) => {
          const tripDay = TRIP_DAYS.find((d) => d.date.includes(getDayName(date)));
          const clim = climateDays[i];
          return (
            <div key={i} className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
              <div className="text-[10px] font-semibold text-slate-300 mb-1">
                {tripDay?.date?.split(' ')[0] || getDayName(date)} {tripDay?.date?.split(' ')[1] || ''}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-100 leading-none">
                  {days?.temperature_2m_max?.[i] ?? '—'}°
                </span>
                <span className="text-[10px] text-slate-500 leading-none">
                  / {days?.temperature_2m_min?.[i] ?? '—'}°
                </span>
              </div>
              {clim && (
                <div className="text-[9px] text-slate-600 mt-0.5">
                  typical {clim.avgLow}°–{clim.avgHigh}°
                </div>
              )}
              <div className="text-[9px] text-blue-400/70 mt-0.5">
                {days?.precipitation_sum?.[i] ? `${days.precipitation_sum[i]}″` : '0″'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution */}
      <p className="text-[8px] text-slate-600 mt-2 text-right">
        weather by Open-Meteo (CC BY 4.0)
      </p>
    </div>
  );
}

function getDayName(dateStr: string): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date(dateStr + 'T12:00:00');
  return days[d.getDay()];
}
