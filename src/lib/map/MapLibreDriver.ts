import * as maplibregl from 'maplibre-gl';
import type { IMapAdapter, MarkerItem } from './MapEngineAdapter';
import { ZONE_COLORS, METRO_LINE_COLORS } from './MapEngineAdapter';
import { BONEDI_ZONES } from '../bonediMapSkin';
import { registerBonediIcons, upgradeToIcons, dimPins } from '../bonediIcons';
import type { Zone } from '../schemas';
import type { StyleSpecification } from 'maplibre-gl';

const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
const workerPath = `${basePath}/maplibre/maplibre-gl-worker.mjs`;

if (typeof (maplibregl as any).setWorkerUrl === 'function') {
  (maplibregl as any).setWorkerUrl(workerPath);
}

const DARK_STYLE: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    'dark-basemap': {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 16, // Real native limit of Esri dark canvas; MapLibre overscales beyond 16 instead of requesting missing tiles!
      attribution: '© Esri, © OpenStreetMap contributors'
    },
    'osm-streets': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 19, // OpenStreetMap native zoom 19 in Kolkata (streets, alleys, paras); overscaled to z22!
      attribution: '© OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'dark-basemap-layer',
      type: 'raster',
      source: 'dark-basemap',
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: 'osm-streets-layer',
      type: 'raster',
      source: 'osm-streets',
      minzoom: 14.8,
      maxzoom: 22,
      paint: {
        'raster-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          14.8, 0.0,
          15.4, 0.88,
          19, 0.95
        ],
        'raster-brightness-min': 0.1,
        'raster-brightness-max': 0.72,
        'raster-contrast': 0.2,
        'raster-saturation': -0.65
      }
    }
  ]
};

const ZONE_VIEWS: Record<Zone | 'ALL', { center: [number, number]; zoom: number }> = {
  ALL: { center: [88.3639, 22.5600], zoom: 12.0 },
  NORTH: { center: [88.3680, 22.5980], zoom: 13.6 },
  CENTRAL: { center: [88.3580, 22.5680], zoom: 14.0 },
  SOUTH: { center: [88.3580, 22.5180], zoom: 13.2 },
  EAST: { center: [88.4080, 22.5800], zoom: 13.4 },
  HOWRAH: { center: [88.3250, 22.5850], zoom: 13.5 },
  OTHERS: { center: [88.3800, 22.5600], zoom: 11.5 },
  WEST: { center: [88.3180, 22.4980], zoom: 13.2 },
};

/**
 * MapLibre GL JS driver — high-performance WebGL2 vector map renderer.
 * Hardware-accelerated rendering with reactive zone dimming, custom SVG iconography, and metro layer.
 */
