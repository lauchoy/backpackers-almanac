// Ground-truth trip data — BUILD-SPEC §5
// All coords WGS84, APPROXIMATE — replace with GPX-derived geometry where possible.
// Elevations in feet. Mileages are ±.

export interface TripDay {
  num: number;
  date: string;
  label: string;
  description: string;
  miles: string;
  elevation: string;
  pack: 'Full' | 'Light' | '—';
  water: string;
  flags?: string[];
  anchors: Anchor[];
}

export interface Anchor {
  id: string;
  type: 'trailhead' | 'camp' | 'summit' | 'poi' | 'waypoint';
  label: string;
  lat: number;
  lon: number;
  ele_ft: number;
}

export const ANCHORS: Record<string, Anchor> = {
  upperFallsTrailhead: {
    id: 'upperFallsTrailhead',
    type: 'trailhead',
    label: 'Camp 4 / Upper Yosemite Falls TH',
    lat: 37.7424,
    lon: -119.5987,
    ele_ft: 4000,
  },
  topOfYosemiteFalls: {
    id: 'topOfYosemiteFalls',
    type: 'poi',
    label: 'Top of Upper Yosemite Falls',
    lat: 37.7568,
    lon: -119.5969,
    ele_ft: 6500,
  },
  yosemiteCreekCamp: {
    id: 'yosemiteCreekCamp',
    type: 'camp',
    label: 'Yosemite Creek camp (wilderness — NOT the Tioga campground)',
    lat: 37.760,
    lon: -119.5950,
    ele_ft: 6700,
  },
  eaglePeak: {
    id: 'eaglePeak',
    type: 'summit',
    label: 'Eagle Peak',
    lat: 37.7547,
    lon: -119.6178,
    ele_ft: 7779,
  },
  northDome: {
    id: 'northDome',
    type: 'summit',
    label: 'North Dome',
    lat: 37.7557,
    lon: -119.5615,
    ele_ft: 7543,
  },
  indianRockArch: {
    id: 'indianRockArch',
    type: 'poi',
    label: 'Indian Rock Arch',
    lat: 37.7649,
    lon: -119.5609,
    ele_ft: 8478,
  },
  valleyWildernessCenter: {
    id: 'valleyWildernessCenter',
    type: 'waypoint',
    label: 'Valley Wilderness Center',
    lat: 37.7486,
    lon: -119.5876,
    ele_ft: 4000,
  },
};

export const TRIP_DAYS: TripDay[] = [
  {
    num: 0,
    date: 'Mon Jun 1',
    label: 'Travel & Stage',
    description: 'Drive in from LA; arrive Valley evening. Backpackers Camp. Permit pickup Tuesday AM.',
    miles: '—',
    elevation: '—',
    pack: '—',
    water: 'Valley',
    anchors: [ANCHORS.valleyWildernessCenter],
  },
  {
    num: 1,
    date: 'Tue Jun 2',
    label: 'The Climb — Yosemite Falls TH → Base Camp',
    description: 'Camp 4 trailhead → Columbia Rock → Upper Yosemite Falls → Yosemite Creek camp. Past the rim no-camp zone.',
    miles: '~3.5',
    elevation: '+2,700 ft',
    pack: 'Full',
    water: 'Yosemite Creek at camp',
    flags: ['Hard day', 'Start early', 'Exposed switchbacks'],
    anchors: [ANCHORS.upperFallsTrailhead, ANCHORS.topOfYosemiteFalls, ANCHORS.yosemiteCreekCamp],
  },
  {
    num: 2,
    date: 'Wed Jun 3',
    label: 'Eagle Peak — Day Hike',
    description: 'West on Yosemite Creek Trail → El Capitan Trail → Eagle Peak Trail to summit. Return same way.',
    miles: '~6-7 RT',
    elevation: '±1,300 ft',
    pack: 'Light',
    water: 'Top off at Yosemite Creek before leaving. None on trail.',
    flags: ['Recovery-friendly', 'Highest point (7,779 ft)'],
    anchors: [ANCHORS.yosemiteCreekCamp, ANCHORS.eaglePeak],
  },
  {
    num: 3,
    date: 'Thu Jun 4',
    label: 'North Dome + Indian Rock — Day Hike',
    description: 'East toward Indian Ridge → Indian Rock arch (0.3 mi spur) → North Dome summit. Return same way.',
    miles: '~9-11 RT (⚠ verify on GPS)',
    elevation: '±1,800 ft',
    pack: 'Light',
    water: 'Carry 3L+. Very exposed, dry stretch.',
    flags: ['Marquee day', 'Distance uncertain — verify on GPS', 'Best Half Dome view', 'Turnaround: Indian Rock alone is worthy'],
    anchors: [ANCHORS.yosemiteCreekCamp, ANCHORS.indianRockArch, ANCHORS.northDome],
  },
  {
    num: 4,
    date: 'Fri Jun 5',
    label: 'Descent — Full Packs',
    description: 'Yosemite Creek camp → down the falls trail to Valley. Backpackers Camp.',
    miles: '~3.5',
    elevation: '−2,700 ft',
    pack: 'Full',
    water: 'Valley',
    flags: ['Steep descent', 'Loose granite — use poles', 'Bear locker for cooler'],
    anchors: [ANCHORS.yosemiteCreekCamp, ANCHORS.topOfYosemiteFalls, ANCHORS.upperFallsTrailhead],
  },
  {
    num: 5,
    date: 'Sat Jun 6',
    label: 'Depart at Daybreak',
    description: 'First light ~5:15, sunrise ~5:40. Roll out early.',
    miles: '—',
    elevation: '—',
    pack: '—',
    water: 'Valley',
    anchors: [],
  },
];

export const TRIP_META = {
  name: 'Yosemite North Rim',
  dates: 'Jun 1–6, 2026',
  party: 'Jimmy + Phil',
  permit: 'Yosemite Falls Trailhead (entry & exit) · Reservation 08452065…',
  highPoint: 'Eagle Peak (7,779 ft)',
  model: 'Base camp at Yosemite Creek',
};

export const YOSEMITE_PARK_CODE = 'yose';
export const TZ = 'America/Los_Angeles';
export const TRIP_CENTER: [number, number] = [-119.5969, 37.7568]; // lon, lat (MapLibre order)
export const TRIP_ZOOM = 13;
