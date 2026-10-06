import React, { useRef, useEffect, useCallback } from 'react';
import type { FoodEntity, Zone } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';

interface FoodCardProps {
  food: FoodEntity;
  onClose: () => void;
  onNavigate?: (lat: number, lng: number) => void;
}

const ZONE_LABELS: Record<Zone, string> = {
  NORTH: 'North Kolkata',
  SOUTH: 'South Kolkata',
  CENTRAL: 'Central Kolkata',
  EAST: 'East Kolkata',
  HOWRAH: 'Howrah',
  OTHERS: 'Others',
  WEST: 'West Kolkata',
};

const CATEGORY_META: Record<FoodEntity['category'], { label: string; icon: string }> = {
  RESTAURANT: { label: 'Restaurant', icon: '🍽️' },
  CAFE: { label: 'Cafe', icon: '☕' },
  DHABA: { label: 'Dhaba', icon: '🥘' },
  STREET_FOOD: { label: 'Street Food', icon: '🌯' },
  SWEETS: { label: 'Sweets & Desserts', icon: '🧁' },
};

const PRICE_MAP: Record<FoodEntity['priceRange'], string> = {
  BUDGET: '₹ (সাশ্রয়ী)',
  MID_RANGE: '₹₹ (মাঝারি)',
  PREMIUM: '₹₹₹ (প্রিমিয়াম)',
};

export default function FoodCard({ food, onClose }: FoodCardProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, isDragging: false });

  const meta = CATEGORY_META[food.category] || { label: 'Food Spot', icon: '🍽️' };
  const zoneColor = ZONE_COLORS[food.zone] || '#B8892F';

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
      setTimeout(onClose, 260);
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
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out max-w-xl mx-auto"
      style={{ transform: 'translateY(100%)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 -top-full bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Thaal Sheet with Paper surface and Nimantran styling */}
      <div className="relative thaal paper paper-2 max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Lal-par decorative top border */}
        <div className="lal-par-top w-full pt-2">
          <div className="flex justify-center pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1 bg-[var(--control-border)] rounded-full opacity-60" />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="nimantran paper paper-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 text-[11px] font-semibold rounded-sm text-white tracking-wider uppercase"
                    style={{ backgroundColor: zoneColor }}
                  >
                    {ZONE_LABELS[food.zone]}
                  </span>
                  <span className="chip text-[10px]">
                    {meta.icon} {meta.label}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--brass-text)]">
                    {PRICE_MAP[food.priceRange]}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--ink)] tracking-tight leading-tight mt-1">
                  {food.name}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] flex items-center gap-1">
                  <span>📍</span>
                  <span>{food.address}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="btn min-h-[36px] w-[36px] p-0 rounded-full border-[var(--control-border)] text-[var(--ink)] hover:bg-[var(--chalk)] shrink-0"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Famous for / Must try dishes */}
          {food.mustTryDishes && food.mustTryDishes.length > 0 && (
            <div className="space-y-1.5">
              <div className="meta text-[var(--geru-text)] flex items-center gap-1.5">
                <span>✨</span>
                <span>অবশ্যই চেখে দেখুন (Must-Try Specialties)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {food.mustTryDishes.map((dish) => (
                  <span key={dish} className="chip text-xs bg-[var(--chalk-3)] text-[var(--ink)] border-[var(--control-border)]">
                    🍴 {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Direct Directions */}
          <div className="pt-2 space-y-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(food.name + ', ' + food.address + ', Kolkata')}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full py-3 text-sm font-bold shadow-md tracking-wide flex items-center justify-center gap-2 no-underline"
            >
              <span>🧭</span>
              <span>গুগল ম্যাপে পৌঁছান (Get Directions)</span>
            </a>

            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${food.lat},${food.lng}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn flex-1 py-2 text-xs no-underline text-center"
              >
                <span>🚶</span> Walk
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${food.lat},${food.lng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn flex-1 py-2 text-xs no-underline text-center"
              >
                <span>📍</span> GPS Pin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
