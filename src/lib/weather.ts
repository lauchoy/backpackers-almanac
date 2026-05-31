// Weather clients — BUILD-SPEC §3.1 & §3.2
// Open-Meteo (no key) + NWS (no key, User-Agent required)

const APP_USER_AGENT = 'Backpackers-Almanac/1.0 (backpackers-almanac.vercel.app)';

// --- Open-Meteo Types ---
export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  precipitation: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  wind_gusts_10m: number[];
  cloud_cover: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
}

export interface OpenMeteoForecast {
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}

// --- NWS Types ---
export interface NwsPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface NwsForecast {
  periods: NwsPeriod[];
}

export interface NwsAlert {
  id: string;
  event: string;
  headline: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  areaDesc: string;
  description: string;
  instruction: string;
  effective: string;
  expires: string;
}

// --- Historical Climatology ---
export interface DayClimatology {
  date: string; // "Jun 1"
  avgHigh: number;
  avgLow: number;
  avgPrecip: number;
  minTemp: number;
  maxTemp: number;
}

// --- Fetch functions ---

export async function fetchOpenMeteoForecast(lat: number, lon: number): Promise<OpenMeteoForecast> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: 'temperature_2m,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max',
    timezone: 'America/Los_Angeles',
    forecast_days: '7',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo forecast failed: ${res.status}`);
  return res.json();
}

export async function fetchOpenMeteoHistory(
  lat: number,
  lon: number,
  years: number = 12,
): Promise<DayClimatology[]> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = currentYear - years;

  // Fetch June 1–6 across all requested years
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: `${startYear}-06-01`,
    end_date: `${currentYear - 1}-06-06`,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'America/Los_Angeles',
    temperature_unit: 'fahrenheit',
    precipitation_unit: 'inch',
  });
  const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo archive failed: ${res.status}`);
  const data = await res.json();

  // Group by month-day
  const dayMap: Record<string, { highs: number[]; lows: number[]; precips: number[] }> = {};
  const days = ['Jun 1', 'Jun 2', 'Jun 3', 'Jun 4', 'Jun 5', 'Jun 6'];
  for (const d of days) dayMap[d] = { highs: [], lows: [], precips: [] };

  for (let i = 0; i < data.daily.time.length; i++) {
    const date = new Date(data.daily.time[i] + 'T12:00:00');
    const key = `Jun ${date.getDate()}`;
    if (dayMap[key]) {
      dayMap[key].highs.push(data.daily.temperature_2m_max[i]);
      dayMap[key].lows.push(data.daily.temperature_2m_min[i]);
      dayMap[key].precips.push(data.daily.precipitation_sum[i]);
    }
  }

  return days.map((day) => {
    const vals = dayMap[day];
    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    return {
      date: day,
      avgHigh: avg(vals.highs),
      avgLow: avg(vals.lows),
      avgPrecip: Math.round(vals.precips.reduce((a, b) => a + b, 0) / vals.precips.length * 100) / 100,
      minTemp: Math.min(...vals.lows),
      maxTemp: Math.max(...vals.highs),
    };
  });
}

export async function fetchNwsForecast(lat: number, lon: number): Promise<NwsForecast> {
  // Step 1: resolve point
  const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
    headers: { 'User-Agent': APP_USER_AGENT },
  });
  if (!pointRes.ok) throw new Error(`NWS points failed: ${pointRes.status}`);
  const pointData = await pointRes.json();
  const forecastUrl = pointData.properties?.forecast;
  if (!forecastUrl) throw new Error('NWS: no forecast URL in point response');

  // Step 2: fetch forecast
  const forecastRes = await fetch(forecastUrl, {
    headers: { 'User-Agent': APP_USER_AGENT },
  });
  if (!forecastRes.ok) throw new Error(`NWS forecast failed: ${forecastRes.status}`);
  const forecastData: NwsForecast = await forecastRes.json();
  return forecastData;
}

export async function fetchNwsWarnings(lat: number, lon: number): Promise<NwsAlert[]> {
  const pointRes = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
    headers: { 'User-Agent': APP_USER_AGENT },
  });
  if (!pointRes.ok) return [];
  const pointData = await pointRes.json();
  const zone = pointData.properties?.forecastZone;
  if (!zone) return [];

  // Extract zone ID from URL
  const zoneId = zone.split('/').pop();
  const alertsRes = await fetch(`https://api.weather.gov/alerts/active/zone/${zoneId}`, {
    headers: { 'User-Agent': APP_USER_AGENT },
  });
  if (!alertsRes.ok) return [];
  const alertsData = await alertsRes.json();

  return (alertsData.features || []).map((f: any) => ({
    id: f.properties?.id || '',
    event: f.properties?.event || 'Unknown',
    headline: f.properties?.headline || '',
    severity: f.properties?.severity || 'Unknown',
    areaDesc: f.properties?.areaDesc || '',
    description: f.properties?.description || '',
    instruction: f.properties?.instruction || '',
    effective: f.properties?.effective || '',
    expires: f.properties?.expires || '',
  }));
}
