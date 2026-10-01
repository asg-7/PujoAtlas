import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (initialPandals.length > 0 || initialFood.length > 0) {
      initData(initialPandals, initialFood);
    }
  }, [initialPandals, initialFood, initData]);

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
      {/* Top Section */}
      <div className="pt-4 pb-2 space-y-4 pointer-events-auto bg-gradient-to-b from-gray-900/80 to-transparent">
        <SearchBar />
        <FilterPills />
      </div>

      {/* Bottom Floating Buttons (if no entity is selected) */}
      {!selectedEntity && (
        <div className="p-4 flex justify-end pointer-events-auto">
          <button
            onClick={() => setTrendingOpen(true)}
            className="flex items-center gap-2 bg-gray-900/90 text-white px-5 py-3 rounded-full shadow-2xl border border-gray-700 hover:border-pujo-gold transition-colors backdrop-blur-md"
          >
            <span className="text-xl">🔥</span>
            <span className="font-bold">Trending Now</span>
          </button>
        </div>
      )}

      {/* Overlays / Drawers */}
      <div className="pointer-events-auto">
        <TrendingDrawer />
        
        {selectedPandal && (
          <PandalHeader 
            pandal={selectedPandal} 
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
