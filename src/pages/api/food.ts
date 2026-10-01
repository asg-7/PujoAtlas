import type { APIRoute } from 'astro';
import { allFood, foodByCategory } from '../../../server/lib/data-loader.js';
import type { Zone } from '../../lib/schemas';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const zone = url.searchParams.get('zone') as Zone | null;
  const metroStation = url.searchParams.get('metroStation');
  const category = url.searchParams.get('category');
  const isLateNightStr = url.searchParams.get('isLateNight');
  const q = url.searchParams.get('q');

  let results = allFood;

  if (category) {
    results = foodByCategory.get(category) ?? [];
  }

  if (zone) {
    results = results.filter((f) => f.zone === zone);
  }

  if (metroStation) {
    results = results.filter((f) => f.nearestMetroStationId === metroStation);
  }

  if (isLateNightStr !== null) {
    const isLateNight = isLateNightStr === 'true';
    results = results.filter((f) => f.isLateNight === isLateNight);
  }

  if (q) {
    const query = q.toLowerCase();
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.address.toLowerCase().includes(query) ||
        f.famousFor.some((dish) => dish.toLowerCase().includes(query)) ||
        f.mustTryDishes.some((dish) => dish.toLowerCase().includes(query))
    );
  }

  return new Response(JSON.stringify({ count: results.length, data: results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
