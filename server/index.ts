// Hono proxy server — BUILD-SPEC §4.1, §3.3
// Proxies /api/nps/* → developer.nps.gov, injecting X-Api-Key server-side.
// The NPS key never reaches the browser.

import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

const NPS_BASE = 'https://developer.nps.gov/api/v1';
const NPS_API_KEY = process.env.NPS_API_KEY || '';

app.all('/api/nps/*', async (c) => {
  const path = c.req.path.replace('/api/nps', '');
  const url = new URL(NPS_BASE + path);
  
  // Forward query params
  c.req.query() && Object.entries(c.req.query()).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {
    'X-Api-Key': NPS_API_KEY,
    'Accept': 'application/json',
  };

  const res = await fetch(url.toString(), { headers });
  
  return c.body(res.body, res.status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
});

// CORS preflight
app.options('/api/nps/*', (c) => {
  return c.body(null, 204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept',
  });
});

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', hasKey: !!NPS_API_KEY });
});

const port = parseInt(process.env.PORT || '3001');
console.log(`NPS proxy running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
