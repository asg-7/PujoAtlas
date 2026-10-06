/**
 * bonediIcons.ts — Distinct iconography for Pandals, Food, and Metro.
 *
 * Differentiate markers by SHAPE, not hue (WCAG 2.2 AA Color Deficiency Compliant):
 *   - Trending : --kumkum (#C8432E) fill + Flame icon (Circle pin with flame)
 *   - Featured : --marigold (#E8961E) fill + Star icon (Hexagon pin with star)
 *   - Heritage : --haldi (#C9A227) fill + Arch icon (Arched gate pin with colonnade)
 *   - Saved    : --neel (#1E3A5F) fill + Bookmark icon (Shield pin with bookmark)
 *   - Regular  : Zone color + Pointed arch pin
 *   - Food     : Steaming katori badge
 *   - Metro    : Rounded square train sign
 */
import type { Map } from 'maplibre-gl';

/* 1. Trending Marker: --kumkum (#C8432E) fill + Flame icon */
export const trendingSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#241C19" stroke="#241C19" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#C8432E" stroke="#FAF6F1" stroke-width="2.4" stroke-linejoin="round"/>
<!-- Flame glyph -->
<path d="M24 13 C24 13 28 18 28 22 C28 24.2 26.2 26 24 26 C21.8 26 20 24.2 20 22 C20 18 24 13 24 13 Z" fill="#FAF6F1"/>
<path d="M24 19 C24 19 26 21.5 26 23.5 C26 24.6 25.1 25.5 24 25.5 C22.9 25.5 22 24.6 22 23.5 C22 21.5 24 19 24 19 Z" fill="#E8961E"/>
<circle cx="24" cy="31" r="2" fill="#FAF6F1"/>
</svg>`;

/* 2. Featured Marker: --marigold (#E8961E) fill + Star icon in Hexagon */
export const featuredSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#241C19" stroke="#241C19" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#E8961E" stroke="#FAF6F1" stroke-width="2.4" stroke-linejoin="round"/>
<!-- Star glyph -->
<polygon points="24,14 27,20.5 34,21.5 29,26.5 30.5,33.5 24,30 17.5,33.5 19,26.5 14,21.5 21,20.5" fill="#FAF6F1"/>
</svg>`;

/* 3. Heritage Marker: --haldi (#C9A227) fill + Arch colonnade icon */
export const heritageSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#241C19" stroke="#241C19" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#C9A227" stroke="#FAF6F1" stroke-width="2.4" stroke-linejoin="round"/>
<!-- Arch & Pillar glyph -->
<g fill="none" stroke="#FAF6F1" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
<path d="M15 17 H33"/>
<path d="M17 17 V33 M31 17 V33"/>
<path d="M14 33 H34"/>
<path d="M17 23 C17 19.5 31 19.5 31 23"/>
</g>
<circle cx="24" cy="14" r="1.8" fill="#FAF6F1"/>
</svg>`;

/* 4. Saved Marker: --neel (#1E3A5F) fill + Bookmark icon */
export const savedSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#241C19" stroke="#241C19" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#1E3A5F" stroke="#FAF6F1" stroke-width="2.4" stroke-linejoin="round"/>
<!-- Bookmark ribbon glyph -->
<path d="M17 15 H31 V32 L24 27 L17 32 Z" fill="#FAF6F1" stroke="#FAF6F1" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

/* 5. Standard Pandal Bangla Chala Pin */
export const pandalSvg = (fill: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="58" viewBox="0 0 48 58">
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#241C19" stroke="#241C19" stroke-width="4" stroke-linejoin="round"/>
<path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="${fill}" stroke="#FAF6F1" stroke-width="2.4" stroke-linejoin="round"/>
<g fill="none" stroke="#FAF6F1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<path d="M12.5 27.5 C18.5 26 22 19.5 24 14.5 C26 19.5 29.5 26 35.5 27.5"/>
<path d="M17 28 V37.5 M31 28 V37.5 M12.5 38 H35.5"/>
<path d="M21.6 38 V33.5 Q24 30.6 26.4 33.5 V38"/>
</g>
<circle cx="24" cy="11.6" r="1.9" fill="#FAF6F1"/>
</svg>`;

