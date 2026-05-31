// Yosemite Creek camp conditions — BUILD-SPEC §5, HARD RULE #2
// DERIVED panel — synthesized from Open-Meteo + NWS + NPS, never fabricated.

import { useForecast, useNwsForecast } from '../hooks/useWeather';
import { useNpsAlerts } from '../hooks/useNps';
import { ANCHORS } from '../data/itinerary';

const CAMP = ANCHORS.yosemiteCreekCamp;

export default function CampConditions() {
  const forecast = useForecast();
  const nws = useNwsForecast();
  const npsAlerts = useNpsAlerts();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Loading
  if (forecast.isLoading && nws.isLoading) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-4 animate-pulse">
        <div className="h-3 w-48 bg-slate-700/50 rounded mb-2" />
        <div className="h-6 w-64 bg-slate-700/30 rounded" />
      </div>
    );
  }

  // Error
  if (forecast.isError && nws.isError) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-4">
        <p className="text-red-400 text-xs">Camp conditions unavailable</p>
      </div>
    );
  }

  // Get current conditions
  const nowIso = now.toISOString().slice(0, 13) + ':00';
  const hourIdx = (forecast.data?.hourly?.time || []).indexOf(nowIso);
  const temp = hourIdx >= 0 ? forecast.data?.hourly?.temperature_2m?.[hourIdx] : null;
  const windSpeed = hourIdx >= 0 ? forecast.data?.hourly?.wind_speed_10m?.[hourIdx] : null;
  const cloudCover = hourIdx >= 0 ? forecast.data?.hourly?.cloud_cover?.[hourIdx] : null;
  const precipProb = hourIdx >= 0 ? forecast.data?.hourly?.precipitation_probability?.[hourIdx] : null;

  const nwsPeriod = nws.data?.periods?.[0];
  const dangerAlerts = (npsAlerts.data || []).filter((a) => a.category === 'Danger' || a.category === 'Closure');

  return (
    <div className="bg-gradient-to-b from-green-950/30 to-slate-900/90 backdrop-blur-md p-3 border-b border-green-900/30">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">⛺</span>
          <div>
            <h3 className="text-xs font-semibold text-green-400/80 uppercase tracking-widest">
              Camp Conditions
            </h3>
            <p className="text-[9px] text-slate-500 leading-tight">
              derived for camp coordinate · {timeStr}
            </p>
          </div>
        </div>
        <div className="text-[9px] text-slate-600 text-right">
          {CAMP.ele_ft.toLocaleString()}′
          <br />
          {CAMP.lat.toFixed(4)}, {CAMP.lon.toFixed(4)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {/* Temperature */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
          <div className="text-[9px] text-slate-500">Temp</div>
          <div className="text-lg font-bold text-slate-100">
            {temp !== null ? `${temp}°F` : '—'}
          </div>
        </div>

        {/* Wind */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
          <div className="text-[9px] text-slate-500">Wind</div>
          <div className="text-lg font-bold text-slate-100">
            {windSpeed !== null ? `${windSpeed} mph` : '—'}
          </div>
        </div>

        {/* Precip / Cloud */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
          <div className="text-[9px] text-slate-500">
            {precipProb != null && precipProb > 20 ? 'Rain?' : 'Cloud'}
          </div>
          <div className="text-lg font-bold text-slate-100">
            {precipProb != null && precipProb > 20
              ? `${precipProb}%`
              : cloudCover !== null
                ? `${cloudCover}%`
                : '—'}
          </div>
        </div>
      </div>

      {/* NWS Narrative */}
      {nwsPeriod && (
        <p className="text-[10px] text-slate-400 mt-2 leading-snug italic">
          "{nwsPeriod.shortForecast}"
        </p>
      )}

      {/* Danger alerts */}
      {dangerAlerts.length > 0 && (
        <div className="mt-2 space-y-1">
          {dangerAlerts.map((a) => (
            <div key={a.id} className="text-[10px] text-red-400 bg-red-950/30 rounded p-1.5 border border-red-900/30">
              ⚠ {a.title}
            </div>
          ))}
        </div>
      )}

      {/* Source attribution */}
      <p className="text-[8px] text-slate-600 mt-2 leading-tight">
        Derived synthesis from Open-Meteo (CC BY 4.0) + NWS + NPS · Not a specific campsite feed · The developed "Yosemite Creek Campground" (Tioga Rd) is a different location
      </p>
    </div>
  );
}
