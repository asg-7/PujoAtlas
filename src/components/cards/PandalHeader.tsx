import React, { useRef, useEffect, useCallback } from 'react';
import type { PandalEntity, Zone } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';
import { useMapStore } from '../../store/useMapStore';

interface PandalHeaderProps {
  pandal: PandalEntity;
  metroStationName?: string;
  metroWalkingMinutes?: number;
  onClose: () => void;
  onNavigate?: (lat: number, lng: number) => void;
}

const ZONE_LABELS: Record<string, { en: string; bn: string }> = {
  NORTH:   { en: 'North Kolkata',   bn: 'উত্তর কলকাতা' },
  SOUTH:   { en: 'South Kolkata',   bn: 'দক্ষিণ কলকাতা' },
  CENTRAL: { en: 'Central Kolkata', bn: 'মধ্য কলকাতা' },
  EAST:    { en: 'East Kolkata',    bn: 'পূর্ব কলকাতা / সল্টলেক' },
  HOWRAH:  { en: 'Howrah',          bn: 'হাওড়া' },
  OTHERS:  { en: 'Others',          bn: 'অন্যান্য' },
  WEST:    { en: 'West Kolkata',    bn: 'পশ্চিম কলকাতা / বেহালা' },
};

export default function PandalHeader({
  pandal,
  metroStationName,
  metroWalkingMinutes,
  onClose,
}: PandalHeaderProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, isDragging: false });
  const { savedPandalIds, toggleSavePandal } = useMapStore();
  const isSaved = savedPandalIds.includes(pandal.id);

  const zoneColor = ZONE_COLORS[pandal.zone] || '#B5513A';

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

  const zoneInfo = ZONE_LABELS[pandal.zone] || { en: 'Kolkata', bn: 'কলকাতা' };
  const effectiveMetro = pandal.nearestMetro || metroStationName;
  const hasValidCoords = pandal.lat && pandal.lng && pandal.lat > 20 && pandal.lng > 80;

  const googleMapsSearchUrl =
    pandal.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pandal.name + ' Durga Puja, ' + (pandal.address || 'Kolkata'))}`;

  const directionsDrivingUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=driving`
    : googleMapsSearchUrl;

  const directionsTransitUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=transit`
    : googleMapsSearchUrl;

  const directionsWalkUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=walking`
    : googleMapsSearchUrl;

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out max-w-xl mx-auto"
      style={{ transform: 'translateY(100%)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop for easy tap-out */}
      <div className="fixed inset-0 -top-full bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative thaal paper paper-2 max-h-[85vh] overflow-y-auto shadow-2xl rounded-t-2xl bg-white text-stone-900">
        {/* Top decorative drag handle */}
        <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Header Row */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 text-[11px] font-semibold rounded-sm text-white tracking-wider uppercase"
                    style={{ backgroundColor: zoneColor }}
                  >
                    {zoneInfo.en}
                  </span>

                  {pandal.isHeritage && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                      👑 Heritage {pandal.established ? `(Est. ${pandal.established})` : '(>75 Yrs)'}
                    </span>
                  )}

                  {pandal.isFeatured && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 border border-red-200">
                      ⭐ Featured
                    </span>
                  )}

                  {pandal.rating && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-stone-100 text-stone-800 border border-stone-200">
                      ★ {pandal.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-tight mt-1">
                  {pandal.name}
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 flex items-center gap-1">
                  <span>📍</span>
                  <span>{pandal.address || 'Kolkata, West Bengal'}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Save / Bookmark Button */}
                <button
                  type="button"
                  onClick={() => toggleSavePandal(pandal.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                    isSaved
                      ? 'bg-red-50 text-red-600 border-red-300 shadow-sm'
                      : 'bg-stone-50 text-stone-500 border-stone-300 hover:bg-stone-100'
                  }`}
                  title={isSaved ? 'Remove from Saved' : 'Save Pandal'}
                >
                  <span className="text-sm">{isSaved ? '🔖' : '🤍'}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 flex items-center justify-center text-sm font-bold"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Metro Connectivity Badge */}
            {effectiveMetro && (
              <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-700">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🚇</span>
                  <div>
                    <span className="font-semibold text-stone-900">{effectiveMetro}</span>
                    <span className="text-stone-500 ml-1">মেট্রো স্টেশন</span>
                  </div>
                </div>
                {metroWalkingMinutes !== undefined && (
                  <span className="text-indigo-600 font-bold">
                    🚶 {metroWalkingMinutes} min walk
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Theme Description */}
          {pandal.themeDescription && (
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed italic">
              "{pandal.themeDescription}"
            </div>
          )}

          {/* Crowd Windows / Visiting Hours */}
          {pandal.bestTimeToVisit && pandal.bestTimeToVisit.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                <span>🕒</span>
                <span>সেরা দর্শনের সময় (Visiting Hours & Crowd Windows)</span>
              </div>
              <div className="space-y-1">
                {pandal.bestTimeToVisit.map((time, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-stone-50 border border-stone-200 text-xs text-stone-800 flex items-center justify-between"
                  >
                    <span>{time}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                      পরামর্শ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories & Tags */}
          {((pandal.categories && pandal.categories.length > 0) || (pandal.tags && pandal.tags.length > 0)) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[...(pandal.categories || []), ...(pandal.tags || [])]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          )}

          {/* Action CTAs: Direct working Google Maps Directions */}
          <div className="pt-2 space-y-2">
            <a
              href={directionsDrivingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center gap-2 transition-all no-underline"
            >
              <span>🧭</span>
              <span>গুগল ম্যাপে দর্শন করুন (Get Directions)</span>
            </a>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={directionsTransitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-center border border-stone-200 no-underline"
              >
                <span>🚇</span> Metro
              </a>
              <a
                href={directionsWalkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-center border border-stone-200 no-underline"
              >
                <span>🚶</span> Walk
              </a>
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-center border border-stone-200 no-underline"
                title="Search on Google Maps"
              >
                <span>📍</span> Map Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
