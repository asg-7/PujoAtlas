import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { PandalEntity, FoodEntity, MetroStationEntity } from '../../src/lib/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../src/data');

function loadJSON<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

// --- Pandal data & indexes ---

const pandalsNorth = loadJSON<PandalEntity>('pandals-north.json');
const pandalsSouth = loadJSON<PandalEntity>('pandals-south.json');
const pandalsCentral = loadJSON<PandalEntity>('pandals-central.json');
const pandalsEast = loadJSON<PandalEntity>('pandals-east.json');
const pandalsWest = loadJSON<PandalEntity>('pandals-west.json');

export const allPandals: PandalEntity[] = [
  ...pandalsNorth,
  ...pandalsSouth,
  ...pandalsCentral,
  ...pandalsEast,
  ...pandalsWest,
];

// Pre-built indexes for fast filtering
export const pandalsByZone = new Map<string, PandalEntity[]>();
export const pandalsByStation = new Map<string, PandalEntity[]>();
export const pandalsByDay = new Map<string, PandalEntity[]>();
export const pandalById = new Map<string, PandalEntity>();

for (const p of allPandals) {
  pandalById.set(p.id, p);

  const zoneList = pandalsByZone.get(p.zone) ?? [];
  zoneList.push(p);
  pandalsByZone.set(p.zone, zoneList);

  if (p.nearestMetroStationId) {
    const stationList = pandalsByStation.get(p.nearestMetroStationId) ?? [];
    stationList.push(p);
    pandalsByStation.set(p.nearestMetroStationId, stationList);
  }

  if (p.bestDays) {
    for (const day of p.bestDays) {
      const dayList = pandalsByDay.get(day) ?? [];
      dayList.push(p);
      pandalsByDay.set(day, dayList);
    }
  }
}

// --- Food data & indexes ---

export const allFood = loadJSON<FoodEntity>('food.json');

export const foodByZone = new Map<string, FoodEntity[]>();
export const foodByCategory = new Map<string, FoodEntity[]>();
export const foodByPriceRange = new Map<string, FoodEntity[]>();
export const foodById = new Map<string, FoodEntity>();

for (const f of allFood) {
  foodById.set(f.id, f);

  const zoneList = foodByZone.get(f.zone) ?? [];
  zoneList.push(f);
  foodByZone.set(f.zone, zoneList);

  const catList = foodByCategory.get(f.category) ?? [];
  catList.push(f);
  foodByCategory.set(f.category, catList);

  const priceList = foodByPriceRange.get(f.priceRange) ?? [];
  priceList.push(f);
  foodByPriceRange.set(f.priceRange, priceList);
}

// --- Metro station data (extracted from GeoJSON) ---

interface GeoJSONFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: number[] | number[][] };
}

interface GeoJSONCollection {
  type: string;
  features: GeoJSONFeature[];
}

const metroGeoJSON = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'metro-lines.geojson'), 'utf-8')
) as GeoJSONCollection;

export const allStations: MetroStationEntity[] = metroGeoJSON.features
  .filter((f) => f.geometry.type === 'Point')
  .map((f) => ({
    id: f.properties['id'] as string,
    name: f.properties['name'] as string,
    lineId: f.properties['lineId'] as string,
    lineName: f.properties['lineName'] as string,
    lineColorHex: f.properties['lineColorHex'] as string,
    lat: (f.geometry.coordinates as number[])[1],
    lng: (f.geometry.coordinates as number[])[0],
    zone: f.properties['zone'] as PandalEntity['zone'],
    isInterchange: (f.properties['isInterchange'] as boolean) ?? false,
  }));

export const stationById = new Map<string, MetroStationEntity>();
for (const s of allStations) {
  stationById.set(s.id, s);
}

// --- Summary ---
console.log(
  `[data-loader] Loaded ${allPandals.length} pandals, ${allFood.length} food spots, ${allStations.length} stations`
);
