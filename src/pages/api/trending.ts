import type { APIRoute } from 'astro';
import { getTrendingScores } from '../../../server/lib/trending.js';
import { allPandals, allFood } from '../../../server/lib/data-loader.js';

export const GET: APIRoute = async () => {
  const scores = getTrendingScores(10);
  
  const enriched = scores.map(s => {
    let type: 'pandal' | 'food' = 'pandal';
    let entity: any = allPandals.find(p => p.id === s.entityId);
    
    if (!entity) {
      entity = allFood.find(f => f.id === s.entityId);
      type = 'food';
    }
    
    return {
      entityId: s.entityId,
      score: s.score,
      type,
      name: entity?.name || 'Unknown',
      data: entity
    };
  }).filter(e => e.data);

  return new Response(JSON.stringify({ data: enriched }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
