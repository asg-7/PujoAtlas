/**
 * bonediIcons.ts — Distinct iconography for Pandals, Food, and Metro.
 *
 * Three silhouettes so layers never get confused, even in greyscale or at 24px:
 *   pandal = pointed-arch PIN with a curved-eave (bangla chala) roof, zone colour
 *   food   = round BADGE with a steaming katori, zone colour
 *   metro  = rounded-SQUARE station sign with a train front, indigo
 * Each has an ink outer edge + cream inner ring so it stays visible on both the chalk and night maps.
 */
import type { Map } from 'maplibre-gl';

export const pandalSvg = (fill: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#2A2622" stroke="#2A2622" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="${fill}" stroke="#F8F5EE" stroke-width="2.4" stroke-linejoin="round"/>
<g fill="none" stroke="#F8F5EE" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
<path d="M12.5 27.5 C18.5 26 22 19.5 24 14.5 C26 19.5 29.5 26 35.5 27.5"/>
<path d="M17 28 V37.5 M31 28 V37.5 M12.5 38 H35.5"/>
<path d="M21.6 38 V33.5 Q24 30.6 26.4 33.5 V38"/>
</g>
<circle cx="24" cy="11.6" r="1.9" fill="#F8F5EE"/>
</svg>`;

export const foodSvg = (fill: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
<circle cx="24" cy="24" r="22" fill="#2A2622"/>
<circle cx="24" cy="24" r="19.6" fill="${fill}" stroke="#F8F5EE" stroke-width="2.4"/>
<path d="M12.2 26.5 H35.8 C35.8 33.8 30.6 38.6 24 38.6 C17.4 38.6 12.2 33.8 12.2 26.5 Z" fill="#F8F5EE" stroke="#F8F5EE" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M18.6 41 H29.4" stroke="#F8F5EE" stroke-width="2.4" stroke-linecap="round" fill="none"/>
<g fill="none" stroke="#F8F5EE" stroke-width="2.3" stroke-linecap="round">
<path d="M17.6 22.2 C15.4 19.8 19.8 17.8 17.6 15"/>
<path d="M24 22.2 C21.8 19.6 26.2 17.4 24 14"/>
<path d="M30.4 22.2 C28.2 19.8 32.6 17.8 30.4 15"/>
</g>
</svg>`;

export const metroSvg = (fill = '#3D4A5C') => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
<rect x="2" y="2" width="44" height="44" rx="12" fill="#2A2622"/>
<rect x="4.4" y="4.4" width="39.2" height="39.2" rx="10" fill="${fill}" stroke="#F8F5EE" stroke-width="2.4"/>
<g fill="none" stroke="#F8F5EE" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<rect x="14.5" y="10.5" width="19" height="23" rx="5.5"/>
<path d="M17.5 39 L21 34 M30.5 39 L27 34"/>
</g>
<rect x="18.2" y="15" width="11.6" height="6.4" rx="1.6" fill="#F8F5EE"/>
<circle cx="19.4" cy="28.3" r="1.9" fill="#F8F5EE"/><circle cx="28.6" cy="28.3" r="1.9" fill="#F8F5EE"/>
</svg>`;

export async function addSvg(map: Map, id: string, svg: string): Promise<void> {
  if (map.hasImage(id)) return;
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;

  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load SVG icon ${id}`));
  });
  if (!map.hasImage(id)) {
    map.addImage(id, img, { pixelRatio: 2 }); // 48px bitmap → crisp 24px on retina displays
  }
}

export async function registerBonediIcons(
  map: Map,
  zones: Record<string, { colour?: string; color?: string }>
): Promise<void> {
  const jobs: Promise<void>[] = [addSvg(map, 'metro-station', metroSvg())];

  for (const [key, z] of Object.entries(zones)) {
    const col = z.colour || z.color || '#B5513A';
    // Register both uppercase and lowercase keys to ensure no mismatch
    jobs.push(addSvg(map, `pandal-${key}`, pandalSvg(col)));
    jobs.push(addSvg(map, `pandal-${key.toLowerCase()}`, pandalSvg(col)));
    jobs.push(addSvg(map, `pandal-${key.toUpperCase()}`, pandalSvg(col)));

    jobs.push(addSvg(map, `food-${key}`, foodSvg(col)));
    jobs.push(addSvg(map, `food-${key.toLowerCase()}`, foodSvg(col)));
    jobs.push(addSvg(map, `food-${key.toUpperCase()}`, foodSvg(col)));
  }

  await Promise.all(jobs);
}

