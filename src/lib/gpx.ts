// GPX parser — BUILD-SPEC §4.1
// Loads GPX files → GeoJSON, extracts elevation profiles.

import { gpx } from '@tmcw/togeojson';

interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  distance_mi: number; // cumulative distance from start
}

export interface ElevationProfile {
  points: { distance_mi: number; ele_ft: number }[];
  totalDistance_mi: number;
  gain_ft: number;
  loss_ft: number;
}

function ft(meters: number): number {
  return Math.round(meters * 3.28084);
}

function mi(meters: number): number {
  return Math.round(meters * 0.000621371 * 100) / 100;
}

function haversineMeters(a: TrackPoint, b: TrackPoint): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function parseGPX(xmlString: string): { geojson: GeoJSON.FeatureCollection; profile: ElevationProfile } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const geojson = gpx(doc) as GeoJSON.FeatureCollection;

  // Extract track points with cumulative distance
  const trackPoints: TrackPoint[] = [];
  for (const feature of geojson.features) {
    if (feature.geometry.type === 'LineString') {
      let cumDist = 0;
      const coords = feature.geometry.coordinates;
      for (let i = 0; i < coords.length; i++) {
        const [lon, lat, ele_m] = coords[i];
        const pt: TrackPoint = { lat, lon, ele: ele_m ? ft(ele_m) : 0, distance_mi: 0 };
        if (i > 0) {
          const prev = trackPoints[trackPoints.length - 1];
          const dist = mi(haversineMeters(prev, pt));
          cumDist += dist;
        }
        pt.distance_mi = cumDist;
        trackPoints.push(pt);
      }
    }
  }

  // Compute elevation profile
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < trackPoints.length; i++) {
    const diff = trackPoints[i].ele - trackPoints[i - 1].ele;
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }

  const profile: ElevationProfile = {
    points: trackPoints.map((p) => ({ distance_mi: p.distance_mi, ele_ft: p.ele })),
    totalDistance_mi: trackPoints.length > 0 ? trackPoints[trackPoints.length - 1].distance_mi : 0,
    gain_ft: Math.round(gain),
    loss_ft: Math.round(loss),
  };

  return { geojson, profile };
}

/** Generate straight-line approximate route between two anchors (for when no GPX exists) */
export function approximateLine(
  from: { lat: number; lon: number; ele_ft: number },
  to: { lat: number; lon: number; ele_ft: number },
): { geojson: GeoJSON.Feature; totalDistance_mi: number } {
  const dist = mi(haversineMeters(
    { lat: from.lat, lon: from.lon, ele: 0, distance_mi: 0 },
    { lat: to.lat, lon: to.lon, ele: 0, distance_mi: 0 },
  ));

  return {
    geojson: {
      type: 'Feature',
      properties: { approximate: true, ele_from_ft: from.ele_ft, ele_to_ft: to.ele_ft },
      geometry: {
        type: 'LineString',
        coordinates: [
          [from.lon, from.lat, from.ele_ft / 3.28084],
          [to.lon, to.lat, to.ele_ft / 3.28084],
        ],
      },
    },
    totalDistance_mi: dist,
  };
}
