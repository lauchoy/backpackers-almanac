// Elevation profile chart — BUILD-SPEC §5
// Recharts area chart with distance × elevation

import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { TripDay } from '../data/itinerary';

interface ElevationProfileProps {
  day: TripDay | null;
}

// Generate approximate profile from anchor elevations
function generateApproximateProfile(day: TripDay) {
  if (day.anchors.length < 2) return [];

  // Simple linear interpolation between anchors
  const points: { dist: number; ele: number; label: string }[] = [];
  let cumDist = 0;
  
  for (let i = 0; i < day.anchors.length; i++) {
    const a = day.anchors[i];
    if (i > 0) {
      const prev = day.anchors[i - 1];
      // Rough haversine
      const R = 3959; // miles
      const dLat = ((a.lat - prev.lat) * Math.PI) / 180;
      const dLon = ((a.lon - prev.lon) * Math.PI) / 180;
      const lat1 = (prev.lat * Math.PI) / 180;
      const lat2 = (a.lat * Math.PI) / 180;
      const sinLat = Math.sin(dLat / 2);
      const sinLon = Math.sin(dLon / 2);
      const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
      cumDist += R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    }
    points.push({ dist: Math.round(cumDist * 100) / 100, ele: a.ele_ft, label: a.label });
  }

  return points;
}

export default function ElevationProfile({ day }: ElevationProfileProps) {
  if (!day || day.anchors.length < 2) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 p-4 text-center text-sm text-slate-500">
        Select a hiking day to see the elevation profile
      </div>
    );
  }

  const profile = generateApproximateProfile(day);
  if (profile.length === 0) return null;

  const minEle = Math.min(...profile.map((p) => p.ele)) - 200;
  const maxEle = Math.max(...profile.map((p) => p.ele)) + 200;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Elevation Profile
        </h3>
        <span className="text-[10px] text-amber-500/60">
          approximate — drop GPX for real track
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={profile} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dist"
              tick={{ fontSize: 9, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'mi', position: 'insideBottomRight', offset: -5, fontSize: 9, fill: '#475569' }}
            />
            <YAxis
              domain={[minEle, maxEle]}
              tick={{ fontSize: 9, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              width={35}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e2e8f0',
              }}
              formatter={(value: unknown) => [`${value} ft`, 'Elevation']}
              labelFormatter={(label: unknown) => `${label} mi`}
            />
            <Area
              type="monotone"
              dataKey="ele"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#eleGradient)"
              dot={{ r: 3, fill: '#f59e0b', stroke: '#1e293b', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Anchor labels */}
      <div className="flex justify-between mt-2 px-1">
        {profile.map((p, i) => (
          <div key={i} className="text-[9px] text-slate-500 max-w-[80px] truncate" title={p.label}>
            {p.ele.toLocaleString()}′
          </div>
        ))}
      </div>
    </div>
  );
}
