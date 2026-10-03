import type { Zone } from '../schemas';

/**
 * Unified marker item for both map engines.
 */
export interface MarkerItem {
  id: string;
  type: 'pandal' | 'food' | 'station';
  name: string;
  lat: number;
  lng: number;
  zone?: Zone;
  icon?: string;
  color?: string;
}

/**
 * IMapAdapter — abstract contract for all map rendering backends.
 * UI code talks to this interface exclusively, enabling seamless
 * swapping between MapLibre GL (WebGL2) and Leaflet (2D canvas).
 */
export interface IMapAdapter {
  /** Initialize the map inside a DOM container. */
  init(container: HTMLElement, options: { center: [number, number]; zoom: number }): Promise<void>;

  /** Render an array of markers with a unified click handler. */
  renderMarkers(items: MarkerItem[], onClick: (id: string, type: 'pandal' | 'food' | 'station') => void): void;

  /** Clear all currently rendered markers. */
  clearMarkers(): void;

  /** Render Kolkata Metro lines from GeoJSON data. */
  renderMetroLines(geoJson: GeoJSON.FeatureCollection): void;

  /** Toggle metro overlay visibility. */
  toggleMetroOverlay(visible: boolean): void;

  /** Highlight a specific zone with a colored polygon overlay. */
  highlightZone(zone: Zone): void;

  /** Clear all zone highlights. */
  clearZoneHighlights(): void;

  /** Smoothly fly the camera to coordinates. */
  flyTo(coords: [number, number], zoom?: number): void;

  /** Get current zoom level. */
  getZoom(): number;

  /** Register a callback for zoom change events. */
  onZoomChange(callback: (zoom: number) => void): void;

  /** Resize the map (call after container dimension changes). */
  resize(): void;

  /** Destroy the map instance and free resources. */
  destroy(): void;
}

/**
 * Zone color palette used across all map engines.
 */
export const ZONE_COLORS: Record<Zone, string> = {
  NORTH: '#3B82F6',   // Electric Blue
  SOUTH: '#10B981',   // Emerald Green
  CENTRAL: '#EF4444', // Crimson Red
  EAST: '#F59E0B',    // Amber Orange
  WEST: '#8B5CF6',    // Purple
};

/**
 * Metro line identity colors.
 */
export const METRO_LINE_COLORS: Record<string, string> = {
  BLUE: '#38BDF8',   // Vibrant Sky Blue (Line 1)
  GREEN: '#4ADE80',  // Vibrant Mint Green (Line 2)
  PURPLE: '#C084FC', // Vibrant Lavender Purple (Line 3)
  ORANGE: '#FB923C', // Vibrant Neon Orange (Line 6)
};

/**
 * Detect WebGL2 availability for engine selection.
 */
export function isWebGL2Available(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

/**
 * Factory: create the best available map adapter.
 * Returns MapLibre (WebGL2) if supported, otherwise falls back to Leaflet (2D).
 */
export async function createMapAdapter(): Promise<IMapAdapter> {
  if (isWebGL2Available()) {
    const { MapLibreDriver } = await import('./MapLibreDriver');
    return new MapLibreDriver();
  } else {
    const { LeafletDriver } = await import('./LeafletDriver');
    return new LeafletDriver();
  }
}
