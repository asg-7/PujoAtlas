import React, { useMemo } from 'react';
import type { PandalEntity } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';
import { useMapStore } from '../../store/useMapStore';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes } from '../../lib/geoUtils';
import { t } from '../../lib/i18n';
import { telemetry } from '../../lib/telemetry';

interface PandalCardProps {
  pandal: PandalEntity;
  compact?: boolean;
  onSelect?: () => void;
}

export default function PandalCard({ pandal, compact = false, onSelect }: PandalCardProps) {
  const {
    userLocation,
    language,
    savedPandalIds,
    toggleSavePandal,
    visitedPandalIds,
    toggleVisitedPandal,
    customRoutePandalIds,
    addToRoute,
    removeFromRoute,
    selectEntity,
    setShareModalOpen,
  } = useMapStore();

  const isSaved = savedPandalIds.includes(pandal.id);
  const isVisited = visitedPandalIds.includes(pandal.id);
  const isInRoute = customRoutePandalIds.includes(pandal.id);

  const zoneColor = ZONE_COLORS[pandal.zone] || '#B5513A';

  const distanceKm = useMemo(() => {
    if (!userLocation || !pandal.lat || !pandal.lng || pandal.lat === 0) return null;
    return calculateDistanceKm(userLocation.lat, userLocation.lng, pandal.lat, pandal.lng);
  }, [userLocation, pandal.lat, pandal.lng]);

  const hasValidCoords = pandal.lat && pandal.lng && pandal.lat > 20 && pandal.lng > 80;

  const handleCardClick = () => {
    selectEntity(pandal.id, 'pandal');
    telemetry.track('pandal_card_click', { id: pandal.id, name: pandal.name });
    if (onSelect) onSelect();
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavePandal(pandal.id);
    telemetry.track('pandal_save_toggle', { id: pandal.id, saved: !isSaved });
  };

  const handleVisitedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleVisitedPandal(pandal.id);
    telemetry.track('pandal_visited_toggle', { id: pandal.id, visited: !isVisited });
  };

  const handleRouteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInRoute) {
      removeFromRoute(pandal.id);
    } else {
      addToRoute(pandal.id);
    }
  };

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    telemetry.track('navigate_outbound', { id: pandal.id, name: pandal.name });
    const url = hasValidCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=driving`
      : pandal.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pandal.name + ' Kolkata')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl bg-[var(--chalk-2)] border border-[var(--border)] hover:border-[var(--ink-2)]/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between select-none ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      {/* Top Banner Accent with Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="px-2 py-0.5 text-[10px] font-bold rounded text-white uppercase tracking-wider shadow-xs"
              style={{ backgroundColor: zoneColor }}
            >
              {pandal.zone}
            </span>

            {pandal.isHeritage && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                👑 {pandal.established ? `${2026 - pandal.established} ${t('cards.yrs', language)}` : t('filters.heritage', language)}
              </span>
            )}

            {pandal.isFeatured && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 border border-red-200">
                ⭐ {t('filters.featured', language)}
              </span>
            )}

            {pandal.rating && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[var(--chalk-3)] text-[var(--ink)]">
                ★ {pandal.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Quick Distance from User */}
          {distanceKm !== null && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              📍 {formatDistance(distanceKm, language)} ({estimateWalkingMinutes(distanceKm)}m)
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] tracking-tight leading-snug group-hover:text-red-700 transition-colors">
          {pandal.name}
        </h3>

        {/* Address / Landmark */}
        <p className="text-xs text-[var(--ink-2)] line-clamp-1 flex items-center gap-1">
          <span>📍</span>
          <span>{pandal.address || 'Kolkata, West Bengal'}</span>
        </p>

        {/* Metro Connectivity */}
        {pandal.nearestMetro && (
          <div className="text-[11px] font-medium text-indigo-700 flex items-center gap-1">
            <span>🚇</span>
            <span>{pandal.nearestMetro}</span>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between gap-1.5">
        {/* Directions Button */}
        <button
          type="button"
          onClick={handleDirectionsClick}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all active:scale-95"
          title="Open in Google Maps (গুগল ম্যাপে দর্শন)"
        >
          <span>🧭</span>
          <span>{t('cards.directions', language)}</span>
        </button>

        {/* Action icons: Save, Check In, Add to Route */}
        <div className="flex items-center gap-1">
          {/* Add to Itinerary Route */}
          <button
            type="button"
            onClick={handleRouteToggle}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs transition-all ${
              isInRoute
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-[var(--chalk)] text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
            }`}
            title={isInRoute ? 'Remove from Route' : 'Add to My Route (রুটে যুক্ত করুন)'}
          >
            {isInRoute ? '✓' : '➕'}
          </button>

          {/* Check In / Visited */}
          <button
            type="button"
            onClick={handleVisitedToggle}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs transition-all ${
              isVisited
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-[var(--chalk)] text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
            }`}
            title={isVisited ? 'Visited (দেখা হয়েছে)' : 'Check In (দর্শন করেছি)'}
          >
            {isVisited ? '✓' : '👁️'}
          </button>

          {/* Save / Bookmark */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs transition-all ${
              isSaved
                ? 'bg-red-50 text-red-600 border-red-300 shadow-xs'
                : 'bg-[var(--chalk)] text-[var(--ink-2)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Pandal (সংরক্ষণ)'}
          >
            {isSaved ? '🔖' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
}

export { PandalCard };
