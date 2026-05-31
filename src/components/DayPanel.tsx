// Day selector panel — BUILD-SPEC §5

import { TRIP_DAYS } from '../data/itinerary';
import type { TripDay } from '../data/itinerary';

interface DayPanelProps {
  selectedDay: TripDay | null;
  onSelect: (day: TripDay) => void;
}

const PACK_ICONS: Record<string, string> = {
  Full: '🎒',
  Light: '🪶',
  '—': '',
};

export default function DayPanel({ selectedDay, onSelect }: DayPanelProps) {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-700/50 p-3">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">
        Itinerary
      </h2>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TRIP_DAYS.map((day) => {
          const isSelected = selectedDay?.num === day.num;
          const isHikingDay = day.num >= 1 && day.num <= 4;
          return (
            <button
              key={day.num}
              onClick={() => onSelect(day)}
              className={`
                flex-shrink-0 px-3 py-2 rounded-lg text-left min-w-[120px] transition-all duration-200
                ${isSelected
                  ? 'bg-amber-500/15 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50'
                }
              `}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-300'}`}>
                  D{day.num}
                </span>
                {PACK_ICONS[day.pack] && (
                  <span className="text-[10px]">{PACK_ICONS[day.pack]}</span>
                )}
              </div>
              <div className={`text-[11px] leading-tight ${isSelected ? 'text-slate-100' : 'text-slate-400'}`}>
                {day.label}
              </div>
              {isHikingDay && (
                <div className="flex gap-2 mt-1 text-[10px] text-slate-500">
                  <span>{day.miles} mi</span>
                  <span>{day.elevation}</span>
                </div>
              )}
              {day.flags?.map((flag, i) => (
                <div key={i} className="text-[9px] text-amber-500/70 mt-0.5 leading-tight">
                  ⚠ {flag}
                </div>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
