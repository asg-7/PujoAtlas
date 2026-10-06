/**
 * bonediMapSkin.ts — Bonedi-Bari theme skinning, chalchitra pin builder, and zone palette.
 */
import type * as maplibregl from 'maplibre-gl';

export type Theme = 'din' | 'raat';

export const BONEDI_ZONES: Record<string, { label: string; colour: string }> = {
  NORTH:   { label: 'North Kolkata',       colour: '#4A6A8A' }, // Slate Indigo
  SOUTH:   { label: 'South Kolkata',       colour: '#B8892F' }, // Ochre Brass
  CENTRAL: { label: 'Central Kolkata',     colour: '#B5513A' }, // Terracotta Brick
  EAST:    { label: 'East Kolkata',        colour: '#4F8A83' }, // Muted Teal
  HOWRAH:  { label: 'Howrah',              colour: '#7E5A7E' }, // Deep Plum
  OTHERS:  { label: 'Others',              colour: '#C25953' }, // Coral Terracotta
  WEST:    { label: 'Behala / Howrah',     colour: '#7E5A7E' }, // Deep Plum
};

/**
 * Pandal pin in the shape of a traditional Chalchitra (the arched temple backdrop behind the pratima).
 * Registered on the MapLibre instance for high-zoom rendering.
 */
export function addChalchitraPin(map: maplibregl.Map, id: string, fill: string, ring = '#F4EFE4'): void {
  if (map.hasImage(id)) return;
  const w = 36;
  const h = 44;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d');
  if (!g) return;

  g.beginPath();
  g.moveTo(5, h - 3);
  g.lineTo(5, 18);
  g.bezierCurveTo(5, 8, 12, 4, w / 2, 2); // Pointed Arch
  g.bezierCurveTo(w - 12, 4, w - 5, 8, w - 5, 18);
  g.lineTo(w - 5, h - 3);
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  g.lineWidth = 2.5;
  g.strokeStyle = ring;
  g.stroke();

  // Central Dhunuchi / Diya dot
  g.fillStyle = ring;
  g.beginPath();
  g.arc(w / 2, 24, 4, 0, Math.PI * 2);
  g.fill();

  const imgData = g.getImageData(0, 0, w, h);
  map.addImage(id, imgData, { pixelRatio: 2 });
}
