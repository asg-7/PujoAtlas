import L from 'leaflet';
import type { IMapAdapter, MarkerItem } from './MapEngineAdapter';
import { ZONE_COLORS, METRO_LINE_COLORS } from './MapEngineAdapter';
import type { Zone } from '../schemas';

const TILE_URL = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/">Esri</a> &copy; <a href="https://osm.org/copyright">OpenStreetMap</a>';

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
      zoomControl: false,
      attributionControl: true,
      maxBounds: L.latLngBounds([22.40, 88.20], [22.70, 88.55]),
      maxBoundsViscosity: 1.0,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      subdomains: 'abcd',
      maxZoom: 21,
      maxNativeZoom: 16,
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
      const isPandal = item.type === 'pandal';

      const html = isPandal
        ? `<div style="
            width: 24px;
            height: 28px;
            background: linear-gradient(135deg, #EF4444, #B91C1C);
            border: 2px solid #FCD34D;
            border-radius: 12px 12px 12px 2px;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(239, 68, 68, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v2M10 4h4M12 4c-3 3-5 5-5 9h10c0-4-2-6-5-9z"/>
                <path d="M5 13v8M19 13v8M9 21v-4a3 3 0 0 1 6 0v4M4 21h16"/>
              </svg>
            </div>
          </div>`
        : `<div style="
            width: 20px;
            height: 20px;
            background: ${color};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 2px 8px ${color}99;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2M15 11v11M5 2v7M8 2v7M2 2v7a3 3 0 0 0 3 3v10"/>
            </svg>
          </div>`;

      const icon = L.divIcon({
        className: 'pujo-leaflet-marker',
        html,
        iconSize: isPandal ? [24, 28] : [20, 20],
        iconAnchor: isPandal ? [12, 28] : [10, 10],
      });

      const destQuery = item.type === 'pandal' ? `${item.name} Durga Puja, Kolkata` : `${item.name}, Kolkata`;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destQuery)}&travelmode=driving`;
      const gpsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}&travelmode=driving`;

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 2px;">${item.name}</div>
          <div style="font-size: 11px; font-weight: 600; color: #4B5563; margin-bottom: 6px; text-transform: uppercase;">
            ${item.type === 'pandal' ? '🎪 Durga Puja Pandal' : '🍽️ Food Spot'} • <span style="color:${color}; font-weight: 700;">${item.zone || ''}</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 2; display: flex; align-items: center; justify-content: center; gap: 4px; width: 100%; padding: 5px 8px; background: #2563EB; color: #FFFFFF; font-size: 11px; font-weight: 700; text-decoration: none; border-radius: 6px;">
              🧭 Directions ↗
            </a>
            <a href="${gpsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; display: flex; align-items: center; justify-content: center; padding: 5px 6px; background: #374151; color: #F3F4F6; font-size: 10px; font-weight: 600; text-decoration: none; border-radius: 6px;" title="Exact coordinates pin">
              📍 GPS
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon })
        .bindPopup(popupHtml, { closeButton: false, offset: L.point(0, -10) })
        .on('click', () => onClick(item.id, item.type));

      this.markerInstances.push({ marker, item });
      this.markerLayer.addLayer(marker);
    }
  }

  private markerInstances: Array<{ marker: L.Marker; item: MarkerItem }> = [];

  clearMarkers(): void {
    this.markerLayer.clearLayers();
    this.markerInstances = [];
  }

  setActiveZone(zone: Zone | 'ALL'): void {
    for (const { marker, item } of this.markerInstances) {
      if (zone === 'ALL' || item.zone === zone) {
        marker.setOpacity(1.0);
      } else {
        marker.setOpacity(0.18);
      }
    }
  }

  fitZone(zone: Zone | 'ALL'): void {
    if (!this.map) return;
    if (zone === 'ALL') {
      this.map.flyTo([22.5726, 88.3639], 12);
      return;
    }
    const bounds = this.getZoneBounds(zone);
    this.map.fitBounds(bounds.map(([lng, lat]) => [lat, lng] as L.LatLngTuple));
  }

  toggleLayer(layer: 'pandals' | 'food' | 'metro', visible: boolean): void {
    if (layer === 'metro') {
      this.toggleMetroOverlay(visible);
      return;
    }
    for (const { marker, item } of this.markerInstances) {
      if (item.type === (layer === 'pandals' ? 'pandal' : 'food')) {
        marker.setOpacity(visible ? 1.0 : 0);
      }
    }
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
    const lng = coords[0] > 50 ? coords[0] : coords[1];
    const lat = coords[0] > 50 ? coords[1] : coords[0];
    this.map.flyTo([lat, lng], zoom ?? Math.max(this.map.getZoom(), 15), {
      duration: 1.2,
    });
  }

  filterMarkers(filterType: string, savedIds: string[] = [], searchIds: string[] | null = null): void {
    if (!this.map) return;
    const searchSet = searchIds ? new Set(searchIds) : null;
    this.markerLayer.clearLayers();
    for (const { marker, item } of this.markerInstances) {
      if (item.type !== 'pandal') {
        this.markerLayer.addLayer(marker);
        continue;
      }
      if (searchSet && !searchSet.has(item.id)) continue;
      if (filterType === 'ALL') {
        this.markerLayer.addLayer(marker);
      } else if (filterType === 'FEATURED' && item.isFeatured) {
        this.markerLayer.addLayer(marker);
      } else if (filterType === 'HERITAGE' && item.isHeritage) {
        this.markerLayer.addLayer(marker);
      } else if (filterType === 'SAVED' && savedIds.includes(item.id)) {
        this.markerLayer.addLayer(marker);
      } else if (
        ['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'HOWRAH', 'OTHERS', 'WEST'].includes(filterType) &&
        item.zone === filterType
      ) {
        this.markerLayer.addLayer(marker);
      }
    }
  }

  fitBounds(
    points: Array<[number, number]>,
    padding: { top?: number; bottom?: number; left?: number; right?: number } = {}
  ): void {
    if (!this.map || points.length === 0) return;
    const size = this.map.getSize();
    const clamp = (v: number | undefined, max: number) => Math.max(0, Math.min(v ?? 40, max));
    const latlngs = points.map(([lng, lat]) => L.latLng(lat, lng));
    if (latlngs.length === 1) {
      this.map.flyTo(latlngs[0], Math.max(this.map.getZoom(), 16), { duration: 1 });
      return;
    }
    this.map.flyToBounds(L.latLngBounds(latlngs), {
      paddingTopLeft: [clamp(padding.left, size.x * 0.45), clamp(padding.top, size.y * 0.3)],
      paddingBottomRight: [clamp(padding.right, size.x * 0.2), clamp(padding.bottom, size.y * 0.3)],
      maxZoom: 16,
      duration: 1,
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
      HOWRAH: [[88.28, 22.54], [88.28, 22.65], [88.35, 22.65], [88.35, 22.54], [88.28, 22.54]],
      OTHERS: [[88.30, 22.40], [88.30, 22.70], [88.50, 22.70], [88.50, 22.40], [88.30, 22.40]],
      WEST: [[88.25, 22.44], [88.25, 22.548], [88.332, 22.548], [88.332, 22.44], [88.25, 22.44]],
    };
    return bounds[zone] || bounds.NORTH;
  }
}
