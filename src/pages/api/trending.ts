import type { APIRoute } from 'astro';
import { getTrendingEntities } from '../../../server/lib/trending.js';

export const GET: APIRoute = async () => {
  const trending = getTrendingEntities(10);
  return new Response(JSON.stringify({ data: trending }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
