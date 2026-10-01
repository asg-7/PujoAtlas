import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import {
  allPandals,
  pandalsByZone,
  pandalsByStation,
  pandalsByDay,
} from '../lib/data-loader.js';

const PandalQuerySchema = z.object({
  zone: z.enum(['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'WEST']).optional(),
  metroStation: z.string().optional(),
  bestDay: z
    .enum(['Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami'])
    .optional(),
  isFamous: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  q: z.string().optional(),
});

export async function pandalRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/pandals', async (request, reply) => {
    const parsed = PandalQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.issues,
      });
    }

    const { zone, metroStation, bestDay, isFamous, q } = parsed.data;

    let results = allPandals;

    // Apply zone index
    if (zone) {
      results = pandalsByZone.get(zone) ?? [];
    }

    // Apply metro station index
    if (metroStation) {
      const stationResults = pandalsByStation.get(metroStation) ?? [];
      const stationSet = new Set(stationResults.map((p) => p.id));
      results = results.filter((p) => stationSet.has(p.id));
    }

    // Apply bestDay index
    if (bestDay) {
      const dayResults = pandalsByDay.get(bestDay) ?? [];
      const daySet = new Set(dayResults.map((p) => p.id));
      results = results.filter((p) => daySet.has(p.id));
    }

    // Apply isFamous filter
    if (isFamous !== undefined) {
      results = results.filter((p) => p.isFamous === isFamous);
    }

    // Apply text search (name, address, tags)
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return reply.send({ count: results.length, data: results });
  });
}
