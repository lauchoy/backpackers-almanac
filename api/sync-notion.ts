// Vercel serverless function — Sync to Notion
// Fetches live weather + NPS alerts, appends an update block to the Notion trip page

import type { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_TOKEN = process.env.NOTION_API_KEY || '';
const NOTION_PAGE_ID = '3727f694-dbe1-81ac-998e-ef5b6f87f2dd';
const CAMP_COORD = { lat: 37.83175, lon: -119.58938 };
const APP_USER_AGENT = 'Backpackers-Almanac/1.0';

async function fetchNwsForecast(): Promise<string> {
  // Step 1: get gridpoint
  const pointRes = await fetch(
    `https://api.weather.gov/points/${CAMP_COORD.lat},${CAMP_COORD.lon}`,
    { headers: { 'User-Agent': APP_USER_AGENT } }
  );
  if (!pointRes.ok) return 'NWS unavailable';
  const pointData = await pointRes.json() as Record<string, any>;
  const fcUrl = pointData.properties?.forecast;
  if (!fcUrl) return 'No forecast URL';

  // Step 2: get forecast
  const fcRes = await fetch(fcUrl, { headers: { 'User-Agent': APP_USER_AGENT } });
  if (!fcRes.ok) return 'Forecast unavailable';
  const fc = await fcRes.json() as Record<string, any>;
  const periods = fc.properties?.periods || [];

  return periods.slice(0, 4).map((p: any) =>
    `${p.name}: ${p.temperature}°F, ${p.shortForecast}${p.windSpeed ? `, wind ${p.windSpeed} ${p.windDirection || ''}` : ''}`
  ).join(' · ');
}

async function fetchOpenMeteo(): Promise<string> {
  const params = new URLSearchParams({
    latitude: CAMP_COORD.lat.toString(),
    longitude: CAMP_COORD.lon.toString(),
    hourly: 'temperature_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,cloud_cover',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'America/Los_Angeles',
    forecast_days: '7',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
  });
  
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  const data = await res.json() as Record<string, any>;
  
  const daily = data.daily;
  const now = new Date();
  const hourIdx = data.hourly?.time?.indexOf(
    `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:00`
  );
  
  const temp = hourIdx >= 0 ? data.hourly?.temperature_2m?.[hourIdx] : '?';
  const wind = hourIdx >= 0 ? data.hourly?.wind_speed_10m?.[hourIdx] : '?';
  const windDir = hourIdx >= 0 ? data.hourly?.wind_direction_10m?.[hourIdx] : 0;
  const cloud = hourIdx >= 0 ? data.hourly?.cloud_cover?.[hourIdx] : '?';
  const precipProb = hourIdx >= 0 ? data.hourly?.precipitation_probability?.[hourIdx] : 0;
  
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const dir = dirs[Math.round(Number(windDir) / 22.5) % 16] || '';
  
  const hiToday = daily?.temperature_2m_max?.[0] ?? '?';
  const loToday = daily?.temperature_2m_min?.[0] ?? '?';
  
  let summary = `${temp}°F (${loToday}°–${hiToday}°), wind ${wind} mph ${dir}`;
  if (Number(precipProb) > 20) summary += `, ${precipProb}% rain`;
  summary += `, ${cloud}% clouds`;
  
  return summary;
}

async function fetchNpsAlerts(): Promise<string> {
  const NPS_KEY = process.env.NPS_API_KEY || '';
  if (!NPS_KEY) return 'NPS key not configured';
  
  const res = await fetch('https://developer.nps.gov/api/v1/alerts?parkCode=yose', {
    headers: { 'X-Api-Key': NPS_KEY, 'Accept': 'application/json' },
  });
  const data = await res.json() as Record<string, any>;
  const alerts = data.data || [];
  
  if (alerts.length === 0) return 'No active alerts';
  
  return alerts.slice(0, 3).map((a: any) => 
    `[${a.category}] ${a.title}`
  ).join(' · ');
}

async function patchNotion(markdown: string): Promise<boolean> {
  if (!NOTION_TOKEN) throw new Error('NOTION_API_KEY not configured');
  
  const url = `https://api.notion.com/v1/pages/${NOTION_PAGE_ID}/markdown`;
  const body = JSON.stringify({
    type: 'insert_content',
    insert_content: { content: markdown },
  });
  
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2025-09-03',
      'Content-Type': 'application/json',
    },
    body,
  });
  
  return res.ok;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }
  
  try {
    const [nwsForecast, alerts] = await Promise.all([
      fetchNwsForecast(),
      fetchNpsAlerts(),
    ]);
    
    const now = new Date();
    const ts = now.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
    
    const markdown = `\n---\n\n🔄 **Synced ${ts} PT**\n\n🌤️ ${nwsForecast}\n\n⚠️ ${alerts}\n`;
    
    const ok = await patchNotion(markdown);
    
    res.status(ok ? 200 : 500).json({
      ok,
      timestamp: now.toISOString(),
      forecast: nwsForecast,
      alerts,
    });
  } catch (err: any) {
    console.error('Sync error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
}
