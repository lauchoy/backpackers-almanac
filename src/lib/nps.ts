// NPS client — BUILD-SPEC §3.3
// Calls local /api/nps/* proxy (Hono injects X-Api-Key server-side)

export interface NpsAlert {
  id: string;
  title: string;
  description: string;
  category: 'Danger' | 'Closure' | 'Caution' | 'Information';
  url: string;
  lastUpdated: string;
}

export interface NpsParkInfo {
  name: string;
  description: string;
  url: string;
  directionsInfo: string;
  operatingHours: string;
  contacts: { phoneNumbers: { phoneNumber: string; type: string }[] };
}

export async function fetchNpsAlerts(parkCode: string = 'yose'): Promise<NpsAlert[]> {
  const res = await fetch(`/api/nps/alerts?parkCode=${parkCode}`);
  if (!res.ok) throw new Error(`NPS alerts failed: ${res.status}`);
  const data = await res.json();
  return (data.data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    url: a.url,
    lastUpdated: a.lastIndexedDate,
  }));
}

export async function fetchNpsParkInfo(parkCode: string = 'yose'): Promise<NpsParkInfo> {
  const res = await fetch(`/api/nps/parks?parkCode=${parkCode}`);
  if (!res.ok) throw new Error(`NPS park info failed: ${res.status}`);
  const data = await res.json();
  const park = data.data?.[0] || {};
  return {
    name: park.fullName || 'Yosemite National Park',
    description: park.description || '',
    url: park.url || '',
    directionsInfo: park.directionsInfo || '',
    operatingHours: park.operatingHours?.[0]?.description || '',
    contacts: park.contacts || { phoneNumbers: [] },
  };
}
