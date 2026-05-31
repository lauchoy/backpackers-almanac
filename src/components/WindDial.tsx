// Wind compass dial — BUILD-SPEC §5

import { useForecast } from '../hooks/useWeather';

export default function WindDial() {
  const forecast = useForecast();

  if (!forecast.data?.hourly) return null;

  // Get current hour's wind
  const now = new Date();
  const currentHour = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`;
  const hourIdx = forecast.data.hourly.time.indexOf(currentHour);
  const windSpeed = hourIdx >= 0 ? forecast.data.hourly.wind_speed_10m[hourIdx] : 0;
  const windDir = hourIdx >= 0 ? forecast.data.hourly.wind_direction_10m[hourIdx] : 0;
  const windGust = hourIdx >= 0 ? forecast.data.hourly.wind_gusts_10m[hourIdx] : 0;

  const dirLabel = getWindDirection(windDir);
  const rotation = windDir;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
        Wind
      </div>
      <div className="flex items-center gap-3">
        {/* Compass dial */}
        <div className="relative w-12 h-12">
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <circle cx="24" cy="24" r="22" fill="none" stroke="#334155" strokeWidth="1.5" />
            {/* Cardinal ticks */}
            {[0, 90, 180, 270].map((angle) => {
              const rad = (angle - 90) * Math.PI / 180;
              const x1 = 24 + 20 * Math.cos(rad);
              const y1 = 24 + 20 * Math.sin(rad);
              const x2 = 24 + 17 * Math.cos(rad);
              const y2 = 24 + 17 * Math.sin(rad);
              const labels = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };
              return (
                <g key={angle}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="1.5" />
                  <text
                    x={24 + 15 * Math.cos(rad)}
                    y={24 + 15 * Math.sin(rad)}
                    fill="#94a3b8"
                    fontSize="8"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontWeight="bold"
                  >
                    {labels[angle as keyof typeof labels]}
                  </text>
                </g>
              );
            })}
            {/* Wind arrow */}
            <g transform={`rotate(${rotation}, 24, 24)`}>
              <line x1="24" y1="16" x2="24" y2="32" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <polygon points="24,14 20,20 28,20" fill="#f59e0b" />
            </g>
          </svg>
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-100">{windSpeed}</span>
            <span className="text-[10px] text-slate-500">mph</span>
          </div>
          <div className="text-[10px] text-slate-400">{dirLabel}</div>
          {windGust > 0 && (
            <div className="text-[9px] text-amber-500/60">
              gusts {windGust} mph
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(degrees / 22.5) % 16;
  return dirs[idx];
}