/* 6. Food Steaming Katori Badge */
export const foodSvg = (fill: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
<circle cx="24" cy="24" r="22" fill="#241C19"/>
<circle cx="24" cy="24" r="19.6" fill="${fill}" stroke="#FAF6F1" stroke-width="2.4"/>
<path d="M12.2 26.5 H35.8 C35.8 33.8 30.6 38.6 24 38.6 C17.4 38.6 12.2 33.8 12.2 26.5 Z" fill="#FAF6F1" stroke="#FAF6F1" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M18.6 41 H29.4" stroke="#FAF6F1" stroke-width="2.4" stroke-linecap="round" fill="none"/>
<g fill="none" stroke="#FAF6F1" stroke-width="2.3" stroke-linecap="round">
<path d="M17.6 22.2 C15.4 19.8 19.8 17.8 17.6 15"/>
<path d="M24 22.2 C21.8 19.6 26.2 17.4 24 14"/>
<path d="M30.4 22.2 C28.2 19.8 32.6 17.8 30.4 15"/>
</g>
</svg>`;

/* 7. Metro Station Rounded-Square Train Sign */
export const metroSvg = (fill = '#1E3A5F') => `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
<rect x="2" y="2" width="44" height="44" rx="12" fill="#241C19"/>
<rect x="4.4" y="4.4" width="39.2" height="39.2" rx="10" fill="${fill}" stroke="#FAF6F1" stroke-width="2.4"/>
<g fill="none" stroke="#FAF6F1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<rect x="14.5" y="10.5" width="19" height="23" rx="5.5"/>
<path d="M17.5 39 L21 34 M30.5 39 L27 34"/>
</g>
<rect x="18.2" y="15" width="11.6" height="6.4" rx="1.6" fill="#FAF6F1"/>
<circle cx="19.4" cy="28.3" r="1.9" fill="#FAF6F1"/><circle cx="28.6" cy="28.3" r="1.9" fill="#FAF6F1"/>
</svg>`;

/**
 * Converts SVG to crisp 2x ImageData and registers into MapLibre sprite atlas.
 */
export async function addSvg(map: Map, id: string, svg: string, width = 48, height = 48): Promise<void> {
  if (map.hasImage(id)) return;
  if (typeof window === 'undefined') return;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width * 2;
        canvas.height = height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width * 2, height * 2);
          const imgData = ctx.getImageData(0, 0, width * 2, height * 2);
          if (!map.hasImage(id)) {
            map.addImage(id, imgData, { pixelRatio: 2 });
          }
        }
      } catch (err) {
        console.warn('Error adding image to map:', id, err);
      }
      resolve();
    };
    img.onerror = () => {
      console.warn('Failed to load SVG icon:', id);
      resolve();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

export async function registerBonediIcons(
  map: Map,
  zones: Record<string, { colour?: string; color?: string }>
): Promise<void> {
  const jobs: Promise<void>[] = [
    // 4 Distinct Shape-Carrying Markers
    addSvg(map, 'pandal-trending', trendingSvg(), 48, 58),
    addSvg(map, 'pandal-featured', featuredSvg(), 48, 58),
    addSvg(map, 'pandal-heritage', heritageSvg(), 48, 58),
    addSvg(map, 'pandal-saved', savedSvg(), 48, 58),

    // Base types
    addSvg(map, 'metro-station', metroSvg(), 48, 48),
    addSvg(map, 'metro-station-interchange', metroSvg('#1E3A5F'), 48, 48),
    addSvg(map, 'pandal-default', pandalSvg('#A85B3C'), 48, 58),
    addSvg(map, 'food-default', foodSvg('#A85B3C'), 48, 48),
  ];

  for (const [key, z] of Object.entries(zones)) {
    const col = z.colour || z.color || '#A85B3C';
    jobs.push(addSvg(map, `pandal-${key}`, pandalSvg(col), 48, 58));
    jobs.push(addSvg(map, `pandal-${key.toLowerCase()}`, pandalSvg(col), 48, 58));
    jobs.push(addSvg(map, `pandal-${key.toUpperCase()}`, pandalSvg(col), 48, 58));

    jobs.push(addSvg(map, `food-${key}`, foodSvg(col), 48, 48));
    jobs.push(addSvg(map, `food-${key.toLowerCase()}`, foodSvg(col), 48, 48));
    jobs.push(addSvg(map, `food-${key.toUpperCase()}`, foodSvg(col), 48, 48));
  }

  await Promise.all(jobs);
}

/**
 * Add custom SVG icon layers (Arch Pins, Food Katori Badges, Metro Signs).
 */
export function upgradeToIcons(
  map: Map,
  opts: { onSelect?: (id: string, type: 'pandal' | 'food' | 'station') => void } = {}
): void {
  const labelsAbove = map.getLayer('metro-station-labels') ? 'metro-station-labels' : undefined;

  // 1. Pandal Arch Pins with Shape Differentiation
  if (!map.getLayer('pandal-pins') && map.getSource('pandals-src')) {
    map.addLayer(
      {
        id: 'pandal-pins',
        type: 'symbol',
        source: 'pandals-src',
        minzoom: 10.5,
        layout: {
          'icon-image': [
            'case',
            ['boolean', ['get', 'isSaved'], false],
            'pandal-saved',
            ['boolean', ['get', 'isFeatured'], false],
            'pandal-featured',
            ['boolean', ['get', 'isHeritage'], false],
            'pandal-heritage',
            ['boolean', ['get', 'isFamous'], false],
            'pandal-trending',
            ['coalesce', ['image', ['concat', 'pandal-', ['downcase', ['get', 'zone']]]], ['image', 'pandal-default']],
          ],
          'icon-anchor': 'bottom',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11, 0.45,
            13, 0.65,
            15, 0.90,
            18, 1.25,
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13.5, 10,
            16, 12,
            18, 14,
          ],
          'text-anchor': 'top',
          'text-offset': [0, 0.4],
          'text-optional': true,
        },
        paint: {
          'text-color': '#FAF6F1',
          'text-halo-color': '#16100E',
          'text-halo-width': 2,
        },
      },
      labelsAbove
    );
  }

  // 2. Food Badges
  if (!map.getLayer('food-badges') && map.getSource('food-src')) {
    map.addLayer(
      {
        id: 'food-badges',
        type: 'symbol',
        source: 'food-src',
        minzoom: 11.0,
        layout: {
          'icon-image': [
            'coalesce',
            ['image', ['concat', 'food-', ['downcase', ['get', 'zone']]]],
            ['image', 'food-default'],
          ],
          'icon-anchor': 'center',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11, 0.40,
            13, 0.58,
            15, 0.80,
            18, 1.10,
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-anchor': 'top',
          'text-offset': [0, 1.2],
          'text-optional': true,
        },
        paint: {
          'text-color': '#FAF6F1',
          'text-halo-color': '#16100E',
          'text-halo-width': 2,
        },
      },
      labelsAbove
    );
  }

  // 3. Metro Signs
  if (!map.getLayer('metro-icons') && map.getSource('metro-stations-src')) {
    map.addLayer(
      {
        id: 'metro-icons',
        type: 'symbol',
        source: 'metro-stations-src',
        minzoom: 11.5,
        layout: {
          'icon-image': 'metro-station',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            11.5, 0.45,
            14, 0.70,
            16, 0.90,
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
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
    map.setPaintProperty('pandal-pins', 'icon-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.22] as any));
    map.setPaintProperty('pandal-pins', 'text-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.22] as any));
    map.setLayoutProperty('pandal-pins', 'symbol-sort-key', isAll ? 0 : (['case', matchZone, 1, 0] as any));
  }

  if (map.getLayer('food-badges')) {
    map.setPaintProperty('food-badges', 'icon-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.22] as any));
    map.setPaintProperty('food-badges', 'text-opacity', isAll ? 1.0 : (['case', matchZone, 1.0, 0.22] as any));
    map.setLayoutProperty('food-badges', 'symbol-sort-key', isAll ? 0 : (['case', matchZone, 1, 0] as any));
  }
}
