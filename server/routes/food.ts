import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { allFood, foodByZone, foodByCategory, foodByPriceRange } from '../lib/data-loader.js';

const FoodQuerySchema = z.object({
  zone: z.enum(['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'WEST']).optional(),
  category: z.enum(['RESTAURANT', 'CAFE', 'DHABA', 'STREET_FOOD', 'SWEETS']).optional(),
  priceRange: z.enum(['BUDGET', 'MID_RANGE', 'PREMIUM']).optional(),
  isMidnightOpen: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  q: z.string().optional(),
});

export async function foodRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/food', async (request, reply) => {
    const parsed = FoodQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.issues,
      });
    }

    const { zone, category, priceRange, isMidnightOpen, q } = parsed.data;

    let results = allFood;

    // Apply zone index
    if (zone) {
      results = foodByZone.get(zone) ?? [];
    }

    // Apply category index
    if (category) {
      const catResults = foodByCategory.get(category) ?? [];
      const catSet = new Set(catResults.map((f) => f.id));
      results = results.filter((f) => catSet.has(f.id));
    }

    // Apply priceRange index
    if (priceRange) {
      const priceResults = foodByPriceRange.get(priceRange) ?? [];
      const priceSet = new Set(priceResults.map((f) => f.id));
      results = results.filter((f) => priceSet.has(f.id));
    }

    // Apply late-night / midnight filter
    if (isMidnightOpen !== undefined) {
      results = results.filter((f) => f.isLateNight === isMidnightOpen);
    }

    // Apply text search (name, famousFor, mustTryDishes)
    if (q) {
      const query = q.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.famousFor.some((d) => d.toLowerCase().includes(query)) ||
          f.mustTryDishes.some((d) => d.toLowerCase().includes(query))
      );
    }

    return reply.send({ count: results.length, data: results });
  });
}
