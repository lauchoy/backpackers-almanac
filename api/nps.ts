// Vercel serverless function — NPS API proxy
// Injects X-Api-Key server-side. Never exposed to browser.
// Deployed as api/nps.ts on Vercel.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const NPS_BASE = 'https://developer.nps.gov/api/v1';
const NPS_API_KEY = process.env.NPS_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Build NPS URL from the path after /api/nps
  const npsPath = (req.url || '').replace(/^\/api\/nps\/?/, '');
  const url = new URL(`${NPS_BASE}/${npsPath}`);

  // Forward all query params
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      url.searchParams.set(key, value);
    }
  }

  try {
    const npsRes = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': NPS_API_KEY,
        'Accept': 'application/json',
      },
    });

    const data = await npsRes.json();
    res.status(npsRes.status).json(data);
  } catch (err) {
    console.error('NPS proxy error:', err);
    res.status(502).json({ error: 'NPS API unreachable' });
  }
}
