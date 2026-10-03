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
    const initLng = options.center[0] > 50 ? options.center[0] : options.center[1];
    const initLat = options.center[0] > 50 ? options.center[1] : options.center[0];

    this.map = new maplibregl.Map({
      container,
      style: DARK_STYLE,
      center: [initLng, initLat],
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

      // Root element passed to MapLibre — MapLibre controls transform translate on this element.
      // Explicit dimensions allow MapLibre to calculate correct anchor offsets.
      // NEVER set position: relative on el directly, as it disrupts MapLibre's absolute coordinate positioning!
      const el = document.createElement('div');
      el.className = `pujo-marker pujo-marker-${item.type}`;
      el.style.cursor = 'pointer';
      el.style.width = item.type === 'pandal' ? '28px' : '24px';
      el.style.height = item.type === 'pandal' ? '34px' : '24px';

      // Inner element handles visual presentation, hover animations, and SVG glyphs
      const inner = document.createElement('div');
      inner.className = 'pujo-marker-inner';
      inner.style.width = '100%';
      inner.style.height = '100%';

      if (item.type === 'pandal') {
        // Distinct festive Durga Puja pandal pin with temple arch / Kalash motif
        inner.style.background = 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)';
        inner.style.border = '2px solid #FCD34D';
        inner.style.borderRadius = '50% 50% 50% 0';
        inner.style.transform = 'rotate(-45deg)';
        inner.style.boxShadow = '0 4px 10px rgba(225, 29, 72, 0.5)';
        inner.style.display = 'flex';
        inner.style.alignItems = 'center';
        inner.style.justifyContent = 'center';
        inner.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease';
        inner.innerHTML = `
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v2M10 4h4M12 4c-3 3-5 5-5 9h10c0-4-2-6-5-9z"/>
              <path d="M5 13v8M19 13v8M9 21v-4a3 3 0 0 1 6 0v4M4 21h16"/>
            </svg>
          </div>
        `;
      } else {
        // Distinct food place badge colored dynamically by region (zone) with cutlery glyph
        inner.style.background = color;
        inner.style.border = '2px solid #FFFFFF';
        inner.style.borderRadius = '50%';
        inner.style.boxShadow = `0 2px 8px ${color}99`;
        inner.style.display = 'flex';
        inner.style.alignItems = 'center';
        inner.style.justifyContent = 'center';
        inner.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease';
        inner.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2M15 11v11M5 2v7M8 2v7M2 2v7a3 3 0 0 0 3 3v10"/>
          </svg>
        `;
      }

      inner.addEventListener('mouseenter', () => {
        inner.style.transform = item.type === 'pandal' ? 'rotate(-45deg) scale(1.25)' : 'scale(1.3)';
        inner.style.boxShadow = item.type === 'pandal' ? '0 6px 14px rgba(225, 29, 72, 0.7)' : `0 4px 12px ${color}DD`;
      });
      inner.addEventListener('mouseleave', () => {
        inner.style.transform = item.type === 'pandal' ? 'rotate(-45deg) scale(1)' : 'scale(1)';
        inner.style.boxShadow = item.type === 'pandal' ? '0 4px 10px rgba(225, 29, 72, 0.5)' : `0 2px 8px ${color}99`;
      });

      el.appendChild(inner);

      const destQuery = item.type === 'pandal' ? `${item.name} Durga Puja, Kolkata` : `${item.name}, Kolkata`;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destQuery)}&travelmode=driving`;
      const gpsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}&travelmode=driving`;

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px 4px; min-width: 185px;">
          <div style="font-size: 13px; font-weight: 700; color: #111827; line-height: 1.25; margin-bottom: 3px;">${item.name}</div>
          <div style="font-size: 11px; font-weight: 600; color: #4B5563; margin-bottom: 8px; text-transform: uppercase;">
            ${item.type === 'pandal' ? '🎪 Durga Puja Pandal' : '🍽️ Food Spot'} • <span style="color:${color}; font-weight: 700;">${item.zone || ''}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 2; display: flex; align-items: center; justify-content: center; gap: 4px; padding: 6px 8px; background: #2563EB; color: #FFFFFF; font-size: 11px; font-weight: 700; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
              🧭 Directions ↗
            </a>
            <a href="${gpsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 6px 6px; background: #374151; color: #F3F4F6; font-size: 10px; font-weight: 600; text-decoration: none; border-radius: 6px;" title="Exact coordinates pin">
              📍 GPS
            </a>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({
        element: el,
        anchor: item.type === 'pandal' ? 'bottom' : 'center',
      })
        .setLngLat([item.lng, item.lat])
        .setPopup(
          new maplibregl.Popup({
            offset: item.type === 'pandal' ? [0, -32] : [0, -12],
            closeButton: false,
          }).setHTML(popupHtml)
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

    // Guard: style must be loaded before adding sources and layers
    if (!this.map.isStyleLoaded()) {
      this.map.once('load', () => this.renderMetroLines(geoJson));
      return;
    }

    // Remove existing metro layers
    this.removeMetroLayers();

    // Separate lines and stations
    const lines = geoJson.features.filter((f) => f.geometry.type === 'LineString');
    const stations = geoJson.features.filter((f) => f.geometry.type === 'Point');

    // Add line sources and layers
    for (const line of lines) {
      const props = line.properties as Record<string, string>;
      const code = props['code'] as keyof typeof METRO_LINE_COLORS;
      const color = METRO_LINE_COLORS[code] ?? props['colorHex'] ?? '#FFFFFF';
      const sourceId = `metro-line-${props['id']}`;
      const layerId = `metro-layer-${props['id']}`;

      this.map.addSource(sourceId, {
        type: 'geojson',
        data: line as GeoJSON.Feature,
      });

      // Glow effect (wider, high-visibility neon outline)
      this.map.addLayer({
        id: `${layerId}-glow`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': 10,
          'line-opacity': 0.4,
          'line-blur': 2.5,
        },
      });

      // Main metro line
      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': 4.5,
          'line-opacity': 0.95,
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
        'circle-radius': 5.5,
        'circle-color': '#FFFFFF',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': ['get', 'lineColorHex'],
      },
    });

    // Interactive station click popup
    this.map.on('click', 'metro-stations-layer', (e) => {
      const feature = e.features?.[0];
      if (!feature || !this.map) return;
      const props = feature.properties as any;
      const coords = (feature.geometry as any).coordinates.slice();
      new maplibregl.Popup({ offset: 10, closeButton: true })
        .setLngLat(coords)
        .setHTML(`
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px 4px; min-width: 140px;">
            <div style="font-size: 13px; font-weight: 700; color: #111827;">🚇 ${props.name}</div>
            <div style="font-size: 11px; font-weight: 600; color: ${props.lineColorHex || '#2563EB'}; margin-top: 3px;">
              ${props.lineName || 'Metro Station'}
            </div>
            <div style="font-size: 10px; color: #6B7280; margin-top: 2px;">${props.zone ? props.zone + ' Kolkata' : ''}</div>
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

    // Station labels with crisp black halo for dark map contrast
    this.map.addLayer({
      id: 'metro-stations-labels',
      type: 'symbol',
      source: 'metro-stations',
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-offset': [0, 1.4],
        'text-anchor': 'top',
        'text-optional': true,
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#000000',
        'text-halo-width': 2,
      },
    });

    // Apply visibility state if metro layer was toggled off
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
    // Auto-detect coordinate order: Kolkata Longitude is ~88.x, Latitude is ~22.x
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
