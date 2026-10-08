import { createMapAdapter, ZONE_COLORS } from './MapEngineAdapter';
import type { MarkerItem } from './MapEngineAdapter';
import { useMapStore } from '../../store/useMapStore';
import pandalsAll from '../../data/pandals-all.json';
import foodData from '../../data/food.json';
import type { PandalEntity, FoodEntity, Zone } from '../schemas';

import { metroGeoJson } from '../../data/metroData';
import { pandalIdsForQuery, searchPandals, searchFood } from '../search';

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
  const applyMarkerFilter = (state: ReturnType<typeof useMapStore.getState>) => {
    if (typeof mapAdapter.filterMarkers !== 'function') return;
    mapAdapter.filterMarkers(
      state.activeFilter,
      state.savedPandalIds,
      pandalIdsForQuery(allPandals, state.searchQuery)
    );
  };

  useMapStore.subscribe((state, prevState) => {
    // Typing in the search box narrows the pins on the map. It never moves the camera;
    // the camera only moves on an explicit choice (tap a result / "Show all on map").
    if (state.searchQuery !== prevState.searchQuery) {
      applyMarkerFilter(state);
    }

    // Reactive Filter updates (ALL, FEATURED, HERITAGE, SAVED, or Zone)
    if (
      state.activeFilter !== prevState.activeFilter ||
      state.savedPandalIds !== prevState.savedPandalIds
    ) {
      applyMarkerFilter(state);
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

  // Apply any search already in the store (e.g. opened from a shared ?q= link)
  applyMarkerFilter(useMapStore.getState());

  // 6. Custom window event listeners
  window.addEventListener('map:flyToZone', (e: Event) => {
    const customEvent = e as CustomEvent<{ zone: any }>;
    const zone = customEvent.detail?.zone;
    if (zone) {
      mapAdapter.setActiveZone(zone);
      mapAdapter.fitZone(zone);
    }
  });

  // "Show all N pandals on map" from the search dropdown: frame every matching pin.
  window.addEventListener('map:fitToResults', (e: Event) => {
    const query = (e as CustomEvent<{ query: string }>).detail?.query ?? '';
    const ids = new Set([
      ...searchPandals(allPandals, query).map((p) => p.id),
      ...searchFood(allFood, query).map((f) => f.id),
    ]);
    const points = allMarkers.filter((m) => ids.has(m.id)).map((m) => [m.lng, m.lat] as [number, number]);
    if (points.length === 0 || typeof mapAdapter.fitBounds !== 'function') return;

    const st = useMapStore.getState();
    const isDesktop = window.innerWidth >= 768;
    // Desktop: the directory panel covers the left of the map, so keep pins clear of it.
    // Mobile: keep pins below the floating search + chips and above the bottom nav.
    mapAdapter.fitBounds(points, {
      top: isDesktop ? 80 : 150,
      bottom: isDesktop ? 60 : 110,
      left: isDesktop && !st.isSidebarCollapsed ? 480 : 40,
      right: 40,
    });
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
        useMapStore.getState().setUserLocation({ lat: latitude, lng: longitude }, 'granted');
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
