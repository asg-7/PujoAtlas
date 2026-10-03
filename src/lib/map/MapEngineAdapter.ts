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

  /** Set active zone with dimming/translucent effect for non-active zones. */
  setActiveZone(zone: Zone | 'ALL'): void;

  /** Smoothly frame/fit bounds of the active zone. */
  fitZone(zone: Zone | 'ALL'): void;

  /** Toggle individual layer visibility (pandals, food, metro). */
  toggleLayer(layer: 'pandals' | 'food' | 'metro', visible: boolean): void;

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
 * Zone color palette matching Kolkata reference map.
 */
export const ZONE_COLORS: Record<Zone, string> = {
  NORTH: '#A855F7',   // Vibrant Purple (Bagbazar, Shyambazar, Kumartuli)
  SOUTH: '#EAB308',   // Vibrant Warm Gold (Gariahat, Ballygunge, Kalighat)
  CENTRAL: '#EF4444', // Vibrant Coral Red (College Sq, Bowbazar, Md Ali Park)
  EAST: '#38BDF8',    // Vibrant Sky Blue (Salt Lake, Lake Town, EM Bypass)
  WEST: '#14B8A6',    // Vibrant Teal (Behala, Howrah, Khidderpore)
};

/**
 * Metro line identity colors.
 */
export const METRO_LINE_COLORS: Record<string, string> = {
  BLUE: '#38BDF8',   // Blue Line (Line 1 - North-South)
  GREEN: '#22C55E',  // Green Line (Line 2 - East-West)
  PURPLE: '#C084FC', // Purple Line (Line 3 - Joka-Majerhat)
  ORANGE: '#FB923C', // Orange Line (Line 6 - New Garia to Beleghata)
  YELLOW: '#FACC15', // Yellow Line (Line 4 - Airport Link)
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
