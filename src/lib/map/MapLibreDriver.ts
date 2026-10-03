import * as maplibregl from 'maplibre-gl';
import type { IMapAdapter, MarkerItem } from './MapEngineAdapter';
import { ZONE_COLORS, METRO_LINE_COLORS } from './MapEngineAdapter';
import type { Zone } from '../schemas';
import type { StyleSpecification } from 'maplibre-gl';

const DEFAULT_CARTO_KEY = 'cb1_46w3_1_b8c20a5b160e534febd5654c';
const rawKey = import.meta.env.PUBLIC_CARTO_API_KEY || DEFAULT_CARTO_KEY;
const cartoKey = rawKey ? `?key=${rawKey}` : '';

const DARK_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png${cartoKey}`,
        `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png${cartoKey}`,
        `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png${cartoKey}`
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, © CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

/**
 * MapLibre GL JS driver — high-performance WebGL2 vector map renderer.
 * Hardware-accelerated 60fps rendering with dynamic zone dimming and metro layer.
 */
export class MapLibreDriver implements IMapAdapter {
  private map: maplibregl.Map | null = null;
  private zoomCallbacks: Array<(zoom: number) => void> = [];
  private metroVisible = true;
  private items: MarkerItem[] = [];
  private activeZone: Zone | 'ALL' = 'ALL';
  private hoveredPandalId: string | number | null = null;
  private hoveredFoodId: string | number | null = null;
  private markerClickHandler: ((id: string, type: 'pandal' | 'food' | 'station') => void) | null = null;

  async init(
    container: HTMLElement,
    options: { center: [number, number]; zoom: number }
  ): Promise<void> {
    const initLng = options.center[0] > 50 ? options.center[0] : options.center[1];
    const initLat = options.center[0] > 50 ? options.center[1] : options.center[0];

    this.map = new maplibregl.Map({
      container,
      style: DARK_STYLE,
      center: [initLng, initLat],
      zoom: options.zoom,
      attributionControl: { compact: true },
      maxBounds: [
        [88.10, 22.30], // SW corner
        [88.65, 22.80], // NE corner
      ],
    });

    // Navigation controls
    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right'
    );

    // Wait for map load
    await new Promise<void>((resolve) => {
      if (this.map!.loaded()) {
        resolve();
      } else {
        this.map!.once('load', () => resolve());
      }
    });

    // Zoom change event
    this.map.on('zoomend', () => {
      const zoom = this.map!.getZoom();
      for (const cb of this.zoomCallbacks) {
        cb(zoom);
      }
    });
  }

  renderMarkers(
    items: MarkerItem[],
    onClick: (id: string, type: 'pandal' | 'food' | 'station') => void
  ): void {
    if (!this.map) return;
    this.items = items;
    this.markerClickHandler = onClick;

    const setup = () => {
      if (!this.map) return;
      try {
        this.addMarkerLayers(items, onClick);
      } catch (err) {
        console.warn('[map] Error adding marker layers:', err);
      }
    };

    if (this.map.isStyleLoaded()) {
      setup();
    } else {
      this.map.once('styledata', setup);
    }
  }

  private addMarkerLayers(
    items: MarkerItem[],
    onClick: (id: string, type: 'pandal' | 'food' | 'station') => void
  ): void {
    if (!this.map) return;
    this.clearMarkers();

    // 1. Separate Pandals and Food into GeoJSON Features
    const pandalFeatures: GeoJSON.Feature[] = items
      .filter((i) => i.type === 'pandal')
      .map((p) => ({
        type: 'Feature',
        id: p.id,
        properties: {
          id: p.id,
          name: p.name,
          zone: p.zone || 'NORTH',
          type: 'pandal',
        },
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat],
        },
      }));

    const foodFeatures: GeoJSON.Feature[] = items
      .filter((i) => i.type === 'food')
      .map((f) => ({
        type: 'Feature',
        id: f.id,
        properties: {
          id: f.id,
          name: f.name,
          zone: f.zone || 'NORTH',
          type: 'food',
        },
        geometry: {
          type: 'Point',
          coordinates: [f.lng, f.lat],
        },
      }));

    // 2. Add Sources
    this.map.addSource('pandals-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: pandalFeatures,
      },
      promoteId: 'id',
    });

    this.map.addSource('food-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: foodFeatures,
      },
      promoteId: 'id',
    });

    // 3. Add Pandal Dots Layer (Circle Layer with Zone Colors & Zoom Radius)
    this.map.addLayer({
      id: 'pandal-dots',
      type: 'circle',
      source: 'pandals-src',
      layout: {
        'circle-sort-key': 0,
      },
      paint: {
        'circle-color': [
          'match',
          ['get', 'zone'],
          'NORTH', ZONE_COLORS.NORTH,
          'SOUTH', ZONE_COLORS.SOUTH,
          'CENTRAL', ZONE_COLORS.CENTRAL,
          'EAST', ZONE_COLORS.EAST,
          'WEST', ZONE_COLORS.WEST,
          '#E11D48',
        ],
        'circle-radius': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          12,
          [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 3.5,
            12, 5.5,
            15, 9,
          ],
        ],
        'circle-opacity': 0.95,
        'circle-stroke-color': '#0B0E14',
        'circle-stroke-width': 1.5,
        'circle-stroke-opacity': 0.9,
      },
    });

    // 4. Add Food Dots Layer (Circle Layer with Distinct White Border)
    this.map.addLayer({
      id: 'food-dots',
      type: 'circle',
      source: 'food-src',
      layout: {
        'circle-sort-key': 0,
      },
      paint: {
        'circle-color': [
          'match',
          ['get', 'zone'],
          'NORTH', ZONE_COLORS.NORTH,
          'SOUTH', ZONE_COLORS.SOUTH,
          'CENTRAL', ZONE_COLORS.CENTRAL,
          'EAST', ZONE_COLORS.EAST,
          'WEST', ZONE_COLORS.WEST,
          '#F59E0B',
        ],
        'circle-radius': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          11,
          [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 2.8,
            12, 4.5,
            15, 7.5,
          ],
        ],
        'circle-opacity': 1.0,
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-width': 2.0,
        'circle-stroke-opacity': 0.95,
      },
    });

    // 5. Hover Handlers with feature-state (Smooth 60fps GPU hover)
    this.map.on('mousemove', 'pandal-dots', (e) => {
      if (!this.map) return;
      this.map.getCanvas().style.cursor = 'pointer';
      const id = e.features?.[0]?.id;
      if (id === undefined || id === this.hoveredPandalId) return;
      if (this.hoveredPandalId !== null) {
        this.map.setFeatureState(
          { source: 'pandals-src', id: this.hoveredPandalId },
          { hover: false }
        );
      }
      this.hoveredPandalId = id;
      this.map.setFeatureState(
        { source: 'pandals-src', id: this.hoveredPandalId },
        { hover: true }
      );
    });

    this.map.on('mouseleave', 'pandal-dots', () => {
      if (!this.map) return;
      this.map.getCanvas().style.cursor = '';
      if (this.hoveredPandalId !== null) {
        this.map.setFeatureState(
          { source: 'pandals-src', id: this.hoveredPandalId },
          { hover: false }
        );
        this.hoveredPandalId = null;
      }
    });

    this.map.on('mousemove', 'food-dots', (e) => {
      if (!this.map) return;
      this.map.getCanvas().style.cursor = 'pointer';
      const id = e.features?.[0]?.id;
      if (id === undefined || id === this.hoveredFoodId) return;
      if (this.hoveredFoodId !== null) {
        this.map.setFeatureState(
          { source: 'food-src', id: this.hoveredFoodId },
          { hover: false }
        );
      }
      this.hoveredFoodId = id;
      this.map.setFeatureState(
        { source: 'food-src', id: this.hoveredFoodId },
        { hover: true }
      );
    });

    this.map.on('mouseleave', 'food-dots', () => {
      if (!this.map) return;
      this.map.getCanvas().style.cursor = '';
      if (this.hoveredFoodId !== null) {
        this.map.setFeatureState(
          { source: 'food-src', id: this.hoveredFoodId },
          { hover: false }
        );
        this.hoveredFoodId = null;
      }
    });

    // 6. Click Handlers
    this.map.on('click', 'pandal-dots', (e) => {
      const f = e.features?.[0];
      if (f?.properties?.id) {
        onClick(f.properties.id, 'pandal');
      }
    });

    this.map.on('click', 'food-dots', (e) => {
      const f = e.features?.[0];
      if (f?.properties?.id) {
        onClick(f.properties.id, 'food');
      }
    });

    // Apply active zone filter state if already set
    this.setActiveZone(this.activeZone);
  }

  clearMarkers(): void {
    if (!this.map) return;
    const style = this.map.getStyle();
    if (!style?.layers) return;

    if (this.map.getLayer('pandal-dots')) this.map.removeLayer('pandal-dots');
    if (this.map.getLayer('food-dots')) this.map.removeLayer('food-dots');
    if (this.map.getSource('pandals-src')) this.map.removeSource('pandals-src');
    if (this.map.getSource('food-src')) this.map.removeSource('food-src');
  }

  /**
   * Zone selection & translucent dimming:
   * Selected zone remains bright & sorted on top; others fade to ~16% opacity.
   */
  setActiveZone(zone: Zone | 'ALL'): void {
    if (!this.map) return;
    this.activeZone = zone;

    const isAll = zone === 'ALL';
    const matchZone = ['==', ['get', 'zone'], zone];

    if (this.map.getLayer('pandal-dots')) {
      this.map.setPaintProperty(
        'pandal-dots',
        'circle-opacity',
        isAll ? 0.95 : (['case', matchZone, 0.95, 0.16] as any)
      );
      this.map.setPaintProperty(
        'pandal-dots',
        'circle-stroke-opacity',
        isAll ? 0.9 : (['case', matchZone, 0.9, 0.1] as any)
      );
      this.map.setLayoutProperty(
        'pandal-dots',
        'circle-sort-key',
        isAll ? 0 : (['case', matchZone, 1, 0] as any)
      );
    }

    if (this.map.getLayer('food-dots')) {
      this.map.setPaintProperty(
        'food-dots',
        'circle-opacity',
        isAll ? 1.0 : (['case', matchZone, 1.0, 0.18] as any)
      );
      this.map.setPaintProperty(
        'food-dots',
        'circle-stroke-opacity',
        isAll ? 0.9 : (['case', matchZone, 0.9, 0.1] as any)
      );
      this.map.setLayoutProperty(
        'food-dots',
        'circle-sort-key',
        isAll ? 0 : (['case', matchZone, 1, 0] as any)
      );
    }
  }

  /**
   * Frame the selected zone's pandals.
   */
  fitZone(zone: Zone | 'ALL'): void {
    if (!this.map) return;
    if (zone === 'ALL') {
      this.map.flyTo({
        center: [88.3639, 22.5726],
        zoom: 12,
        speed: 1.2,
        curve: 1.2,
        essential: true,
      });
      return;
    }

    const pts = this.items.filter((p) => p.type === 'pandal' && p.zone === zone);
    if (!pts.length) return;
    const bounds = new maplibregl.LngLatBounds();
    pts.forEach((p) => bounds.extend([p.lng, p.lat]));
    this.map.fitBounds(bounds, { padding: 60, maxZoom: 14.5, duration: 800 });
  }

  /**
   * Toggle individual layer visibility (pandals, food, metro).
   */
  toggleLayer(layer: 'pandals' | 'food' | 'metro', visible: boolean): void {
    if (!this.map) return;
    const vis = visible ? 'visible' : 'none';

    if (layer === 'pandals' && this.map.getLayer('pandal-dots')) {
      this.map.setLayoutProperty('pandal-dots', 'visibility', vis);
    } else if (layer === 'food' && this.map.getLayer('food-dots')) {
      this.map.setLayoutProperty('food-dots', 'visibility', vis);
    } else if (layer === 'metro') {
      this.toggleMetroOverlay(visible);
    }
  }

  renderMetroLines(geoJson: GeoJSON.FeatureCollection): void {
    if (!this.map) return;

    const setup = () => {
      if (!this.map) return;
      try {
        this.addMetroLayers(geoJson);
      } catch (err) {
        console.warn('[map] Error adding metro layers:', err);
      }
    };

    if (this.map.isStyleLoaded()) {
      setup();
    } else {
      this.map.once('styledata', setup);
    }
  }

  private addMetroLayers(geoJson: GeoJSON.FeatureCollection): void {
    if (!this.map) return;
    this.removeMetroLayers();

    const lines = geoJson.features.filter((f) => f.geometry.type === 'LineString');
    const stations = geoJson.features.filter((f) => f.geometry.type === 'Point');

    // 1. Line Sources & Dual-Layer Rendering (Dark casing + colored center line)
    for (const line of lines) {
      const props = line.properties as Record<string, string>;
      const code = props['code'] as keyof typeof METRO_LINE_COLORS;
      const color = METRO_LINE_COLORS[code] ?? props['colorHex'] ?? '#38BDF8';
      const sourceId = `metro-line-${props['id']}`;
      const layerId = `metro-layer-${props['id']}`;

      this.map.addSource(sourceId, {
        type: 'geojson',
        data: line as GeoJSON.Feature,
      });

      // Dark under-casing for stark contrast against basemap
      this.map.addLayer({
        id: `${layerId}-casing`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#0B0E14',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 15, 12],
          'line-opacity': 0.85,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Vibrant metro line
      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.8, 15, 6],
          'line-opacity': 0.95,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    // 2. Add Station Nodes
    this.map.addSource('metro-stations-src', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: stations,
      } as GeoJSON.FeatureCollection,
    });

    this.map.addLayer({
      id: 'metro-stations',
      type: 'circle',
      source: 'metro-stations-src',
      minzoom: 10,
      paint: {
        'circle-color': '#FFFFFF',
        'circle-stroke-color': '#0B0E14',
        'circle-stroke-width': 2,
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10,
          2.5,
          15,
          ['case', ['boolean', ['get', 'isInterchange'], false], 7.5, 5],
        ],
      },
    });

    // 3. Station Labels (Appear as user zooms in at minzoom: 11)
    this.map.addLayer({
      id: 'metro-labels',
      type: 'symbol',
      source: 'metro-stations-src',
      minzoom: 11,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10, 15, 13],
        'text-anchor': 'left',
        'text-offset': [0.85, 0],
        'text-optional': true,
        'symbol-sort-key': ['case', ['boolean', ['get', 'isInterchange'], false], 0, 1] as any,
      },
      paint: {
        'text-color': '#F3F4F6',
        'text-halo-color': '#0B0E14',
        'text-halo-width': 2,
      },
    });

    // 4. Station Click Popup
    this.map.on('click', 'metro-stations', (e) => {
      const feature = e.features?.[0];
      if (!feature || !this.map) return;
      const props = feature.properties as any;
      const coords = (feature.geometry as any).coordinates.slice();
      new maplibregl.Popup({ offset: 10, closeButton: true })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px 4px; min-width: 150px;">
            <div style="font-size: 13px; font-weight: 700; color: #111827;">🚇 ${props.name}</div>
            <div style="font-size: 11px; font-weight: 600; color: ${props.lineColorHex || '#2563EB'}; margin-top: 3px;">
              ${props.lineName || 'Metro Station'}
            </div>
            ${props.isInterchange ? '<div style="font-size: 10px; font-weight: 700; color: #D97706; margin-top: 2px;">★ Interchange Station</div>' : ''}
          </div>
        `)
        .addTo(this.map);
    });

    this.map.on('mouseenter', 'metro-stations', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'metro-stations', () => {
      if (this.map) this.map.getCanvas().style.cursor = '';
    });

    if (!this.metroVisible) {
      this.toggleMetroOverlay(false);
    }
  }

  toggleMetroOverlay(visible: boolean): void {
    if (!this.map) return;
    this.metroVisible = visible;
    const visibility = visible ? 'visible' : 'none';

    try {
      const style = this.map.getStyle();
      if (!style?.layers) return;

      for (const layer of style.layers) {
        if (layer.id.startsWith('metro-')) {
          this.map.setLayoutProperty(layer.id, 'visibility', visibility);
        }
      }
    } catch (e) {
      console.warn('[map] Error toggling metro overlay:', e);
    }
  }

  highlightZone(zone: Zone): void {
    if (!this.map) return;
    this.clearZoneHighlights();

    const color = ZONE_COLORS[zone];
    const sourceId = `zone-highlight-${zone}`;
    const layerId = `zone-highlight-layer-${zone}`;

    const zoneBounds = this.getZoneBounds(zone);

    this.map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: { zone },
        geometry: {
          type: 'Polygon',
          coordinates: [zoneBounds],
        },
      } as GeoJSON.Feature,
    });

    this.map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': color,
        'fill-opacity': 0.12,
      },
    });

    this.map.addLayer({
      id: `${layerId}-border`,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': color,
        'line-width': 2,
        'line-opacity': 0.6,
      },
    });
  }

  clearZoneHighlights(): void {
    if (!this.map) return;
    const style = this.map.getStyle();
    if (!style?.layers) return;

    for (const layer of [...style.layers]) {
      if (layer.id.startsWith('zone-highlight-')) {
        this.map.removeLayer(layer.id);
      }
    }
    for (const sourceId of Object.keys(style.sources ?? {})) {
      if (sourceId.startsWith('zone-highlight-')) {
        this.map.removeSource(sourceId);
      }
    }
  }

  flyTo(coords: [number, number], zoom?: number): void {
    if (!this.map) return;
    const lng = coords[0] > 50 ? coords[0] : coords[1];
    const lat = coords[0] > 50 ? coords[1] : coords[0];
    this.map.flyTo({
      center: [lng, lat],
      zoom: zoom ?? Math.max(this.map.getZoom(), 15),
      speed: 1.4,
      curve: 1.2,
      essential: true,
    });
  }

  getZoom(): number {
    return this.map?.getZoom() ?? 12;
  }

  onZoomChange(callback: (zoom: number) => void): void {
    this.zoomCallbacks.push(callback);
  }

  resize(): void {
    this.map?.resize();
  }

  destroy(): void {
    this.clearMarkers();
    this.removeMetroLayers();
    this.map?.remove();
    this.map = null;
    this.zoomCallbacks = [];
  }

  private removeMetroLayers(): void {
    if (!this.map) return;
    const style = this.map.getStyle();
    if (!style?.layers) return;

    for (const layer of [...style.layers]) {
      if (layer.id.startsWith('metro-')) {
        this.map.removeLayer(layer.id);
      }
    }
    for (const sourceId of Object.keys(style.sources ?? {})) {
      if (sourceId.startsWith('metro-')) {
        this.map.removeSource(sourceId);
      }
    }
  }

  private getZoneBounds(zone: Zone): number[][] {
    const bounds: Record<Zone, number[][]> = {
      NORTH: [[88.35, 22.585], [88.35, 22.65], [88.395, 22.65], [88.395, 22.585], [88.35, 22.585]],
      CENTRAL: [[88.34, 22.548], [88.34, 22.585], [88.395, 22.585], [88.395, 22.548], [88.34, 22.548]],
      SOUTH: [[88.332, 22.44], [88.332, 22.548], [88.395, 22.548], [88.395, 22.44], [88.332, 22.44]],
      EAST: [[88.395, 22.44], [88.395, 22.65], [88.48, 22.65], [88.48, 22.44], [88.395, 22.44]],
      WEST: [[88.25, 22.44], [88.25, 22.548], [88.332, 22.548], [88.332, 22.44], [88.25, 22.44]],
    };
    return bounds[zone];
  }
}
