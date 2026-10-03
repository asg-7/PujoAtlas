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
 * Implements IMapAdapter with hardware-accelerated 60fps rendering.
 */
export class MapLibreDriver implements IMapAdapter {
  private map: maplibregl.Map | null = null;
  private markers: maplibregl.Marker[] = [];
  private zoomCallbacks: Array<(zoom: number) => void> = [];
  private metroVisible = true;

  async init(
    container: HTMLElement,
    options: { center: [number, number]; zoom: number }
  ): Promise<void> {
    this.map = new maplibregl.Map({
      container,
      style: DARK_STYLE,
      center: [options.center[1], options.center[0]], // MapLibre uses [lng, lat]
      zoom: options.zoom,
      attributionControl: { compact: true },
      maxBounds: [
        [88.20, 22.40], // SW corner
        [88.55, 22.70], // NE corner
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

    // Wait for style load
    await new Promise<void>((resolve) => {
      this.map!.on('load', () => resolve());
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
    this.clearMarkers();

    for (const item of items) {
      const color = item.color ?? this.getMarkerColor(item);

      const el = document.createElement('div');
      el.className = 'pujo-marker';
      el.style.cssText = `
        width: ${item.type === 'station' ? '10px' : '14px'};
        height: ${item.type === 'station' ? '10px' : '14px'};
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 6px ${color}80;
        transition: transform 0.15s ease;
      `;
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.4)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.lng, item.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-size:13px;font-weight:600;color:#111">${item.name}</div>
             <div style="font-size:11px;color:#666;text-transform:capitalize">${item.type}</div>`
          )
        )
        .addTo(this.map!);

      el.addEventListener('click', () => onClick(item.id, item.type));
      this.markers.push(marker);
    }
  }

  clearMarkers(): void {
    for (const m of this.markers) {
      m.remove();
    }
    this.markers = [];
  }

  renderMetroLines(geoJson: GeoJSON.FeatureCollection): void {
    if (!this.map) return;

    // Remove existing metro layers
    this.removeMetroLayers();

    // Separate lines and stations
    const lines = geoJson.features.filter((f) => f.geometry.type === 'LineString');
    const stations = geoJson.features.filter((f) => f.geometry.type === 'Point');

    // Add line sources and layers
    for (const line of lines) {
      const props = line.properties as Record<string, string>;
      const code = props['code'] as keyof typeof METRO_LINE_COLORS;
      const color = METRO_LINE_COLORS[code] ?? '#FFFFFF';
      const sourceId = `metro-line-${props['id']}`;
      const layerId = `metro-layer-${props['id']}`;

      this.map.addSource(sourceId, {
        type: 'geojson',
        data: line as GeoJSON.Feature,
      });

      // Glow effect (wider, transparent)
      this.map.addLayer({
        id: `${layerId}-glow`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': 8,
          'line-opacity': 0.25,
          'line-blur': 4,
        },
      });

      // Main line
      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': 3,
          'line-opacity': 0.9,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    }

    // Add station points
    this.map.addSource('metro-stations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: stations,
      } as GeoJSON.FeatureCollection,
    });

    this.map.addLayer({
      id: 'metro-stations-layer',
      type: 'circle',
      source: 'metro-stations',
      paint: {
        'circle-radius': 5,
        'circle-color': '#FFFFFF',
        'circle-stroke-width': 2,
        'circle-stroke-color': ['get', 'lineColorHex'],
      },
    });

    // Station labels
    this.map.addLayer({
      id: 'metro-stations-labels',
      type: 'symbol',
      source: 'metro-stations',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 10,
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
        'text-optional': true,
      },
      paint: {
        'text-color': '#CCCCCC',
        'text-halo-color': '#000000',
        'text-halo-width': 1,
      },
    });
  }

  toggleMetroOverlay(visible: boolean): void {
    if (!this.map) return;
    this.metroVisible = visible;
    const visibility = visible ? 'visible' : 'none';

    const style = this.map.getStyle();
    if (!style?.layers) return;

    for (const layer of style.layers) {
      if (layer.id.startsWith('metro-')) {
        this.map.setLayoutProperty(layer.id, 'visibility', visibility);
      }
    }
  }

  highlightZone(zone: Zone): void {
    if (!this.map) return;
    this.clearZoneHighlights();

    const color = ZONE_COLORS[zone];
    const sourceId = `zone-highlight-${zone}`;
    const layerId = `zone-highlight-layer-${zone}`;

    // Zone approximate bounds (matching zones.geojson)
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
        'fill-opacity': 0.15,
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
    this.map.flyTo({
      center: [coords[1], coords[0]], // [lng, lat]
      zoom: zoom ?? this.map.getZoom(),
      speed: 1.5,
      curve: 1.2,
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
    this.map?.remove();
    this.map = null;
    this.zoomCallbacks = [];
  }

  // --- Private helpers ---

  private getMarkerColor(item: MarkerItem): string {
    if (item.type === 'station') return '#FFFFFF';
    if (item.zone) return ZONE_COLORS[item.zone];
    return item.type === 'pandal' ? '#FFD700' : '#FF9800';
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
