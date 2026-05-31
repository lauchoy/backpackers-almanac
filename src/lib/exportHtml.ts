// HTML trip brief export — self-contained, zero-dependency
// Generates a complete HTML document that can be saved and viewed offline.
// No JS required — pure HTML with inline data.

import { TRIP_DAYS, TRIP_META, ANCHORS } from '../data/itinerary';
import type { PackingItem } from '../data/packing-seed';
import { PACKING_CATEGORIES } from '../data/packing-seed';

interface ExportData {
  packingItems: PackingItem[];
  _forecast?: unknown;
  _nwsForecast?: unknown;
  npsAlerts?: unknown;
}

export function generateTripBrief(data: ExportData): string {
  const { packingItems, npsAlerts } = data;
  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

  // Pre-group packing items
  const groupedPacking: Record<string, PackingItem[]> = {};
  PACKING_CATEGORIES.forEach((cat) => {
    groupedPacking[cat] = packingItems.filter((i) => i.category === cat);
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backpacker's Almanac — Yosemite North Rim Trip Brief</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      max-width: 700px;
      margin: 0 auto;
      padding: 24px 16px;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.6;
      font-size: 13px;
    }
    h1 { font-size: 20px; font-weight: 700; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; margin-bottom: 4px; }
    .subtitle { color: #555; font-size: 12px; margin-bottom: 20px; }
    .generated { color: #999; font-size: 10px; margin-bottom: 24px; }
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin-top: 24px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 11px; }
    th { background: #f5f5f5; text-align: left; padding: 6px 8px; font-weight: 600; border-bottom: 2px solid #ccc; }
    td { padding: 6px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .flag { display: inline-block; background: #fef3c7; color: #92400e; font-size: 9px; padding: 1px 6px; border-radius: 4px; margin-right: 4px; }
    .alert { background: #fef2f2; border-left: 3px solid #dc2626; padding: 8px 10px; margin: 6px 0; font-size: 11px; }
    .alert-title { font-weight: 600; color: #b91c1c; }
    .info { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 8px 10px; margin: 6px 0; font-size: 11px; }
    .warn { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 10px; margin: 6px 0; font-size: 11px; }
    .regs { font-size: 11px; }
    .regs li { margin-left: 16px; margin-bottom: 2px; }
    .packing-cat { font-weight: 600; font-size: 11px; color: #555; margin-top: 8px; }
    .packing-item { display: flex; align-items: center; gap: 6px; padding: 2px 0; font-size: 11px; }
    .packing-item input[type=checkbox] { width: 14px; height: 14px; accent-color: #f59e0b; flex-shrink: 0; }
    .packing-item.checked { color: #999; text-decoration: line-through; }
    .badge { display: inline-block; font-size: 8px; padding: 0 4px; border-radius: 3px; font-weight: 600; }
    .badge-buy { background: #fecaca; color: #b91c1c; }
    .badge-rent { background: #bfdbfe; color: #1e40af; }
    .badge-split { background: #e9d5ff; color: #6b21a8; }
    .disclaimer { margin-top: 32px; padding-top: 8px; border-top: 1px solid #eee; color: #999; font-size: 9px; }
    @media print {
      body { padding: 0; max-width: none; }
    }
  </style>
</head>
<body>

<h1>Backpacker's Almanac</h1>
<p class="subtitle">${TRIP_META.name} · ${TRIP_META.dates} · Party: ${TRIP_META.party}<br>${TRIP_META.model} · High point: ${TRIP_META.highPoint}</p>
<p class="generated">Generated: ${now} PT</p>

<!-- ITINERARY -->
<h2>📋 Itinerary</h2>
<table>
  <thead>
    <tr><th>Day</th><th>Segment</th><th>Miles</th><th>Elevation</th><th>Pack</th></tr>
  </thead>
  <tbody>
    ${TRIP_DAYS.map((d) => `
    <tr>
      <td><strong>${d.num === 0 ? '' : 'D' + d.num}</strong><br><small>${d.date}</small></td>
      <td>
        <strong>${d.label}</strong>
        ${d.description ? `<br><small>${d.description}</small>` : ''}
        ${(d.flags || []).map((f) => `<span class="flag">${f}</span>`).join(' ')}
      </td>
      <td>${d.miles || '—'}</td>
      <td>${d.elevation || '—'}</td>
      <td>${d.pack || '—'}</td>
    </tr>`).join('\n    ')}
  </tbody>
</table>

<!-- WAYPOINTS -->
<h2>📍 Waypoints</h2>
<table>
  <thead><tr><th>Name</th><th>Type</th><th>Coordinates</th><th>Elevation</th></tr></thead>
  <tbody>
    ${Object.values(ANCHORS).map((a) => `
    <tr>
      <td>${a.label}</td>
      <td>${a.type}</td>
      <td><code>${a.lat.toFixed(4)}, ${a.lon.toFixed(4)}</code></td>
      <td>${a.ele_ft.toLocaleString()} ft</td>
    </tr>`).join('\n    ')}
  </tbody>
</table>

<!-- WEATHER -->
<h2>🌤️ Weather</h2>
<p style="color:#666;font-size:11px;">Weather data must be fetched live — load the app at <a href="https://backpackers-almanac.vercel.app">backpackers-almanac.vercel.app</a> for current forecast.</p>

<!-- NPS ALERTS -->
<h2>⚠️ Park Alerts</h2>
${
  npsAlerts && Array.isArray(npsAlerts) && (npsAlerts as any[]).length > 0
    ? (npsAlerts as any[]).map((a: any) => `
    <div class="alert">
      <div class="alert-title">${a.title || 'Alert'}</div>
      ${a.description ? `<p>${a.description}</p>` : ''}
    </div>`).join('\n    ')
    : '<p style="color:#666;font-size:11px;">No active alerts or data unavailable offline. Check the live app.</p>'
}

<!-- KEY REGULATIONS -->
<h2>📜 Key Regulations</h2>
<ul class="regs">
  <li>Bear canister required everywhere in Yosemite Wilderness</li>
  <li>Two canisters for two people / 3 nights</li>
  <li>Hanging food is prohibited</li>
  <li>Fire likely banned — stove only</li>
  <li>No camping within the rim no-camp zone (check ranger map)</li>
  <li>Pets prohibited in wilderness</li>
  <li>Treat all water (giardia)</li>
</ul>

<!-- WATER & FACTS -->
<h2>💧 Water & Key Facts</h2>
<div class="info">
  <strong>Reliable water:</strong> Yosemite Creek (at camp / by the falls viewpoint) —  <strong>the only source up top.</strong>
  Fill heavily before both day-hikes. Treat everything.
</div>
<div class="warn">
  <strong>2026 is a low-snow year</strong> (early melt-out). No microspikes needed. Tradeoff: seasonal water fades early.
</div>

<!-- PACKING LIST -->
<h2>🎒 Packing List</h2>
${PACKING_CATEGORIES.map((cat) => {
  const items = groupedPacking[cat] || [];
  if (items.length === 0) return '';
  return `
<div class="packing-cat">${cat}</div>
${items.map((item) => `
<div class="packing-item${item.checked ? ' checked' : ''}">
  <input type="checkbox" ${item.checked ? 'checked' : ''} disabled>
  <span>${item.name}</span>
  ${item.note ? `<small style="color:#999">— ${item.note}</small>` : ''}
  ${item.status !== 'own' ? `<span class="badge badge-${item.status}">${item.status}</span>` : ''}
</div>`).join('\n')}`;
}).join('\n')}

<!-- CONTACTS -->
<h2>📞 Emergency Contacts</h2>
<table>
  <tr><td>Park / roads</td><td>209-372-0200</td></tr>
  <tr><td>Save-a-Bear</td><td>209-372-0322</td></tr>
  <tr><td>Emergency</td><td>911 / satellite SOS</td></tr>
</table>

<div class="disclaimer">
  <p><strong>Data sources:</strong> Weather — Open-Meteo (CC BY 4.0) & NWS · Park data — NPS API · Map — Protomaps © OpenStreetMap</p>
  <p><strong>⚠ All distances approximate.</strong> Verify on GPS. Confirm water & fire status with ranger at permit pickup.</p>
  <p>Generated by Backpacker's Almanac — <a href="https://backpackers-almanac.vercel.app">backpackers-almanac.vercel.app</a></p>
</div>

</body>
</html>`;
}

export function downloadTripBrief(data: ExportData): void {
  const html = generateTripBrief(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backpackers-almanac-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
