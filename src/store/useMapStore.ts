import type { Zone, PandalEntity, FoodEntity } from '../lib/schemas';
import { create } from 'zustand';

export type MainTab = 'explore' | 'discover' | 'heritage' | 'food' | 'planner' | 'mypuja';
export type ViewMode = 'split' | 'map' | 'list';
export type Language = 'en' | 'bn';

interface MapState {
  // Data
  pandals: PandalEntity[];
  food: FoodEntity[];

  // Navigation & View
  activeTab: MainTab;
  activeViewMode: ViewMode;
  language: Language;

  // Location
  userLocation: { lat: number; lng: number } | null;
  userLocationStatus: 'idle' | 'locating' | 'granted' | 'denied';

  // Filters
  activeZone: Zone | 'ALL';
  activeFilter: string; // 'ALL' | 'FEATURED' | 'HERITAGE' | 'SAVED' | 'VISITED' | Zone
  selectedHeritageAge: 'ALL' | '75' | '100' | '150' | '200';
  nearMetroOnly: boolean;
  maxDistanceKm: number | null;
  searchQuery: string;

  // Saved, Visited & Custom Route Lists
  savedPandalIds: string[];
  visitedPandalIds: string[];
  customRoutePandalIds: string[];

  // Layers
  activeLayers: {
    pandals: boolean;
    food: boolean;
    metro: boolean;
  };

  // Selection & Modal States
  selectedEntity: { id: string; type: 'pandal' | 'food' | 'station' } | null;
  isDetailOpen: boolean;
  isShareModalOpen: boolean;
  isTrendingOpen: boolean;
  isSidebarCollapsed: boolean;

  // Actions
  initData: (pandals: PandalEntity[], food: FoodEntity[]) => void;
  setActiveTab: (tab: MainTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setLanguage: (lang: Language) => void;
  setUserLocation: (loc: { lat: number; lng: number } | null, status?: MapState['userLocationStatus']) => void;
  setZone: (zone: Zone | 'ALL') => void;
  setFilter: (filter: string) => void;
  setHeritageAge: (age: MapState['selectedHeritageAge']) => void;
  setNearMetroOnly: (nearMetro: boolean) => void;
  setMaxDistanceKm: (dist: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Bookmarks & Itinerary
  toggleSavePandal: (id: string) => void;
  toggleVisitedPandal: (id: string) => void;
  addToRoute: (id: string) => void;
  removeFromRoute: (id: string) => void;
  clearRoute: () => void;
  setRoutePandals: (ids: string[]) => void;

  // Layers & Selection
  toggleLayer: (layer: keyof MapState['activeLayers']) => void;
  selectEntity: (id: string, type: 'pandal' | 'food' | 'station') => void;
  clearSelection: () => void;
  setDetailOpen: (isOpen: boolean) => void;
  setShareModalOpen: (isOpen: boolean) => void;
  setTrendingOpen: (isOpen: boolean) => void;
}

const loadStorageList = (key: string): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  try {
    const lang = localStorage.getItem('pujo_atlas_lang');
    return lang === 'bn' ? 'bn' : 'en';
  } catch {
    return 'en';
  }
};

export const useMapStore = create<MapState>((set, get) => ({
  pandals: [],
  food: [],

  activeTab: 'explore',
  activeViewMode: 'split',
  language: loadLanguage(),

  userLocation: null,
  userLocationStatus: 'idle',

  activeZone: 'ALL',
  activeFilter: 'ALL',
  selectedHeritageAge: 'ALL',
  nearMetroOnly: false,
  maxDistanceKm: null,
  searchQuery: '',

  savedPandalIds: loadStorageList('pujo_atlas_saved'),
  visitedPandalIds: loadStorageList('pujo_atlas_visited'),
  customRoutePandalIds: loadStorageList('pujo_atlas_route'),

  activeLayers: {
    pandals: true,
    food: true,
    metro: true,
  },

  selectedEntity: null,
  isDetailOpen: false,
  isShareModalOpen: false,
  isTrendingOpen: false,
  isSidebarCollapsed: false,

  initData: (pandals, food) => set({ pandals, food }),

  setActiveTab: (tab) => set({ activeTab: tab, selectedEntity: null, isDetailOpen: false }),

  setViewMode: (mode) => set({ activeViewMode: mode }),

  setSidebarCollapsed: (collapsed) => {
    set({ isSidebarCollapsed: collapsed });
    if (typeof window !== 'undefined') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    }
  },

  toggleSidebar: () => {
    set((state) => {
      const next = !state.isSidebarCollapsed;
      if (typeof window !== 'undefined') {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
      }
      return { isSidebarCollapsed: next };
    });
  },

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pujo_atlas_lang', lang);
      } catch (e) {}
    }
    set({ language: lang });
  },

  setUserLocation: (loc, status = 'granted') => set({ userLocation: loc, userLocationStatus: status }),

  setZone: (zone) => set({ activeZone: zone, activeFilter: zone }),

  setFilter: (filter) =>
    set({
      activeFilter: filter,
      activeZone: ['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'HOWRAH', 'OTHERS', 'WEST'].includes(filter)
        ? (filter as Zone)
        : 'ALL',
    }),

  setHeritageAge: (age) => set({ selectedHeritageAge: age }),

  setNearMetroOnly: (nearMetro) => set({ nearMetroOnly: nearMetro }),

  setMaxDistanceKm: (dist) => set({ maxDistanceKm: dist }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSavePandal: (id) =>
    set((state) => {
      const exists = state.savedPandalIds.includes(id);
      const updated = exists
        ? state.savedPandalIds.filter((item) => item !== id)
        : [...state.savedPandalIds, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pujo_atlas_saved', JSON.stringify(updated));
        } catch (e) {}
      }
      return { savedPandalIds: updated };
    }),

  toggleVisitedPandal: (id) =>
    set((state) => {
      const exists = state.visitedPandalIds.includes(id);
      const updated = exists
        ? state.visitedPandalIds.filter((item) => item !== id)
        : [...state.visitedPandalIds, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pujo_atlas_visited', JSON.stringify(updated));
        } catch (e) {}
      }
      return { visitedPandalIds: updated };
    }),

  addToRoute: (id) =>
    set((state) => {
      if (state.customRoutePandalIds.includes(id)) return state;
      const updated = [...state.customRoutePandalIds, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pujo_atlas_route', JSON.stringify(updated));
        } catch (e) {}
      }
      return { customRoutePandalIds: updated };
    }),

  removeFromRoute: (id) =>
    set((state) => {
      const updated = state.customRoutePandalIds.filter((item) => item !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pujo_atlas_route', JSON.stringify(updated));
        } catch (e) {}
      }
      return { customRoutePandalIds: updated };
    }),

  clearRoute: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('pujo_atlas_route');
      } catch (e) {}
    }
    set({ customRoutePandalIds: [] });
  },

  setRoutePandals: (ids) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pujo_atlas_route', JSON.stringify(ids));
      } catch (e) {}
    }
    set({ customRoutePandalIds: ids });
  },

  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layer]: !state.activeLayers[layer],
      },
    })),

  selectEntity: (id, type) =>
    set({
      selectedEntity: { id, type },
      isDetailOpen: true,
      isTrendingOpen: false,
    }),

  clearSelection: () => set({ selectedEntity: null, isDetailOpen: false }),

  setDetailOpen: (isOpen) => set({ isDetailOpen: isOpen }),

  setShareModalOpen: (isOpen) => set({ isShareModalOpen: isOpen }),

  setTrendingOpen: (isOpen) => set({ isTrendingOpen: isOpen, selectedEntity: isOpen ? null : null }),
}));
