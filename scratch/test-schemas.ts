import { PandalSchema, FoodSchema, MetroLineSchema, ZoneEntitySchema } from '../src/lib/schemas.js';

// Test Valid Pandal
const validPandal = {
  id: 'pandal-01',
  name: 'Bagbazar Sarbojanin',
  zone: 'NORTH',
  address: 'Bagbazar, Kolkata',
  lat: 22.602,
  lng: 88.368,
  nearestMetroStationId: 'station-shyambazar',
  bestTimeToVisit: ['Saptami 4 AM - 7 AM (Low Crowd)'],
  bestDays: ['Saptami', 'Ashtami'],
  isFamous: true,
  tags: ['Traditional', 'Historical'],
  sourceUrls: [{ platform: 'instagram', url: 'https://instagram.com/p/123' }],
};

const parsedPandal = PandalSchema.safeParse(validPandal);
console.log('Valid Pandal test:', parsedPandal.success ? 'PASS' : parsedPandal.error);

// Test Invalid Pandal (invalid zone)
const invalidPandal = { ...validPandal, zone: 'INVALID_ZONE' };
const parsedInvalid = PandalSchema.safeParse(invalidPandal);
console.log('Invalid Pandal test:', !parsedInvalid.success ? 'PASS (Failed as expected)' : 'FAIL');

if (!parsedPandal.success || parsedInvalid.success) {
  process.exit(1);
}
