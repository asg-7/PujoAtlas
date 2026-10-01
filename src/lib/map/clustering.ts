import Supercluster from 'supercluster';
import type { MarkerItem } from './MapEngineAdapter';

/**
 * Adaptive marker clustering engine.
 * Clusters markers dynamically when zoom < 13.5 to prevent mobile visual clutter.
 * Uses Supercluster for zero-stutter performance with 200+ markers.
 */

export interface ClusterItem {
  type: 'cluster';
  clusterId: number;
  lat: number;
  lng: number;
  pointCount: number;
  expansion_zoom: number;
}

export interface SingleItem {
  type: 'single';
  marker: MarkerItem;
}

export type ClusterResult = ClusterItem | SingleItem;

const CLUSTER_ZOOM_THRESHOLD = 13.5;

interface MarkerProperties {
  marker: MarkerItem;
}

export class MarkerClusterer {
  private index: Supercluster<MarkerProperties>;
  private items: MarkerItem[] = [];

  constructor(options?: { radius?: number; maxZoom?: number }) {
    this.index = new Supercluster<MarkerProperties>({
      radius: options?.radius ?? 60,
      maxZoom: options?.maxZoom ?? 16,
      minZoom: 0,
      minPoints: 2,
    });
  }

  /**
   * Load markers into the cluster index.
   */
  load(items: MarkerItem[]): void {
    this.items = items;

    const points: Array<GeoJSON.Feature<GeoJSON.Point, MarkerProperties>> = items.map((item) => ({
      type: 'Feature' as const,
      properties: { marker: item },
      geometry: {
        type: 'Point' as const,
        coordinates: [item.lng, item.lat],
      },
    }));

    this.index.load(points);
  }

  /**
   * Get clusters or individual markers for a given bounding box and zoom level.
   * When zoom >= CLUSTER_ZOOM_THRESHOLD, returns individual markers (no clustering).
   */
  getClusters(
    bounds: { west: number; south: number; east: number; north: number },
    zoom: number
  ): ClusterResult[] {
    // Above threshold: return all individual markers visible in bounds
    if (zoom >= CLUSTER_ZOOM_THRESHOLD) {
      return this.items
        .filter(
          (m) =>
            m.lng >= bounds.west &&
            m.lng <= bounds.east &&
            m.lat >= bounds.south &&
            m.lat <= bounds.north
        )
        .map((marker) => ({ type: 'single' as const, marker }));
    }

    // Below threshold: use Supercluster
    const bbox: GeoJSON.BBox = [bounds.west, bounds.south, bounds.east, bounds.north];
    const clusters = this.index.getClusters(bbox, Math.floor(zoom));

    return clusters.map((feature) => {
      const props = feature.properties as Record<string, unknown>;

      if ('cluster' in props && props.cluster) {
        const [lng, lat] = feature.geometry.coordinates;
        return {
          type: 'cluster' as const,
          clusterId: props.cluster_id as number,
          lat,
          lng,
          pointCount: props.point_count as number,
          expansion_zoom: this.index.getClusterExpansionZoom(props.cluster_id as number),
        };
      }

      return {
        type: 'single' as const,
        marker: (props as unknown as MarkerProperties).marker,
      };
    });
  }

  /**
   * Get the expansion zoom level for a cluster (zoom needed to break it apart).
   */
  getExpansionZoom(clusterId: number): number {
    return this.index.getClusterExpansionZoom(clusterId);
  }

  /**
   * Get the individual markers contained in a cluster.
   */
  getClusterLeaves(clusterId: number, limit = 100): MarkerItem[] {
    const leaves = this.index.getLeaves(clusterId, limit);
    return leaves.map((f) => (f.properties as MarkerProperties).marker);
  }

  /**
   * Check if clustering should be active at the given zoom level.
   */
  static shouldCluster(zoom: number): boolean {
    return zoom < CLUSTER_ZOOM_THRESHOLD;
  }
}

/**
 * Create a DOM element for a cluster marker.
 */
export function createClusterElement(pointCount: number, color = '#FFD700'): HTMLDivElement {
  const el = document.createElement('div');
  const size = Math.min(24 + Math.sqrt(pointCount) * 6, 56);

  el.className = 'pujo-cluster';
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    background: ${color}DD;
    border: 2px solid #FFFFFF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: 700;
    font-size: ${Math.max(11, 14 - Math.floor(pointCount / 20))}px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    transition: transform 0.15s ease;
  `;
  el.textContent = String(pointCount);
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.2)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'scale(1)';
  });

  return el;
}
