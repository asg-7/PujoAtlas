import type { Zone, PandalEntity, FoodEntity } from '../lib/schemas';
import { create } from 'zustand';

interface MapState {
  // Data
  pandals: PandalEntity[];
  food: FoodEntity[];

  // Filters
  activeZone: Zone | 'ALL';
  activeFilter: string; // 'ALL' | 'FEATURED' | 'HERITAGE' | 'SAVED' | Zone
  savedPandalIds: string[];
  activeLayers: {
    pandals: boolean;
    food: boolean;
    metro: boolean;
  };
  searchQuery: string;

  // Selection & UI State
  selectedEntity: { id: string; type: 'pandal' | 'food' | 'station' } | null;
  isTrendingOpen: boolean;

  // Actions
  initData: (pandals: PandalEntity[], food: FoodEntity[]) => void;
  setZone: (zone: Zone | 'ALL') => void;
  setFilter: (filter: string) => void;
  toggleSavePandal: (id: string) => void;
  toggleLayer: (layer: keyof MapState['activeLayers']) => void;
  setSearchQuery: (query: string) => void;
  selectEntity: (id: string, type: 'pandal' | 'food' | 'station') => void;
  clearSelection: () => void;
  setTrendingOpen: (isOpen: boolean) => void;
}

const loadSavedIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('pujo_atlas_saved');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useMapStore = create<MapState>((set, get) => ({
  pandals: [],
  food: [],
  activeZone: 'ALL',
  activeFilter: 'ALL',
  savedPandalIds: loadSavedIds(),
  activeLayers: {
    pandals: true,
    food: true,
    metro: true,
  },
  searchQuery: '',
  selectedEntity: null,
  isTrendingOpen: false,

  initData: (pandals, food) => set({ pandals, food }),

  setZone: (zone) => set({ activeZone: zone, activeFilter: zone }),

  setFilter: (filter) =>
    set({
      activeFilter: filter,
      activeZone: ['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'HOWRAH', 'OTHERS', 'WEST'].includes(filter)
        ? (filter as Zone)
        : 'ALL',
    }),

  toggleSavePandal: (id) =>
    set((state) => {
      const exists = state.savedPandalIds.includes(id);
      const updated = exists
        ? state.savedPandalIds.filter((item) => item !== id)
        : [...state.savedPandalIds, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('pujo_atlas_saved', JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save bookmarks to localStorage', e);
        }
      }
      return { savedPandalIds: updated };
    }),

  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layer]: !state.activeLayers[layer],
      },
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  selectEntity: (id, type) => set({ selectedEntity: { id, type }, isTrendingOpen: false }),

  clearSelection: () => set({ selectedEntity: null }),

  setTrendingOpen: (isOpen) => set({ isTrendingOpen: isOpen, selectedEntity: isOpen ? null : null }),
}));
