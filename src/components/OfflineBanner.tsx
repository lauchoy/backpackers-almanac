// Offline banner — shows when network is unavailable

import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div className="print:hidden bg-amber-900/80 backdrop-blur-md border-b border-amber-700/50 px-3 py-1.5 text-center">
      <p className="text-[11px] text-amber-300 font-medium">
        ⚡ You're offline — showing last fetched data
      </p>
      <p className="text-[9px] text-amber-500/60 mt-0.5">
        Weather, alerts, and map tiles may be stale. Use Print to save a snapshot.
      </p>
    </div>
  );
}
