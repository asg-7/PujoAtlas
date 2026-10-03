/**

/**
 * Google Maps outbound navigation deep-link engine.
 * Generates verified external navigation URLs and triggers analytics tracking.
 */

export type TravelMode = 'driving' | 'transit' | 'walking' | 'bicycling';

const GOOGLE_MAPS_DIR_BASE = 'https://www.google.com/maps/dir/?api=1';

/**
 * Build a Google Maps directions URL for a given destination and travel mode.
 * Supports verified landmark query string or precise GPS coordinates.
 */
export function buildGoogleMapsUrl(
  lat: number,
  lng: number,
  mode: TravelMode = 'driving',
  name?: string,
  address?: string
): string {
  if (name) {
    const query = `${name}, ${address || 'Kolkata'}`;
    return `${GOOGLE_MAPS_DIR_BASE}&destination=${encodeURIComponent(query)}&travelmode=${mode}`;
  }
  return `${GOOGLE_MAPS_DIR_BASE}&destination=${lat},${lng}&travelmode=${mode}`;
}

/**
 * Build a Google Maps directions URL targeting exact geocoded coordinates.
 */
export function buildGoogleMapsCoordsUrl(
  lat: number,
  lng: number,
  mode: TravelMode = 'driving'
): string {
  return `${GOOGLE_MAPS_DIR_BASE}&destination=${lat},${lng}&travelmode=${mode}`;
}

/**
 * Build a Google Maps place URL (opens verified location pin/search directly).
 */
export function buildGoogleMapsPlaceUrl(lat: number, lng: number, name?: string, address?: string): string {
  const query = name ? `${name} ${address || ''} Kolkata` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
}

/**
 * All available navigation options for a destination.
 */
export interface NavigationOptions {
  driving: string;
  transit: string;
  walking: string;
  bicycling: string;
  place: string;
}

/**
 * Get all navigation URLs for a destination.
 */
export function getNavigationUrls(lat: number, lng: number, name?: string, address?: string): NavigationOptions {
  return {
    driving: buildGoogleMapsUrl(lat, lng, 'driving', name, address),
    transit: buildGoogleMapsUrl(lat, lng, 'transit', name, address),
    walking: buildGoogleMapsUrl(lat, lng, 'walking', name, address),
    bicycling: buildGoogleMapsUrl(lat, lng, 'bicycling', name, address),
    place: buildGoogleMapsPlaceUrl(lat, lng, name, address),
  };
}

/**
 * Open Google Maps navigation in a new tab and log the click to the backend.
 * On mobile, this will trigger the native Google Maps app.
 */
export async function navigateToDestination(
  entityId: string,
  lat: number,
  lng: number,
  mode: TravelMode = 'transit',
  apiBase = ''
): Promise<void> {
  const url = buildGoogleMapsUrl(lat, lng, mode);

  // Fire analytics ping (non-blocking)
  try {
    fetch(`${apiBase}/api/navigate/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityId }),
    }).catch(() => {
      // Silently fail — navigation UX is more important than analytics
    });
  } catch {
    // Ignore analytics failures
  }

  // Open in new tab (triggers native app on mobile)
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Travel mode metadata for UI rendering.
 */
export const TRAVEL_MODE_META: Record<
  TravelMode,
  { label: string; icon: string; description: string }
> = {
  driving: {
    label: 'Drive',
    icon: '🚗',
    description: 'Car / Cab / Auto',
  },
  transit: {
    label: 'Metro & Bus',
    icon: '🚇',
    description: 'Kolkata Metro & Public Transit',
  },
  walking: {
    label: 'Walk',
    icon: '🚶',
    description: 'On foot',
  },
  bicycling: {
    label: 'Cycle',
    icon: '🚲',
    description: 'Bicycle route',
  },
};