/**
 * Swap dots → pins at close zoom, add steaming food katori badges, add station signs.
 */
export function upgradeToIcons(
  map: Map,
  opts: { onSelect?: (id: string, type: 'pandal' | 'food' | 'station') => void } = {}
): void {
  const labelsAbove = map.getLayer('metro-station-labels') ? 'metro-station-labels' : undefined;

  // 1. Pandal Dots: Visible up to zoom 14.5
  if (map.getLayer('pandal-dots')) {
    map.setLayerZoomRange('pandal-dots', 0, 14.5);
  }

  // 2. Pandal Pins: Arch pin with Bangla Chala roof glyph at zoom >= 14.2
  if (!map.getLayer('pandal-pins') && map.getSource('pandals-src')) {
    map.addLayer(
      {
        id: 'pandal-pins',
        type: 'symbol',
        source: 'pandals-src',
        minzoom: 14.2,
        layout: {
          'icon-image': ['concat', 'pandal-', ['downcase', ['get', 'zone']]],
          'icon-anchor': 'bottom', // tip sits exactly on the geographic coordinate
          'icon-size': ['interpolate', ['linear'], ['zoom'], 14.2, 0.75, 16, 0.95, 18, 1.25],
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 14.2, 10, 16, 12, 18, 14],
          'text-anchor': 'top',
          'text-offset': [0, 0.4],
          'text-optional': true,
        },
        paint: {
          'text-color': '#EDE6D6',
          'text-halo-color': '#181512',
          'text-halo-width': 2,
        },
      },
      labelsAbove
    );
  }

  // 3. Food Badges: Distinct round katori badges
  if (map.getLayer('food-dots')) {
    map.setLayerZoomRange('food-dots', 0, 14.0);
  }

  if (!map.getLayer('food-badges') && map.getSource('food-src')) {
    map.addLayer(
      {
        id: 'food-badges',
        type: 'symbol',
        source: 'food-src',
        minzoom: 13.8,
        layout: {
          'icon-image': ['concat', 'food-', ['downcase', ['get', 'zone']]],
          'icon-anchor': 'center',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 13.8, 0.65, 16, 0.85, 18, 1.1],
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-anchor': 'top',
          'text-offset': [0, 1.2],
          'text-optional': true,
        },
        paint: {
          'text-color': '#EDE6D6',
          'text-halo-color': '#181512',
          'text-halo-width': 2,
        },
      },
      labelsAbove
    );
  }

  // 4. Metro Interchange Station Icons (Rounded-Square Station Signs)
  if (!map.getLayer('metro-icons') && map.getSource('metro-stations-src')) {
    map.addLayer(
      {
        id: 'metro-icons',
        type: 'symbol',
        source: 'metro-stations-src',
        minzoom: 13.0,
        filter: ['any', ['==', ['get', 'isInterchange'], true], ['==', ['get', 'interchange'], true]],
        layout: {
          'icon-image': 'metro-station',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 13.0, 0.65, 16, 0.85],
          'icon-allow-overlap': true,
        },
      },
      labelsAbove
    );
  }

  // Event handlers
  map.on('click', 'pandal-pins', (e) => {
    const f = e.features?.[0];
    if (f?.properties?.id) opts.onSelect?.(f.properties.id, 'pandal');
  });

  map.on('click', 'food-badges', (e) => {
    const f = e.features?.[0];
    if (f?.properties?.id) opts.onSelect?.(f.properties.id, 'food');
  });

  ['pandal-pins', 'food-badges', 'metro-icons'].forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });
    }
  });
}

/**
 * Zone dimming for pins and badges — called from setActiveZone(map, zone).
 */
export function dimPins(map: Map, zone: string | null): void {
  const isAll = !zone || zone === 'ALL';
  const matchZone = ['==', ['upcase', ['get', 'zone']], (zone || '').toUpperCase()];

  if (map.getLayer('pandal-pins')) {
    map.setPaintProperty('pandal-pins', 'icon-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.2] as any));
    map.setPaintProperty('pandal-pins', 'text-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.2] as any));
    map.setLayoutProperty('pandal-pins', 'symbol-sort-key', isAll ? 0 : (['case', matchZone, 1, 0] as any));
  }

  if (map.getLayer('food-badges')) {
    map.setPaintProperty('food-badges', 'icon-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.2] as any));
    map.setPaintProperty('food-badges', 'text-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.2] as any));
    map.setLayoutProperty('food-badges', 'symbol-sort-key', isAll ? 0 : (['case', matchZone, 1, 0] as any));
  }
}
