import { createMapAdapter, ZONE_COLORS } from './MapEngineAdapter';
import type { MarkerItem } from './MapEngineAdapter';
import { useMapStore } from '../../store/useMapStore';
import pandalsNorth from '../../data/pandals-north.json';
import pandalsSouth from '../../data/pandals-south.json';
import pandalsCentral from '../../data/pandals-central.json';
import pandalsEast from '../../data/pandals-east.json';
import pandalsWest from '../../data/pandals-west.json';
import foodData from '../../data/food.json';
import type { PandalEntity, FoodEntity } from '../schemas';

export const allPandals: PandalEntity[] = [
  ...(pandalsNorth as PandalEntity[]),
  ...(pandalsSouth as PandalEntity[]),
  ...(pandalsCentral as PandalEntity[]),
  ...(pandalsEast as PandalEntity[]),
  ...(pandalsWest as PandalEntity[]),
];

export const allFood: FoodEntity[] = foodData as FoodEntity[];

export async function initApp() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;

  // Initialize in-memory store so UI search and drawers have instant data
  useMapStore.getState().initData(allPandals, allFood);

  // 1. Initialize Map Adapter (WebGL2 MapLibre or 2D Leaflet fallback)
  const mapAdapter = await createMapAdapter();
  await mapAdapter.init(mapContainer, {
    center: [88.3639, 22.5726], // Kolkata Center
    zoom: 12,
  });

  // 2. Load Metro GeoJSON from static assets
  let metroGeoJson: GeoJSON.FeatureCollection | null = null;
  try {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const res = await fetch(`${base}/data/metro-lines.geojson`);
    if (res.ok) {
      metroGeoJson = await res.json();
    }
  } catch (err) {
    console.warn('[map] Could not load metro GeoJSON:', err);
  }

  // 3. Format Markers from inlined dataset
  const allMarkers: MarkerItem[] = [];

  allPandals.forEach((p) => {
    allMarkers.push({
      id: p.id,
      type: 'pandal',
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      zone: p.zone,
      color: '#E11D48', // Festive Durga Puja Vermilion
    });
  });

  allFood.forEach((f) => {
    allMarkers.push({
      id: f.id,
      type: 'food',
      name: f.name,
      lat: f.lat,
      lng: f.lng,
      zone: f.zone,
      color: ZONE_COLORS[f.zone] || '#F59E0B', // Food color matches region/zone!
    });
  });

  // Render initial metro lines if available
  if (metroGeoJson) {
    mapAdapter.renderMetroLines(metroGeoJson);
    mapAdapter.toggleMetroOverlay(useMapStore.getState().activeLayers.metro);
  }

  // 4. Render Active Markers
  const renderActiveMarkers = () => {
    const state = useMapStore.getState();

    const visibleMarkers = allMarkers.filter((m) => {
      if (state.activeZone !== 'ALL' && m.zone !== state.activeZone) return false;
      if (m.type === 'pandal' && !state.activeLayers.pandals) return false;
      if (m.type === 'food' && !state.activeLayers.food) return false;
      return true;
    });

    mapAdapter.renderMarkers(visibleMarkers, (id, type) => {
      useMapStore.getState().selectEntity(id, type);
    });

    if (metroGeoJson) {
      mapAdapter.toggleMetroOverlay(state.activeLayers.metro);
    }

    if (state.activeZone !== 'ALL') {
      mapAdapter.highlightZone(state.activeZone);
    } else {
      mapAdapter.clearZoneHighlights();
    }
  };

  renderActiveMarkers();

  // 5. Subscribe to Zustand store changes for Reactive Map Updates
  useMapStore.subscribe((state, prevState) => {
    let needsReRender = false;

    if (state.activeZone !== prevState.activeZone) {
      needsReRender = true;
    }

    if (
      state.activeLayers.pandals !== prevState.activeLayers.pandals ||
      state.activeLayers.food !== prevState.activeLayers.food
    ) {
      needsReRender = true;
    }

    if (state.activeLayers.metro !== prevState.activeLayers.metro) {
      if (metroGeoJson) {
        mapAdapter.toggleMetroOverlay(state.activeLayers.metro);
        if (state.activeLayers.metro) {
          mapAdapter.renderMetroLines(metroGeoJson);
        }
      }
    }

    if (needsReRender) {
      renderActiveMarkers();
    }

    // Fly to selected entity
    if (state.selectedEntity && state.selectedEntity.id !== prevState.selectedEntity?.id) {
      const target = allMarkers.find((m) => m.id === state.selectedEntity?.id);
      if (target) {
        mapAdapter.flyTo([target.lng, target.lat], 16);
      }
    }
  });

  // 6. Listen to custom window events for Zone FlyTo
  window.addEventListener('map:flyToZone', (e: Event) => {
    const customEvent = e as CustomEvent<{ zone: string }>;
    const zone = customEvent.detail?.zone;
    if (zone === 'NORTH') mapAdapter.flyTo([88.37, 22.61], 13);
    else if (zone === 'SOUTH') mapAdapter.flyTo([88.36, 22.51], 13);
    else if (zone === 'CENTRAL') mapAdapter.flyTo([88.36, 22.56], 14);
    else if (zone === 'EAST') mapAdapter.flyTo([88.42, 22.58], 13);
    else if (zone === 'WEST') mapAdapter.flyTo([88.30, 22.49], 13);
    else if (zone === 'ALL') mapAdapter.flyTo([88.3639, 22.5726], 12);
  });

  window.addEventListener('resize', () => mapAdapter.resize());
}
