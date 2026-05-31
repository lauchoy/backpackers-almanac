// MapLibre initialization — BUILD-SPEC §2, §4
// PMTiles protocol, terrain, hillshade

import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { layers, DARK } from '@protomaps/basemaps';
import 'maplibre-gl/dist/maplibre-gl.css';

// Initialize PMTiles protocol once
const pmtilesProtocol = new Protocol();
maplibregl.addProtocol('pmtiles', pmtilesProtocol.tile);

const PROTOMAPS_SOURCE = 'protomaps';
const DEM_SOURCE = 'terrain';

// Fallback Protomaps tile URL (replace with clipped yosemite.pmtiles when available)
const PMTILES_URL = 'pmtiles://https://build.protomaps.com/20250512.pmtiles';

// Terrarium DEM tile endpoint (no key required)
const DEM_TILES = ['https://tiles.mapterhorn.com/terrarium/{z}/{x}/{y}.png'];

export function createMap(container: string | HTMLElement, center: [number, number], zoom: number): maplibregl.Map {
  const darkLayers = layers(PROTOMAPS_SOURCE, DARK, { lang: 'en' });

  const map = new maplibregl.Map({
    container,
    center,
    zoom,
    pitch: 55,
    bearing: -20,
    cooperativeGestures: true,
    style: {
      version: 8,
      sources: {
        [PROTOMAPS_SOURCE]: {
          type: 'vector',
          url: PMTILES_URL,
          attribution: '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        },
        [DEM_SOURCE]: {
          type: 'raster-dem',
          tiles: DEM_TILES,
          tileSize: 256,
          encoding: 'terrarium',
          maxzoom: 15,
          attribution: 'Terrarium DEM tiles',
        },
      },
      layers: darkLayers,
      terrain: {
        source: DEM_SOURCE,
        exaggeration: 1.5,
      },
      sky: {
        'sky-color': '#1a1a2e',
        'horizon-color': '#2a2a3e',
        'fog-color': '#0d0d1a',
        'fog-ground-blend': 0.2,
      },
      glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    },
  });

  // Navigation controls
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
  map.addControl(new maplibregl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

  return map;
}

const ROUTE_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

export function getRouteColor(dayNum: number): string {
  return ROUTE_COLORS[Math.min(dayNum, ROUTE_COLORS.length - 1)];
}
