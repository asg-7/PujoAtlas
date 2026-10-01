import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { allPandals, allFood, allStations } from '../lib/data-loader.js';

const NearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  r: z.coerce.number().min(1).max(50000).default(2000), // radius in meters, default 2km
  type: z.enum(['pandal', 'food', 'station', 'all']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Haversine formula: calculates great-circle distance between two points on Earth.
 * Returns distance in meters.
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

interface NearbyResult {
  id: string;
  name: string;
  type: 'pandal' | 'food' | 'station';
  lat: number;
  lng: number;
  distanceMeters: number;
  data: unknown;
}

export async function nearbyRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/nearby', async (request, reply) => {
    const parsed = NearbyQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.issues,
      });
    }

    const { lat, lng, r, type, limit } = parsed.data;

    const results: NearbyResult[] = [];

    // Search pandals
    if (type === 'all' || type === 'pandal') {
      for (const p of allPandals) {
        const dist = haversineDistance(lat, lng, p.lat, p.lng);
        if (dist <= r) {
          results.push({
            id: p.id,
            name: p.name,
            type: 'pandal',
            lat: p.lat,
            lng: p.lng,
            distanceMeters: Math.round(dist),
            data: p,
          });
        }
      }
    }

    // Search food spots
    if (type === 'all' || type === 'food') {
      for (const f of allFood) {
        const dist = haversineDistance(lat, lng, f.lat, f.lng);
        if (dist <= r) {
          results.push({
            id: f.id,
            name: f.name,
            type: 'food',
            lat: f.lat,
            lng: f.lng,
            distanceMeters: Math.round(dist),
            data: f,
          });
        }
      }
    }

    // Search metro stations
    if (type === 'all' || type === 'station') {
      for (const s of allStations) {
        const dist = haversineDistance(lat, lng, s.lat, s.lng);
        if (dist <= r) {
          results.push({
            id: s.id,
            name: s.name,
            type: 'station',
            lat: s.lat,
            lng: s.lng,
            distanceMeters: Math.round(dist),
            data: s,
          });
        }
      }
    }

    // Sort by distance ascending
    results.sort((a, b) => a.distanceMeters - b.distanceMeters);

    const limited = results.slice(0, limit);

    return reply.send({
      count: limited.length,
      totalInRadius: results.length,
      centerLat: lat,
      centerLng: lng,
      radiusMeters: r,
      data: limited,
    });
  });
}
