import { createMapAdapter, ZONE_COLORS } from './MapEngineAdapter';
import type { MarkerItem } from './MapEngineAdapter';
import { useMapStore } from '../../store/useMapStore';
import pandalsAll from '../../data/pandals-all.json';
import foodData from '../../data/food.json';
import type { PandalEntity, FoodEntity, Zone } from '../schemas';

import { metroGeoJson } from '../../data/metroData';

export const allPandals: PandalEntity[] = pandalsAll as PandalEntity[];
export const allFood: FoodEntity[] = foodData as FoodEntity[];

export async function initApp() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;

  // Initialize in-memory store so UI search and drawers have instant access to all 722 pandals
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

  // Filter pandals with valid coordinates for vector layer
  allPandals.forEach((p) => {
    if (p.lat && p.lng && p.lat > 20 && p.lng > 80) {
      allMarkers.push({
        id: p.id,
        type: 'pandal',
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        zone: p.zone,
        color: ZONE_COLORS[p.zone] || '#E11D48',
        isFeatured: p.isFeatured,
        isHeritage: p.isHeritage,
      });
    }
  });

  allFood.forEach((f) => {
    allMarkers.push({
      id: f.id,
      type: 'food',
      name: f.name,
      lat: f.lat,
      lng: f.lng,
      zone: f.zone,
      color: ZONE_COLORS[f.zone] || '#F59E0B',
    });
  });

  // 4. Initial Marker Render (loaded into GPU vector layer)
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
    // Reactive Filter updates (ALL, FEATURED, HERITAGE, SAVED, or Zone)
    if (
      state.activeFilter !== prevState.activeFilter ||
      state.savedPandalIds !== prevState.savedPandalIds
    ) {
      if (typeof mapAdapter.filterMarkers === 'function') {
        mapAdapter.filterMarkers(state.activeFilter, state.savedPandalIds);
      }
      if (['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'HOWRAH', 'OTHERS', 'WEST'].includes(state.activeFilter)) {
        mapAdapter.setActiveZone(state.activeFilter as Zone);
        mapAdapter.fitZone(state.activeFilter as Zone);
      } else if (state.activeFilter === 'ALL') {
        mapAdapter.setActiveZone('ALL');
        mapAdapter.fitZone('ALL');
      }
    }

    // Reactive Zone Dimming
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

  // 6. Custom window event listeners
  window.addEventListener('map:flyToZone', (e: Event) => {
    const customEvent = e as CustomEvent<{ zone: any }>;
    const zone = customEvent.detail?.zone;
    if (zone) {
      mapAdapter.setActiveZone(zone);
      mapAdapter.fitZone(zone);
    }
  });

  // Geolocation trigger from search bar locate button
  window.addEventListener('map:locateUser', () => {
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে লোকেশন সার্ভিস চালু নেই (Geolocation unsupported)');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapAdapter.flyTo([longitude, latitude], 16.5);
      },
      (err) => {
        console.warn('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  window.addEventListener('resize', () => mapAdapter.resize());
}
