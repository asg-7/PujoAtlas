import L from 'leaflet';
import type { IMapAdapter, MarkerItem } from './MapEngineAdapter';
import { ZONE_COLORS, METRO_LINE_COLORS } from './MapEngineAdapter';
import type { Zone } from '../schemas';

const DEFAULT_CARTO_KEY = 'cb1_46w3_1_b8c20a5b160e534febd5654c';
const rawKey = import.meta.env.PUBLIC_CARTO_API_KEY || DEFAULT_CARTO_KEY;
const cartoKeyParam = rawKey ? `?key=${rawKey}` : '';
const TILE_URL = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKeyParam}`;
const TILE_ATTRIBUTION =
  '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';

/**
 * Leaflet 2D fallback driver.
 * Provides full IMapAdapter compliance on devices where WebGL2 is unavailable.
 * Uses CartoDB Dark Matter tiles for visual parity with the MapLibre GL style.
 */
export class LeafletDriver implements IMapAdapter {
  private map: L.Map | null = null;
  private markerLayer: L.LayerGroup = L.layerGroup();
  private metroLayer: L.LayerGroup = L.layerGroup();
  private zoneLayer: L.LayerGroup = L.layerGroup();
  private zoomCallbacks: Array<(zoom: number) => void> = [];
  private metroVisible = true;

  async init(
    container: HTMLElement,
    options: { center: [number, number]; zoom: number }
  ): Promise<void> {
    this.map = L.map(container, {
      center: options.center,
      zoom: options.zoom,
      zoomControl: true,
      attributionControl: true,
      maxBounds: L.latLngBounds([22.40, 88.20], [22.70, 88.55]),
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    this.markerLayer.addTo(this.map);
    this.metroLayer.addTo(this.map);
    this.zoneLayer.addTo(this.map);

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
      const size = item.type === 'station' ? 8 : 12;

      const icon = L.divIcon({
        className: 'pujo-leaflet-marker',
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:2px solid #fff;
          border-radius:50%;
          box-shadow:0 0 6px ${color}80;
        "></div>`,
        iconSize: [size + 4, size + 4],
        iconAnchor: [(size + 4) / 2, (size + 4) / 2],
      });

      const marker = L.marker([item.lat, item.lng], { icon })
        .bindPopup(
          `<div style="font-size:13px;font-weight:600">${item.name}</div>
           <div style="font-size:11px;color:#666;text-transform:capitalize">${item.type}</div>`,
          { closeButton: false, offset: L.point(0, -6) }
        )
        .on('click', () => onClick(item.id, item.type));

      this.markerLayer.addLayer(marker);
    }
  }

  clearMarkers(): void {
    this.markerLayer.clearLayers();
  }

  renderMetroLines(geoJson: GeoJSON.FeatureCollection): void {
    if (!this.map) return;
    this.metroLayer.clearLayers();

    for (const feature of geoJson.features) {
      const props = feature.properties as Record<string, string>;

      if (feature.geometry.type === 'LineString') {
        const code = props['code'] as keyof typeof METRO_LINE_COLORS;
        const color = METRO_LINE_COLORS[code] ?? '#FFFFFF';

        // Glow effect line
        const glowLine = L.geoJSON(feature as GeoJSON.Feature, {
          style: {
            color,
            weight: 8,
            opacity: 0.2,
          },
        });
        this.metroLayer.addLayer(glowLine);

        // Main line
        const mainLine = L.geoJSON(feature as GeoJSON.Feature, {
          style: {
            color,
            weight: 3,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          },
        });
        this.metroLayer.addLayer(mainLine);
      }

      if (feature.geometry.type === 'Point') {
        const coords = (feature.geometry as GeoJSON.Point).coordinates;
        const stationColor = props['lineColorHex'] ?? '#FFFFFF';

        const icon = L.divIcon({
          className: 'pujo-leaflet-station',
          html: `<div style="
            width:10px;height:10px;
            background:#fff;
            border:2px solid ${stationColor};
            border-radius:50%;
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const stationMarker = L.marker([coords[1], coords[0]], { icon }).bindPopup(
          `<div style="font-size:12px;font-weight:600">${props['name']}</div>
           <div style="font-size:11px;color:#666">${props['lineName']}</div>`,
          { closeButton: false }
        );

        this.metroLayer.addLayer(stationMarker);
      }
    }
  }

  toggleMetroOverlay(visible: boolean): void {
    if (!this.map) return;
    this.metroVisible = visible;

    if (visible) {
      this.map.addLayer(this.metroLayer);
    } else {
      this.map.removeLayer(this.metroLayer);
    }
  }

  highlightZone(zone: Zone): void {
    if (!this.map) return;
    this.clearZoneHighlights();

    const color = ZONE_COLORS[zone];
    const bounds = this.getZoneBounds(zone);

    const polygon = L.polygon(
      bounds.map(([lng, lat]) => [lat, lng] as L.LatLngTuple),
      {
        color,
        weight: 2,
        opacity: 0.6,
        fillColor: color,
        fillOpacity: 0.15,
      }
    );

    this.zoneLayer.addLayer(polygon);
  }

  clearZoneHighlights(): void {
    this.zoneLayer.clearLayers();
  }

  flyTo(coords: [number, number], zoom?: number): void {
    if (!this.map) return;
    this.map.flyTo(coords, zoom ?? this.map.getZoom(), {
      duration: 1.2,
    });
  }

  getZoom(): number {
    return this.map?.getZoom() ?? 12;
  }

  onZoomChange(callback: (zoom: number) => void): void {
    this.zoomCallbacks.push(callback);
  }

  resize(): void {
    this.map?.invalidateSize();
  }

  destroy(): void {
    this.clearMarkers();
    this.metroLayer.clearLayers();
    this.zoneLayer.clearLayers();
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
