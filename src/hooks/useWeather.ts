// React Query hooks for weather — BUILD-SPEC §4.2

import { useQuery } from '@tanstack/react-query';
import {
  fetchOpenMeteoForecast,
  fetchOpenMeteoHistory,
  fetchNwsForecast,
  fetchNwsWarnings,
} from '../lib/weather';
import { ANCHORS } from '../data/itinerary';

const CAMP = ANCHORS.yosemiteCreekCamp;

const STALE_FORECAST = 10 * 60 * 1000; // 10 min
const STALE_HISTORY = Infinity; // never restale
const STALE_NWS = 15 * 60 * 1000; // 15 min

export function useForecast() {
  return useQuery({
    queryKey: ['openmeteo-forecast', CAMP.lat, CAMP.lon],
    queryFn: () => fetchOpenMeteoForecast(CAMP.lat, CAMP.lon),
    staleTime: STALE_FORECAST,
    retry: 2,
  });
}

export function useClimatology() {
  return useQuery({
    queryKey: ['openmeteo-history', CAMP.lat, CAMP.lon],
    queryFn: () => fetchOpenMeteoHistory(CAMP.lat, CAMP.lon),
    staleTime: STALE_HISTORY,
    retry: 2,
  });
}

export function useNwsForecast() {
  return useQuery({
    queryKey: ['nws-forecast', CAMP.lat, CAMP.lon],
    queryFn: () => fetchNwsForecast(CAMP.lat, CAMP.lon),
    staleTime: STALE_NWS,
    retry: 2,
  });
}

export function useNwsWarnings() {
  return useQuery({
    queryKey: ['nws-warnings', CAMP.lat, CAMP.lon],
    queryFn: () => fetchNwsWarnings(CAMP.lat, CAMP.lon),
    staleTime: STALE_NWS,
    retry: 2,
  });
}
