import type { Zone, PandalEntity, FoodEntity } from '../lib/schemas';

interface MapState {
  // Data
  pandals: PandalEntity[];
  food: FoodEntity[];

  // Filters
  activeZone: Zone | 'ALL';
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
  toggleLayer: (layer: keyof MapState['activeLayers']) => void;
  setSearchQuery: (query: string) => void;
  selectEntity: (id: string, type: 'pandal' | 'food' | 'station') => void;
  clearSelection: () => void;
  setTrendingOpen: (isOpen: boolean) => void;
}

/**
 * T-23: Central Map State Store.
 * Coordinates filters, selections, and drawer visibility across the app.
 * Decouples the React UI from the imperative MapEngineAdapter.
 */
import { create } from 'zustand';

export const useMapStore = create<MapState>((set) => ({
  pandals: [],
  food: [],
  activeZone: 'ALL',
  activeLayers: {
    pandals: true,
    food: true,
    metro: true,
  },
  searchQuery: '',
  selectedEntity: null,
  isTrendingOpen: false,

  initData: (pandals, food) => set({ pandals, food }),

  setZone: (zone) => set({ activeZone: zone }),
  
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
