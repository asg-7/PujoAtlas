import type { APIRoute } from 'astro';
import { allPandals, pandalsByZone, pandalsByStation, pandalsByDay } from '../../../server/lib/data-loader.js';
import type { Zone } from '../../lib/schemas';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const zone = url.searchParams.get('zone') as Zone | null;
  const metroStation = url.searchParams.get('metroStation');
  const bestDay = url.searchParams.get('bestDay');
  const isFamousStr = url.searchParams.get('isFamous');
  const q = url.searchParams.get('q');

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
  if (isFamousStr !== null) {
    const isFamous = isFamousStr === 'true';
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

  return new Response(JSON.stringify({ count: results.length, data: results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
