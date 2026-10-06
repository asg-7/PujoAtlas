import React, { useEffect, useState } from 'react';
import SearchBar from './search/SearchBar';
import FilterPills from './filters/FilterPills';
import TrendingDrawer from './trending/TrendingDrawer';
import PandalHeader from './cards/PandalHeader';
import FoodCard from './cards/FoodCard';
import { useMapStore } from '../store/useMapStore';
import type { PandalEntity, FoodEntity } from '../lib/schemas';

interface MapUIOverlayProps {
  initialPandals?: PandalEntity[];
  initialFood?: FoodEntity[];
}

export default function MapUIOverlay({ initialPandals = [], initialFood = [] }: MapUIOverlayProps) {
  const { selectedEntity, clearSelection, setTrendingOpen, initData, pandals: storePandals, food: storeFood } = useMapStore();
  const [isRaat, setIsRaat] = useState(true);

  useEffect(() => {
    if (initialPandals.length > 0 || initialFood.length > 0) {
      initData(initialPandals, initialFood);
    }
  }, [initialPandals, initialFood, initData]);

  const toggleTheme = () => {
    const nextTheme = isRaat ? 'din' : 'raat';
    setIsRaat(!isRaat);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = nextTheme;
      window.dispatchEvent(new CustomEvent('map:themeChange', { detail: { theme: nextTheme } }));
    }
  };

  const pandalsList = initialPandals.length > 0 ? initialPandals : storePandals;
  const foodList = initialFood.length > 0 ? initialFood : storeFood;

  const selectedPandal = selectedEntity?.type === 'pandal' 
    ? pandalsList.find((p) => p.id === selectedEntity.id) 
    : null;
    
  const selectedFood = selectedEntity?.type === 'food' 
    ? foodList.find((f) => f.id === selectedEntity.id) 
    : null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* Top Header & Navigation Section */}
      <div className="pt-2 sm:pt-3 pb-1 pointer-events-auto bg-gradient-to-b from-stone-900/60 via-stone-900/20 to-transparent">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 space-y-1.5">
          {/* Header Row: Title, Search, Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 shrink-0 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/90 shadow-sm">
              <span className="text-base">🪔</span>
              <span className="font-bold font-serif text-sm text-stone-900 tracking-tight">Pujo Atlas</span>
            </div>

            <div className="flex-1 max-w-sm sm:max-w-md">
              <SearchBar />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setTrendingOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/90 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                title="জনপ্রিয় তালিকা (Trending)"
              >
                <span>🔥</span>
                <span className="hidden sm:inline">Trending</span>
              </button>

              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/90 text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                title="দিন / রাত পরিবর্তন (Toggle Theme)"
              >
                <span>{isRaat ? '🌙' : '☀️'}</span>
              </button>
            </div>
          </div>

          {/* Reference Filter Pills row */}
          <FilterPills />
        </div>
      </div>

      {/* Overlays / Drawers */}
      <div className="pointer-events-auto">
        <TrendingDrawer />
        
        {selectedPandal && (
          <PandalHeader 
            pandal={selectedPandal} 
            metroStationName={selectedPandal.nearestMetro}
            onClose={clearSelection} 
          />
        )}

        {selectedFood && (
          <FoodCard 
            food={selectedFood} 
            onClose={clearSelection} 
          />
        )}
      </div>
    </div>
  );
}