export class MapLibreDriver implements IMapAdapter {
  private map: maplibregl.Map | null = null;
  private zoomCallbacks: Array<(zoom: number) => void> = [];
  private metroVisible = true;
  private items: MarkerItem[] = [];
  private activeZone: Zone | 'ALL' = 'ALL';
  private markerClickHandler: ((id: string, type: 'pandal' | 'food' | 'station') => void) | null = null;
  private metroGeoJsonData: GeoJSON.FeatureCollection | null = null;

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
      maxZoom: 21.5, // Unrestricted zooming: overscales smoothly into every alley and para!
      attributionControl: { compact: true },
      maxBounds: [
        [88.10, 22.30], // SW corner
        [88.65, 22.80], // NE corner
      ],
    });

    if (typeof window !== 'undefined') {
      (window as any).__mapInstance = this.map;

      // Listen for Din/Raat theme switch to tune street raster filter
      window.addEventListener('map:themeChange', (e: any) => {
        const theme = e.detail?.theme;
        if (!this.map || !this.map.getLayer('osm-streets-layer')) return;
        if (theme === 'din') {
          this.map.setPaintProperty('osm-streets-layer', 'raster-brightness-min', 0.0);
          this.map.setPaintProperty('osm-streets-layer', 'raster-brightness-max', 1.0);
          this.map.setPaintProperty('osm-streets-layer', 'raster-contrast', 0.0);
          this.map.setPaintProperty('osm-streets-layer', 'raster-saturation', 0.0);
        } else {
          this.map.setPaintProperty('osm-streets-layer', 'raster-brightness-min', 0.1);
          this.map.setPaintProperty('osm-streets-layer', 'raster-brightness-max', 0.72);
          this.map.setPaintProperty('osm-streets-layer', 'raster-contrast', 0.2);
          this.map.setPaintProperty('osm-streets-layer', 'raster-saturation', -0.65);
        }
      });
    }

    // Navigation controls (Zoom in/out, Compass reset) and Geolocate in bottom-right thumb zone
    this.map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      'bottom-right'
    );
    this.map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'bottom-right'
    );

    // Wait for map load
    await new Promise<void>((resolve) => {
      if (this.map!.loaded()) {
        resolve();
      } else {
        this.map!.once('load', () => resolve());
      }
    });

    // Register Bonedi SVG Icons
    await registerBonediIcons(this.map, BONEDI_ZONES);

    // Zoom change event
    this.map.on('zoomend', () => {
      if (!this.map) return;
      const zoom = this.map.getZoom();
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
    this.addMarkerLayers(items, onClick);
  }

  private async addMarkerLayers(
    items: MarkerItem[],
    onClick: (id: string, type: 'pandal' | 'food' | 'station') => void
  ): Promise<void> {
    if (!this.map) return;
    this.clearMarkers();

    // Ensure icons are registered
    await registerBonediIcons(this.map, BONEDI_ZONES);

    // 1. Separate Pandals and Food into GeoJSON Features
    const pandalFeatures: GeoJSON.Feature[] = items
      .filter((i) => i.type === 'pandal')
      .map((p) => ({
        type: 'Feature',
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
    if (!this.map.getSource('pandals-src')) {
      this.map.addSource('pandals-src', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pandalFeatures,
        },
      });
    }

    if (!this.map.getSource('food-src')) {
      this.map.addSource('food-src', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: foodFeatures,
        },
      });
    }

    // 3. Add custom SVG icon layers (Arch Pins, Food Katori Badges, Metro Signs)
    upgradeToIcons(this.map, {
      onSelect: (id, type) => onClick(id, type),
    });

    // Apply active zone filter state if already set
    this.setActiveZone(this.activeZone);
  }

  filterMarkers(filterType: string, savedIds: string[] = []): void {
    if (!this.map) return;
    const src = this.map.getSource('pandals-src') as maplibregl.GeoJSONSource;
    if (!src) return;

    const filteredPandals = this.items.filter((i) => {
      if (i.type !== 'pandal') return false;
      if (filterType === 'ALL') return true;
      if (filterType === 'FEATURED') return !!i.isFeatured;
      if (filterType === 'HERITAGE') return !!i.isHeritage;
      if (filterType === 'SAVED') return savedIds.includes(i.id);
      if (['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'HOWRAH', 'OTHERS', 'WEST'].includes(filterType)) {
        return i.zone === filterType;
      }
      return true;
    });

    const pandalFeatures: GeoJSON.Feature[] = filteredPandals.map((p) => ({
      type: 'Feature',
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

    src.setData({
      type: 'FeatureCollection',
      features: pandalFeatures,
    });
  }

  clearMarkers(): void {
    if (!this.map) return;
    try {
      if (this.map.getLayer('pandal-pins')) this.map.removeLayer('pandal-pins');
      if (this.map.getLayer('food-badges')) this.map.removeLayer('food-badges');
      if (this.map.getSource('pandals-src')) this.map.removeSource('pandals-src');
      if (this.map.getSource('food-src')) this.map.removeSource('food-src');
    } catch (e) {
      console.warn('[map] Error clearing markers:', e);
    }
  }

  /**
   * Zone selection & translucent dimming:
   * Selected zone remains bright; other zones fade to ~22% opacity.
   */
  setActiveZone(zone: Zone | 'ALL'): void {
    if (!this.map) return;
    this.activeZone = zone;
    const isAll = zone === 'ALL';

    try {
      // Dim pins & badges using bonediIcons helper
      dimPins(this.map, isAll ? null : zone);
    } catch (e) {
      console.warn('[map] Error setting active zone paint property:', e);
    }
  }

  /**
   * Frame the selected zone's area accurately without drifting.
   */
  fitZone(zone: Zone | 'ALL'): void {
    if (!this.map) return;
    const target = ZONE_VIEWS[zone] || ZONE_VIEWS.ALL;
    this.map.flyTo({
      center: target.center,
      zoom: target.zoom,
      speed: 1.2,
      curve: 1.2,
      essential: true,
    });
  }

  /**
   * Toggle individual layer visibility (pandals, food, metro).
   */
  toggleLayer(layer: 'pandals' | 'food' | 'metro', visible: boolean): void {
    if (!this.map) return;
    const vis = visible ? 'visible' : 'none';

    try {
      if (layer === 'pandals') {
        if (this.map.getLayer('pandal-dots')) this.map.setLayoutProperty('pandal-dots', 'visibility', vis);
        if (this.map.getLayer('pandal-pins')) this.map.setLayoutProperty('pandal-pins', 'visibility', vis);
      } else if (layer === 'food') {
        if (this.map.getLayer('food-dots')) this.map.setLayoutProperty('food-dots', 'visibility', vis);
        if (this.map.getLayer('food-badges')) this.map.setLayoutProperty('food-badges', 'visibility', vis);
      } else if (layer === 'metro') {
        this.toggleMetroOverlay(visible);
      }
    } catch (e) {
      console.warn('[map] Error toggling layer visibility:', e);
    }
  }

  renderMetroLines(geoJson: GeoJSON.FeatureCollection): void {
    if (!this.map) return;
    this.metroGeoJsonData = geoJson;
    this.addMetroLayers(geoJson);
  }

  private addMetroLayers(geoJson: GeoJSON.FeatureCollection): void {
    if (!this.map) return;
    this.removeMetroLayers();

    const lines = geoJson.features.filter((f) => f.geometry.type === 'LineString');
    const stations = geoJson.features.filter((f) => f.geometry.type === 'Point');

    // 1. Single unified Lines Source
    if (!this.map.getSource('metro-lines-src')) {
      this.map.addSource('metro-lines-src', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: lines,
        },
      });
    }

    // Metro Line Casing (Dark outline for contrast)
    if (!this.map.getLayer('metro-lines-casing')) {
      this.map.addLayer({
        id: 'metro-lines-casing',
        type: 'line',
        source: 'metro-lines-src',
        paint: {
          'line-color': '#0B0E14',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 14, 10, 16, 14],
          'line-opacity': 0.9,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          'visibility': this.metroVisible ? 'visible' : 'none',
        },
      });
    }

    // Metro Line Core (Vibrant color per line)
    if (!this.map.getLayer('metro-lines-core')) {
      this.map.addLayer({
        id: 'metro-lines-core',
        type: 'line',
        source: 'metro-lines-src',
        paint: {
          'line-color': ['coalesce', ['get', 'colorHex'], '#38BDF8'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3.2, 14, 5.5, 16, 8],
          'line-opacity': 0.98,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          'visibility': this.metroVisible ? 'visible' : 'none',
        },
      });
    }

    // 2. Add Station Nodes
    if (!this.map.getSource('metro-stations-src')) {
      this.map.addSource('metro-stations-src', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stations,
        },
      });
    }

    if (!this.map.getLayer('metro-stations-layer')) {
      this.map.addLayer({
        id: 'metro-stations-layer',
        type: 'circle',
        source: 'metro-stations-src',
        minzoom: 10,
        paint: {
          'circle-color': '#FFFFFF',
          'circle-stroke-color': ['coalesce', ['get', 'lineColorHex'], '#0B0E14'],
          'circle-stroke-width': 2.5,
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 3,
            13, 5,
            16, 8,
          ],
        },
        layout: {
          'visibility': this.metroVisible ? 'visible' : 'none',
        },
      });
    }

    // 3. Station Labels
    if (!this.map.getLayer('metro-station-labels')) {
      this.map.addLayer({
        id: 'metro-station-labels',
        type: 'symbol',
        source: 'metro-stations-src',
        minzoom: 11,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10, 14, 12, 16, 14],
          'text-anchor': 'left',
          'text-offset': [0.85, 0],
          'text-optional': true,
          'visibility': this.metroVisible ? 'visible' : 'none',
        },
        paint: {
          'text-color': '#F3F4F6',
          'text-halo-color': '#0B0E14',
          'text-halo-width': 2.5,
        },
      });
    }

    // 4. Station Click Popup
    this.map.on('click', 'metro-stations-layer', (e) => {
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

    this.map.on('mouseenter', 'metro-stations-layer', () => {
      if (this.map) this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', 'metro-stations-layer', () => {
      if (this.map) this.map.getCanvas().style.cursor = '';
    });
  }

  toggleMetroOverlay(visible: boolean): void {
    if (!this.map) return;
    this.metroVisible = visible;
    const visibility = visible ? 'visible' : 'none';

    const metroLayers = [
      'metro-lines-casing',
      'metro-lines-core',
      'metro-stations-layer',
      'metro-station-labels',
    ];

    try {
      for (const layerId of metroLayers) {
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', visibility);
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

    try {
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
    } catch (e) {
      console.warn('[map] Error adding zone highlight:', e);
    }
  }

  clearZoneHighlights(): void {
    if (!this.map) return;
    try {
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
    } catch (e) {
      console.warn('[map] Error clearing zone highlights:', e);
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
    const metroLayers = [
      'metro-lines-casing',
      'metro-lines-core',
      'metro-stations-layer',
      'metro-station-labels',
    ];

    try {
      for (const layerId of metroLayers) {
        if (this.map.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      }
      if (this.map.getSource('metro-lines-src')) {
        this.map.removeSource('metro-lines-src');
      }
      if (this.map.getSource('metro-stations-src')) {
        this.map.removeSource('metro-stations-src');
      }
    } catch (e) {
      console.warn('[map] Error removing metro layers:', e);
    }
  }

  private getZoneBounds(zone: Zone): number[][] {
    const bounds: Record<Zone, number[][]> = {
      NORTH: [[88.35, 22.585], [88.35, 22.65], [88.395, 22.65], [88.395, 22.585], [88.35, 22.585]],
      CENTRAL: [[88.34, 22.548], [88.34, 22.585], [88.395, 22.585], [88.395, 22.548], [88.34, 22.548]],
      SOUTH: [[88.332, 22.44], [88.332, 22.548], [88.395, 22.548], [88.395, 22.44], [88.332, 22.44]],
      EAST: [[88.395, 22.44], [88.395, 22.65], [88.48, 22.65], [88.48, 22.44], [88.395, 22.44]],
      HOWRAH: [[88.28, 22.54], [88.28, 22.65], [88.35, 22.65], [88.35, 22.54], [88.28, 22.54]],
      OTHERS: [[88.30, 22.40], [88.30, 22.70], [88.50, 22.70], [88.50, 22.40], [88.30, 22.40]],
      WEST: [[88.25, 22.44], [88.25, 22.548], [88.332, 22.548], [88.332, 22.44], [88.25, 22.44]],
    };
    return bounds[zone] || bounds.NORTH;
  }
}
