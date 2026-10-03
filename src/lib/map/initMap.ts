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

import { metroGeoJson } from '../../data/metroData';

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

  // 2. Render initial metro lines immediately from bundled data
  mapAdapter.renderMetroLines(metroGeoJson);
  mapAdapter.toggleMetroOverlay(useMapStore.getState().activeLayers.metro);

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

  // 4. Initial Marker Render (all markers loaded into GPU vector layer)
  mapAdapter.renderMarkers(allMarkers, (id, type) => {
    useMapStore.getState().selectEntity(id, type);
  });

  // Apply initial active zone and layer visibility
  const initialState = useMapStore.getState();
  mapAdapter.setActiveZone(initialState.activeZone);
  mapAdapter.toggleLayer('pandals', initialState.activeLayers.pandals);
  mapAdapter.toggleLayer('food', initialState.activeLayers.food);
  mapAdapter.toggleLayer('metro', initialState.activeLayers.metro);

  // 5. Subscribe to Zustand store changes for Reactive Map Updates
  useMapStore.subscribe((state, prevState) => {
    // Reactive Zone Dimming: Dim non-active zones to translucent ~16% opacity
    if (state.activeZone !== prevState.activeZone) {
      mapAdapter.setActiveZone(state.activeZone);
      mapAdapter.fitZone(state.activeZone);
    }

    // Reactive Layer Toggles
    if (state.activeLayers.pandals !== prevState.activeLayers.pandals) {
      mapAdapter.toggleLayer('pandals', state.activeLayers.pandals);
    }
    if (state.activeLayers.food !== prevState.activeLayers.food) {
      mapAdapter.toggleLayer('food', state.activeLayers.food);
    }
    if (state.activeLayers.metro !== prevState.activeLayers.metro) {
      mapAdapter.toggleLayer('metro', state.activeLayers.metro);
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
    const customEvent = e as CustomEvent<{ zone: any }>;
    const zone = customEvent.detail?.zone;
    if (zone) {
      mapAdapter.setActiveZone(zone);
      mapAdapter.fitZone(zone);
    }
  });

  window.addEventListener('resize', () => mapAdapter.resize());
}
