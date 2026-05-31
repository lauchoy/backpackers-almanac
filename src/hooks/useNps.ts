// React Query hooks for NPS — BUILD-SPEC §4.2

import { useQuery } from '@tanstack/react-query';
import { fetchNpsAlerts, fetchNpsParkInfo } from '../lib/nps';

const STALE_NPS = 30 * 60 * 1000; // 30 min

export function useNpsAlerts() {
  return useQuery({
    queryKey: ['nps-alerts', 'yose'],
    queryFn: () => fetchNpsAlerts('yose'),
    staleTime: STALE_NPS,
    retry: 2,
  });
}

export function useNpsParkInfo() {
  return useQuery({
    queryKey: ['nps-park', 'yose'],
    queryFn: () => fetchNpsParkInfo('yose'),
    staleTime: STALE_NPS,
    retry: 2,
  });
}
