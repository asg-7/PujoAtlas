import fs from 'fs';

const zonesRaw = fs.readFileSync('src/data/zones.geojson', 'utf-8');
const zones = JSON.parse(zonesRaw);

console.log('Zones GeoJSON features count:', zones.features.length);
if (zones.type !== 'FeatureCollection' || zones.features.length !== 5) {
  console.error('Invalid zones GeoJSON!');
  process.exit(1);
}

const metroRaw = fs.readFileSync('src/data/metro-lines.geojson', 'utf-8');
const metro = JSON.parse(metroRaw);

console.log('Metro GeoJSON features count:', metro.features.length);
if (metro.type !== 'FeatureCollection' || metro.features.length < 10) {
  console.error('Invalid metro GeoJSON!');
  process.exit(1);
}

console.log('GeoJSON validation: PASS');
