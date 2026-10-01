import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import {
  recordNavigateClick,
  recordSearchClick,
  getTrendingScores,
  initializeScores,
} from '../lib/trending.js';
import { allPandals, allFood, pandalById, foodById } from '../lib/data-loader.js';

const NavigateClickSchema = z.object({
  entityId: z.string(),
});

const SearchClickSchema = z.object({
  clickedId: z.string(),
  viewedIds: z.array(z.string()),
});

const TrendingQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
});

export async function navigateRoutes(app: FastifyInstance): Promise<void> {
  // Initialize all entity scores at baseline on startup
  const allEntityIds = [
    ...allPandals.map((p) => p.id),
    ...allFood.map((f) => f.id),
  ];
  initializeScores(allEntityIds);

  // POST /api/navigate/click — record outbound navigation click
  app.post('/api/navigate/click', async (request, reply) => {
    const parsed = NavigateClickSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsed.error.issues,
      });
    }

    const { entityId } = parsed.data;
    const newScore = recordNavigateClick(entityId);

    return reply.send({ entityId, score: newScore, action: 'navigate_click' });
  });

  // POST /api/search/click — record search result click
  app.post('/api/search/click', async (request, reply) => {
    const parsed = SearchClickSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        details: parsed.error.issues,
      });
    }

    const { clickedId, viewedIds } = parsed.data;
    const newScore = recordSearchClick(clickedId, viewedIds);

    return reply.send({ clickedId, score: newScore, action: 'search_click' });
  });

  // GET /api/trending — get top trending entities
  app.get('/api/trending', async (request, reply) => {
    const parsed = TrendingQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.issues,
      });
    }

    const { limit } = parsed.data;
    const trending = getTrendingScores(limit);

    // Enrich with entity data
    const enriched = trending.map((entry) => {
      const pandal = pandalById.get(entry.entityId);
      const food = foodById.get(entry.entityId);
      const entity = pandal ?? food;

      return {
        entityId: entry.entityId,
        score: entry.score,
        type: pandal ? 'pandal' : food ? 'food' : 'unknown',
        name: entity ? (entity as { name: string }).name : entry.entityId,
        data: entity ?? null,
      };
    });

    return reply.send({ count: enriched.length, data: enriched });
  });
}
