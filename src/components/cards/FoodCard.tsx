import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { FoodEntity, Zone } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';
import { navigateToDestination, TRAVEL_MODE_META } from '../../lib/navigation';
import type { TravelMode } from '../../lib/navigation';

interface FoodCardProps {
  food: FoodEntity;
  onClose: () => void;
  onNavigate?: (lat: number, lng: number) => void;
}

const ZONE_LABELS: Record<Zone, string> = {
  NORTH: 'North',
  SOUTH: 'South',
  CENTRAL: 'Central',
  EAST: 'East',
  WEST: 'West',
};

const CATEGORY_META: Record<FoodEntity['category'], { label: string; icon: string }> = {
  RESTAURANT: { label: 'Restaurant', icon: '🍽️' },
  CAFE: { label: 'Cafe', icon: '☕' },
  DHABA: { label: 'Dhaba', icon: '🥘' },
  STREET_FOOD: { label: 'Street Food', icon: '🌯' },
  SWEETS: { label: 'Sweets', icon: '🧁' },
};

const PRICE_MAP: Record<FoodEntity['priceRange'], string> = {
  BUDGET: '₹',
  MID_RANGE: '₹₹',
  PREMIUM: '₹₹₹',
};

export default function FoodCard({ food, onClose, onNavigate }: FoodCardProps) {
  const [showNavOptions, setShowNavOptions] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false });

  const meta = CATEGORY_META[food.category];
  const zoneColor = ZONE_COLORS[food.zone];

  // --- Drag gesture handling ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragRef.current.startY = e.touches[0].clientY;
    dragRef.current.isDragging = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.isDragging || !sheetRef.current) return;
    const deltaY = e.touches[0].clientY - dragRef.current.startY;
    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!sheetRef.current) return;
    const deltaY = sheetRef.current.getBoundingClientRect().top - window.innerHeight * 0.3;
    dragRef.current.isDragging = false;

    if (deltaY > 150) {
      sheetRef.current.style.transform = 'translateY(100%)';
      setTimeout(onClose, 300);
    } else {
      sheetRef.current.style.transform = 'translateY(0)';
    }
  }, [onClose]);

  useEffect(() => {
    if (sheetRef.current) {
      requestAnimationFrame(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, []);

  const handleNavigate = (mode: TravelMode) => {
    navigateToDestination(food.id, food.lat, food.lng, mode);
    setShowNavOptions(false);
  };

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
      style={{ transform: 'translateY(100%)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 -top-screen" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-pujo-card rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto border-t-4" style={{ borderColor: zoneColor }}>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-gray-800 text-gray-200 rounded flex items-center gap-1">
                  <span>{meta.icon}</span> {meta.label}
                </span>
                <span className="text-[10px] font-bold text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">
                  {PRICE_MAP[food.priceRange]}
                </span>
                <span
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded"
                  style={{ color: zoneColor, backgroundColor: `${zoneColor}20` }}
                >
                  {ZONE_LABELS[food.zone]}
                </span>
                {food.isLateNight && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-900/40 text-purple-300 rounded border border-purple-800/50 flex items-center gap-1">
                    <span>🌙</span> Late Night
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white truncate flex items-center gap-2">
                {food.name}
                {food.rating && <span className="text-sm font-medium text-gray-400">★ {food.rating}</span>}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{food.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Timing */}
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-gray-800/50 p-2 rounded-lg border border-gray-700/50">
            <span>🕒</span>
            <span className="font-medium">{food.openHours}</span>
          </div>
        </div>

        {/* Famous For & Dishes */}
        <div className="px-4 mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Famous For</p>
            <div className="flex flex-wrap gap-1.5">
              {food.famousFor.map((item) => (
                <span key={item} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">Must Try Dishes</p>
            <div className="flex flex-wrap gap-1.5">
              {food.mustTryDishes.map((dish) => (
                <span key={dish} className="px-2 py-1 text-xs bg-orange-900/20 text-orange-200 border border-orange-800/30 rounded-md">
                  {dish}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Direct Google Maps Navigation */}
        <div className="px-4 pb-4">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${food.lat},${food.lng}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all no-underline text-center"
          >
            <span>🧭</span>
            <span>Open in Google Maps (Directions)</span>
          </a>

          <div className="flex gap-2 pt-2.5">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${food.lat},${food.lng}&travelmode=transit`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gray-800/90 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors no-underline text-center"
            >
              <span>🚇</span> Transit
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${food.lat},${food.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gray-800/90 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors no-underline text-center"
            >
              <span>🚶</span> Walk
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + ', ' + food.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gray-800/90 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors no-underline text-center"
            >
              <span>📍</span> Place
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
