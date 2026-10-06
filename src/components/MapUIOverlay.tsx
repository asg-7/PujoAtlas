import React, { useEffect } from 'react';
import Navbar from './navigation/Navbar';
import MobileBottomNav from './navigation/MobileBottomNav';
import ExploreView from './views/ExploreView';
import DiscoverView from './views/DiscoverView';
import HeritageView from './views/HeritageView';
import FoodView from './views/FoodView';
import { PlannerView } from './views/PlannerView';
import { MyPujaView } from './views/MyPujaView';
import PandalModal from './cards/PandalModal';
import FoodCard from './cards/FoodCard';
import { SocialShareModal } from './modals/SocialShareModal';
import { useMapStore } from '../store/useMapStore';
import type { PandalEntity, FoodEntity } from '../lib/schemas';

interface MapUIOverlayProps {
  initialPandals?: PandalEntity[];
  initialFood?: FoodEntity[];
}

export default function MapUIOverlay({ initialPandals = [], initialFood = [] }: MapUIOverlayProps) {
  const {
    activeTab,
    selectedEntity,
    clearSelection,
    initData,
    pandals,
    food,
  } = useMapStore();

  useEffect(() => {
    if (initialPandals.length > 0 || initialFood.length > 0) {
      initData(initialPandals, initialFood);
    }
  }, [initialPandals, initialFood, initData]);

  const selectedPandal =
    selectedEntity?.type === 'pandal'
      ? pandals.find((p) => p.id === selectedEntity.id)
      : null;

  const selectedFood =
    selectedEntity?.type === 'food'
      ? food.find((f) => f.id === selectedEntity.id)
      : null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col pointer-events-none overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <div className="pointer-events-auto">
        <Navbar />
      </div>

      {/* Main Experience View — Pass pointer events through to MapLibre on ExploreView */}
      <main className="flex-1 relative overflow-hidden pointer-events-none">
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'discover' && (
          <div className="w-full h-full pointer-events-auto overflow-y-auto">
            <DiscoverView />
          </div>
        )}
        {activeTab === 'heritage' && (
          <div className="w-full h-full pointer-events-auto overflow-y-auto">
            <HeritageView />
          </div>
        )}
        {activeTab === 'food' && (
          <div className="w-full h-full pointer-events-auto overflow-y-auto">
            <FoodView />
          </div>
        )}
        {activeTab === 'planner' && (
          <div className="w-full h-full pointer-events-auto overflow-y-auto">
            <PlannerView />
          </div>
        )}
        {activeTab === 'mypuja' && (
          <div className="w-full h-full pointer-events-auto overflow-y-auto">
            <MyPujaView />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="pointer-events-auto">
        <MobileBottomNav />
      </div>

      {/* Modals and Drawers */}
      <div className="pointer-events-auto">
        {selectedPandal && (
          <PandalModal
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

        <SocialShareModal />
      </div>
    </div>
  );
}
