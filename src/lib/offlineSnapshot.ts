// Offline data snapshot — caches weather/alerts/NPS to localStorage

const STORAGE_KEY = 'backpackers-almanac-snapshot';

export interface OfflineSnapshot {
  timestamp: string;
  data: Record<string, unknown>;
}

export function saveOfflineSnapshot(data: Record<string, unknown>): void {
  const snapshot: OfflineSnapshot = {
    timestamp: new Date().toISOString(),
    data,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.warn('Failed to save offline snapshot:', e);
  }
}

export function loadOfflineSnapshot(): OfflineSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineSnapshot;
  } catch {
    return null;
  }
}

export function getSnapshotAge(): string | null {
  const snapshot = loadOfflineSnapshot();
  if (!snapshot) return null;
  
  const age = Date.now() - new Date(snapshot.timestamp).getTime();
  const minutes = Math.floor(age / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function clearOfflineSnapshot(): void {
  localStorage.removeItem(STORAGE_KEY);
}
