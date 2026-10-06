import React, { useRef, useEffect, useCallback } from 'react';
import {
  Navigation,
  UtensilsCrossed,
  Coffee,
  Cake,
  Soup,
  X,
  Footprints,
} from 'lucide-react';
import type { FoodEntity, Zone } from '../../lib/schemas';

interface FoodCardProps {
  food: FoodEntity;
  onClose: () => void;
  onNavigate?: (lat: number, lng: number) => void;
}

const CATEGORY_META: Record<FoodEntity['category'], { label: string; icon: React.ReactNode }> = {
  RESTAURANT: { label: 'Restaurant', icon: <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  CAFE: { label: 'Cafe', icon: <Coffee className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  DHABA: { label: 'Dhaba', icon: <Soup className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  STREET_FOOD: { label: 'Street Food', icon: <Soup className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  SWEETS: { label: 'Sweets & Desserts', icon: <Cake className="w-3.5 h-3.5" strokeWidth={1.5} /> },
};

const PRICE_MAP: Record<FoodEntity['priceRange'], string> = {
  BUDGET: '₹ (Budget)',
  MID_RANGE: '₹₹ (Mid-range)',
  PREMIUM: '₹₹₹ (Premium)',
};

export default function FoodCard({ food, onClose }: FoodCardProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, isDragging: false });

  const meta = CATEGORY_META[food.category] || { label: 'Food Spot', icon: <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.5} /> };

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
      setTimeout(onClose, 240);
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

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-base ease-out max-w-xl mx-auto"
      style={{ transform: 'translateY(100%)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-card-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 -top-full bg-ink/60 dark:bg-black/70 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />

      {/* Sheet Body */}
      <div className="relative bg-paper dark:bg-surface border-t border-x border-sand dark:border-line rounded-t-lg max-h-[85vh] overflow-y-auto shadow-e3 text-ink dark:text-text">
        {/* Mobile Drag Indicator */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 bg-sand dark:bg-line rounded-full" />
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-sm bg-sand/60 dark:bg-line text-ink dark:text-text uppercase tracking-wider">
                  {food.zone} KOLKATA
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-shola dark:bg-base text-smoke dark:text-text-muted border border-sand dark:border-line flex items-center gap-1">
                  {meta.icon}
                  <span>{meta.label}</span>
                </span>
                <span className="text-[11px] font-medium text-terracotta">
                  {PRICE_MAP[food.priceRange]}
                </span>
              </div>

              <h2 id="food-card-title" className="text-xl sm:text-2xl font-serif font-semibold text-ink dark:text-text tracking-tight leading-tight mt-1">
                {food.name}
              </h2>
              <p className="text-xs text-smoke dark:text-text-muted leading-normal">
                📍 {food.address}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full border border-sand dark:border-line text-smoke hover:text-ink hover:bg-sand/20 shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Specialties / Must-Try */}
          {food.mustTryDishes && food.mustTryDishes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-terracotta block">
                Must-Try Specialties:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {food.mustTryDishes.map((dish) => (
                  <span
                    key={dish}
                    className="px-2.5 py-1 rounded-sm text-xs font-normal bg-shola dark:bg-base text-ink dark:text-text border border-sand dark:border-line"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-2 space-y-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(food.name + ', ' + food.address + ', Kolkata')}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-md bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-xs font-semibold shadow-e1 flex items-center justify-center gap-2 no-underline min-h-[44px] transition-colors duration-fast"
            >
              <Navigation className="w-4 h-4" strokeWidth={1.5} />
              <span>Directions in Google Maps</span>
            </a>

            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${food.lat},${food.lng}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-md bg-shola dark:bg-base border border-sand dark:border-line text-ink dark:text-text text-xs font-medium text-center no-underline flex items-center justify-center gap-1 hover:bg-sand/20 min-h-[36px]"
              >
                <Footprints className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Walk Route</span>
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(food.name + ' Kolkata')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-md bg-shola dark:bg-base border border-sand dark:border-line text-ink dark:text-text text-xs font-medium text-center no-underline flex items-center justify-center gap-1 hover:bg-sand/20 min-h-[36px]"
              >
                <span>GPS Pin ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
