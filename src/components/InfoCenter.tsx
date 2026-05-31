// Information center — BUILD-SPEC §5
// NPS alerts, park info, key regulations

import { useNpsAlerts } from '../hooks/useNps';
import { useNwsWarnings } from '../hooks/useWeather';
import { TRIP_META } from '../data/itinerary';

const CATEGORY_STYLES: Record<string, string> = {
  Danger: 'border-red-500/40 bg-red-500/10 text-red-400',
  Closure: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  Caution: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  Information: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
};

export default function InfoCenter() {
  const alerts = useNpsAlerts();
  const warnings = useNwsWarnings();

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 p-3 max-h-[50vh] overflow-y-auto">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Info Center
      </h3>

      {/* Alerts and Warnings */}
      {(alerts.data && alerts.data.length > 0 || warnings.data && warnings.data.length > 0) && (
        <div className="mb-3 space-y-2">
          {(alerts.data || []).map((alert) => (
            <div
              key={alert.id}
              className={`p-2 rounded-lg border text-sm ${CATEGORY_STYLES[alert.category] || CATEGORY_STYLES.Information}`}
            >
              <div className="font-semibold text-xs">{alert.title}</div>
              <p className="text-[11px] mt-0.5 opacity-80 leading-snug">{alert.description}</p>
              <div className="text-[9px] mt-1 opacity-60">
                updated {new Date(alert.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          ))}
          {(warnings.data || []).map((w) => (
            <div key={w.id} className="p-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
              <div className="font-semibold text-xs">{w.event}</div>
              <p className="text-[11px] mt-0.5 opacity-80 leading-snug">{w.headline}</p>
            </div>
          ))}
        </div>
      )}

      {/* Key Regulations */}
      <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30 mb-2">
        <div className="text-[10px] font-semibold text-slate-300 mb-1">Key Regulations</div>
        <ul className="text-[10px] text-slate-400 space-y-0.5 leading-snug">
          <li>• Bear canister required everywhere in Yosemite Wilderness</li>
          <li>• Two canisters for two people / 3 nights</li>
          <li>• Hanging food is prohibited</li>
          <li>• Fire likely banned — stove only</li>
          <li>• No camping within the rim no-camp zone (check ranger map)</li>
          <li>• Pets prohibited in wilderness</li>
          <li>• Treat all water (giardia)</li>
        </ul>
      </div>

      {/* Trip Summary */}
      <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30">
        <div className="text-[10px] font-semibold text-slate-300 mb-1">{TRIP_META.name}</div>
        <div className="text-[10px] text-slate-500 space-y-0.5">
          <div>{TRIP_META.dates}</div>
          <div>{TRIP_META.party}</div>
          <div>High point: {TRIP_META.highPoint}</div>
        </div>
      </div>

      {/* Attribution */}
      <p className="text-[8px] text-slate-600 mt-2 text-right">
        park data via <a href="https://www.nps.gov/subjects/developer" className="underline" target="_blank">NPS API</a> · weather by NWS
      </p>
    </div>
  );
}
