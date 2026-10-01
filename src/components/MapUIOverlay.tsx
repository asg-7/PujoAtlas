import React, { useEffect, useState } from 'react';
import SearchBar from './search/SearchBar';
import FilterPills from './filters/FilterPills';
import TrendingDrawer from './trending/TrendingDrawer';
import PandalHeader from './cards/PandalHeader';
import FoodCard from './cards/FoodCard';
import { useMapStore } from '../store/useMapStore';
import type { PandalEntity, FoodEntity } from '../lib/schemas';

export default function MapUIOverlay() {
  const { selectedEntity, clearSelection, setTrendingOpen } = useMapStore();
  const [pandals, setPandals] = useState<Record<string, PandalEntity>>({});
  const [food, setFood] = useState<Record<string, FoodEntity>>({});

  useEffect(() => {
    // Fetch lookup data for the drawers
    const fetchData = async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          fetch('/api/pandals').then(r => r.json()),
          fetch('/api/food').then(r => r.json()),
        ]);
        
        const pMap: Record<string, PandalEntity> = {};
        pRes.data?.forEach((p: PandalEntity) => { pMap[p.id] = p; });
        setPandals(pMap);

        const fMap: Record<string, FoodEntity> = {};
        fRes.data?.forEach((f: FoodEntity) => { fMap[f.id] = f; });
        setFood(fMap);
      } catch (err) {
        console.error("Failed to load entity data for UI", err);
      }
    };
    fetchData();
  }, []);

  const selectedPandal = selectedEntity?.type === 'pandal' ? pandals[selectedEntity.id] : null;
  const selectedFood = selectedEntity?.type === 'food' ? food[selectedEntity.id] : null;

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
