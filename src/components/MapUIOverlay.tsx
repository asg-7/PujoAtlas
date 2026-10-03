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

const METRO_STATIONS: Record<string, string> = {
  'station-dakshineswar': 'Dakshineswar',
  'station-dumdum': 'Dum Dum',
  'station-shyambazar': 'Shyambazar',
  'station-sovabazar': 'Sovabazar Ahiritola',
  'station-girish-park': 'Girish Park',
  'station-mg-road': 'Mahatma Gandhi Road',
  'station-central': 'Central',
  'station-esplanade': 'Esplanade',
  'station-park-street': 'Park Street',
  'station-kalighat': 'Kalighat',
  'station-rabindra-sarobar': 'Rabindra Sarobar',
  'station-kavi-subhash': 'Kavi Subhash',
  'station-howrah-maidan': 'Howrah Maidan',
  'station-sealdah': 'Sealdah',
  'station-salt-lake-sector-v': 'Salt Lake Sector V',
  'station-joka': 'Joka',
  'station-taratala': 'Taratala',
  'station-majerhat': 'Majerhat',
  'station-ruby': 'Hemanta Mukhopadhyay (Ruby)',
};

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
      <div className="pt-3 pb-2 space-y-2 pointer-events-auto bg-gradient-to-b from-[var(--chalk)] via-[var(--chalk)]/80 to-transparent">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 max-w-2xl mx-auto w-full">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight">
              Pujo Atlas
            </h1>
            <span className="text-xs font-serif text-[var(--geru-text)] font-semibold hidden sm:inline">
              • কলকাতার দুর্গোৎসব পরিক্রমা
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Trending Button at Top RHS */}
            <button
              onClick={() => setTrendingOpen(true)}
              className="chip cursor-pointer hover:bg-[var(--chalk-3)] transition-all select-none text-xs font-semibold flex items-center gap-1 border border-[var(--geru)]/40 text-[var(--ink)]"
              title="জনপ্রিয় পুজো ও খাবারের তালিকা"
            >
              <span>🔥</span>
              <span>জনপ্রিয় (Trending)</span>
            </button>

            {/* Din / Raat Theme Switch */}
            <button
              onClick={toggleTheme}
              className="chip cursor-pointer hover:bg-[var(--chalk-3)] transition-all select-none text-xs font-semibold"
              title="দিন / রাত মোড পরিবর্তন করুন"
            >
              <span>{isRaat ? '🌙 রাত' : '☀️ দিন'}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <SearchBar />
        <FilterPills />
      </div>

      {/* Overlays / Drawers */}
      <div className="pointer-events-auto">
        <TrendingDrawer />
        
        {selectedPandal && (
          <PandalHeader 
            pandal={selectedPandal} 
            metroStationName={selectedPandal.nearestMetroStationId ? (METRO_STATIONS[selectedPandal.nearestMetroStationId] || 'Nearby Metro') : undefined}
            metroWalkingMinutes={selectedPandal.nearestMetroStationId ? 5 : undefined}
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
