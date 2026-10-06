/**
 * Distance & Route calculations (Haversine formula & Nearest Neighbor TSP).
 */

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number, lang: 'en' | 'bn' = 'en'): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return lang === 'bn' ? `${meters} মি` : `${meters}m`;
  }
  return lang === 'bn' ? `${km.toFixed(1)} কিমি` : `${km.toFixed(1)} km`;
}

export function estimateWalkingMinutes(km: number): number {
  // Average city walking speed during Puja: ~4.0 km/h (allowing for crowds)
  return Math.round((km / 4.0) * 60);
}

/**
 * Optimize multi-stop itinerary using nearest neighbor heuristic.
 */
export function optimizeRouteOrder<T extends { lat: number; lng: number }>(
  items: T[],
  startCoords?: { lat: number; lng: number }
): T[] {
  if (items.length <= 2) return items;

  const unvisited = [...items];
  const route: T[] = [];

  // Start with closest to startCoords if provided, else first item
  let currentPos = startCoords && startCoords.lat > 20
    ? startCoords
    : { lat: items[0].lat, lng: items[0].lng };

  while (unvisited.length > 0) {
    let bestIdx = 0;
    let minDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateDistanceKm(currentPos.lat, currentPos.lng, unvisited[i].lat, unvisited[i].lng);
      if (d < minDist) {
        minDist = d;
        bestIdx = i;
      }
    }

    const next = unvisited.splice(bestIdx, 1)[0];
    route.push(next);
    currentPos = { lat: next.lat, lng: next.lng };
  }

  return route;
}
