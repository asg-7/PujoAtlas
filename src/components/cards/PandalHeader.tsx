import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PandalEntity, Zone } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';
import { navigateToDestination, TRAVEL_MODE_META } from '../../lib/navigation';
import type { TravelMode } from '../../lib/navigation';

interface PandalHeaderProps {
  pandal: PandalEntity;
  metroStationName?: string;
  metroWalkingMinutes?: number;
  onClose: () => void;
  onNavigate?: (lat: number, lng: number) => void;
}

const ZONE_LABELS: Record<Zone, string> = {
  NORTH: 'North Kolkata',
  SOUTH: 'South Kolkata',
  CENTRAL: 'Central Kolkata',
  EAST: 'East Kolkata',
  WEST: 'West Kolkata',
};

const PLATFORM_ICONS: Record<string, string> = {
  reddit: '🔗',
  instagram: '📸',
  google: '📍',
  facebook: '👥',
};

export default function PandalHeader({
  pandal,
  metroStationName,
  metroWalkingMinutes,
  onClose,
  onNavigate,
}: PandalHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNavOptions, setShowNavOptions] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false });

  const zoneColor = ZONE_COLORS[pandal.zone];

  // --- Drag gesture handling for bottom sheet ---
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
    navigateToDestination(pandal.id, pandal.lat, pandal.lng, mode);
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
      <div className="relative bg-pujo-card rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full text-white"
                  style={{ backgroundColor: zoneColor }}
                >
                  {ZONE_LABELS[pandal.zone]}
                </span>
                {pandal.isFamous && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-pujo-gold text-black rounded-full">
                    ⭐ Famous
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white truncate">{pandal.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{pandal.address}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Metro proximity */}
        {metroStationName && (
          <div className="mx-4 mb-3 px-3 py-2 bg-gray-800/60 rounded-lg flex items-center gap-2">
            <span className="text-lg">🚇</span>
            <div>
              <p className="text-sm text-white font-medium">{metroStationName}</p>
              {metroWalkingMinutes !== undefined && (
                <p className="text-xs text-gray-400">{metroWalkingMinutes} min walk</p>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {pandal.tags.length > 0 && (
          <div className="px-4 mb-3 flex flex-wrap gap-1.5">
            {pandal.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[11px] bg-gray-800 text-gray-300 rounded-full border border-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Best days */}
        <div className="px-4 mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Best Days</p>
          <div className="flex flex-wrap gap-1.5">
            {pandal.bestDays.map((day) => (
              <span
                key={day}
                className="px-2 py-1 text-xs font-medium bg-pujo-gold/10 text-pujo-gold border border-pujo-gold/20 rounded-md"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Social proof chips */}
        {pandal.sourceUrls.length > 0 && (
          <div className="px-4 mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Community Sources</p>
            <div className="flex flex-wrap gap-2">
              {pandal.sourceUrls.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 transition-colors"
                >
                  <span>{PLATFORM_ICONS[source.platform] ?? '🔗'}</span>
                  <span className="capitalize">{source.platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Direct Google Maps Navigation */}
        <div className="px-4 pb-4">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pandal.name + ' Durga Puja, ' + pandal.address + ', Kolkata')}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 font-bold rounded-xl text-sm shadow-lg shadow-yellow-500/20 hover:from-amber-400 hover:to-yellow-300 active:scale-[0.98] transition-all no-underline text-center"
          >
            <span>🧭</span>
            <span>Navigate to Pandal in Google Maps</span>
          </a>

          <div className="flex gap-2 pt-2.5">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pandal.name + ' Durga Puja, ' + pandal.address + ', Kolkata')}&travelmode=transit`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gray-800/90 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors no-underline text-center"
              title="Navigate via Metro/Bus"
            >
              <span>🚇</span> Metro
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gray-800/90 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors no-underline text-center"
              title="Walk to exact entrance pin"
            >
              <span>🚶</span> Walk
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gray-800/90 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors no-underline text-center"
              title="Exact GPS Coordinates: ${pandal.lat}, ${pandal.lng}"
            >
              <span>📍</span> GPS Pin
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pandal.name + ' Durga Puja ' + pandal.address + ' Kolkata')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-gray-800/90 hover:bg-gray-700 text-xs font-semibold text-gray-200 rounded-lg border border-gray-700 transition-colors no-underline text-center"
              title="View place details and reviews"
            >
              <span>🔍</span> Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
