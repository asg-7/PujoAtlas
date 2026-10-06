import React, { useMemo } from 'react';
import {
  Navigation,
  Bookmark,
  Check,
  Plus,
  Star,
  Landmark,
  Eye,
  Footprints,
  Train,
} from 'lucide-react';
import type { PandalEntity } from '../../lib/schemas';
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
  } = useMapStore();

  const isSaved = savedPandalIds.includes(pandal.id);
  const isVisited = visitedPandalIds.includes(pandal.id);
  const isInRoute = customRoutePandalIds.includes(pandal.id);

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
      : pandal.googleMapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pandal.name + ' Kolkata')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const establishedYear = pandal.established || 0;
  const heritageAge = pandal.heritageAge || (establishedYear ? 2026 - establishedYear : null);

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-md bg-paper dark:bg-surface border border-sand dark:border-line hover:border-smoke/40 dark:hover:border-smoke/60 shadow-e1 hover:shadow-e2 transition-all duration-fast overflow-hidden cursor-pointer flex flex-col justify-between select-none ${
        compact ? 'p-3' : 'p-4'
      }`}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`${pandal.name} Pandal Card`}
    >
      {/* Top Meta Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-sm bg-sand/60 dark:bg-line text-ink dark:text-text uppercase tracking-wider">
              {pandal.zone}
            </span>

            {pandal.isHeritage && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-terracotta/10 text-terracotta dark:text-smoke border border-terracotta/30 flex items-center gap-1">
                <Landmark className="w-3 h-3" strokeWidth={1.5} />
                <span>
                  {heritageAge ? `${heritageAge} ${t('cards.yrs', language)}` : t('filters.heritage', language)}
                </span>
              </span>
            )}

            {pandal.isFeatured && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-haldi/10 text-haldi border border-haldi/30 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" strokeWidth={1.5} />
                <span>{t('filters.featured', language)}</span>
              </span>
            )}
          </div>

          {/* Rating */}
          {pandal.rating && (
            <div className="flex items-center gap-0.5 text-xs font-semibold text-ink dark:text-text">
              <Star className="w-3 h-3 fill-marigold text-marigold" strokeWidth={1.5} />
              <span>{pandal.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Pandal Title */}
        <div>
          <h3 className="font-serif font-semibold text-base sm:text-lg text-ink dark:text-text tracking-tight group-hover:text-kumkum dark:group-hover:text-kumkum-lit transition-colors duration-fast leading-snug">
            {language === 'bn' ? pandal.bngName || pandal.name : pandal.name}
          </h3>
          <p className="text-xs text-smoke dark:text-text-muted mt-1 line-clamp-1 leading-normal">
            {pandal.address}
          </p>
        </div>

        {/* Nearest Metro & Live GPS Distance */}
        <div className="flex items-center gap-3 text-xs text-smoke dark:text-text-muted pt-1 flex-wrap">
          {pandal.nearestMetro && (
            <div className="flex items-center gap-1 truncate max-w-[200px]" title={pandal.nearestMetro}>
              <Train className="w-3.5 h-3.5 text-neel shrink-0" strokeWidth={1.5} />
              <span className="truncate">{pandal.nearestMetro}</span>
            </div>
          )}

          {distanceKm !== null && (
            <div className="flex items-center gap-1 shrink-0 font-medium text-ink dark:text-text">
              <Footprints className="w-3.5 h-3.5 text-kumkum dark:text-kumkum-lit shrink-0" strokeWidth={1.5} />
              <span>
                {formatDistance(distanceKm, language)} · ~{estimateWalkingMinutes(distanceKm)} {language === 'bn' ? 'মি' : 'min'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="mt-3.5 pt-3 border-t border-sand/60 dark:border-line flex items-center justify-between gap-2">
        {/* Directions CTA */}
        <button
          type="button"
          onClick={handleDirectionsClick}
          className="flex-1 py-1.5 px-3 rounded-md bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit dark:hover:bg-kumkum text-shola dark:text-base text-xs font-medium flex items-center justify-center gap-1.5 shadow-e1 transition-colors duration-fast cursor-pointer min-h-[36px]"
          title="Get Directions in Google Maps"
        >
          <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{t('cards.directions', language)}</span>
        </button>

        {/* Action Icon Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Add to Route */}
          <button
            type="button"
            onClick={handleRouteToggle}
            className={`w-9 h-9 rounded-md flex items-center justify-center border text-xs transition-all duration-fast cursor-pointer ${
              isInRoute
                ? 'bg-kumkum/10 text-kumkum dark:text-kumkum-lit border-kumkum/40 font-bold'
                : 'bg-paper dark:bg-surface text-smoke dark:text-text-muted border-sand dark:border-line hover:bg-sand/20'
            }`}
            title={isInRoute ? 'Remove from Route' : 'Add to Route'}
            aria-label="Toggle Route"
          >
            {isInRoute ? <Check className="w-4 h-4" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
          </button>

          {/* Visited Check In */}
          <button
            type="button"
            onClick={handleVisitedToggle}
            className={`w-9 h-9 rounded-md flex items-center justify-center border text-xs transition-all duration-fast cursor-pointer ${
              isVisited
                ? 'bg-kumkum/10 text-kumkum dark:text-kumkum-lit border-kumkum/40 font-bold'
                : 'bg-paper dark:bg-surface text-smoke dark:text-text-muted border-sand dark:border-line hover:bg-sand/20'
            }`}
            title={isVisited ? 'Visited (দেখা হয়েছে)' : 'Check In (দর্শন করেছি)'}
            aria-label="Toggle Visited Check In"
          >
            {isVisited ? <Check className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
          </button>

          {/* Save / Bookmark */}
          <button
            type="button"
            onClick={handleSaveToggle}
            className={`w-9 h-9 rounded-md flex items-center justify-center border text-xs transition-all duration-fast cursor-pointer ${
              isSaved
                ? 'bg-neel/10 text-neel border-neel/40 shadow-e1'
                : 'bg-paper dark:bg-surface text-smoke dark:text-text-muted border-sand dark:border-line hover:bg-sand/20'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Pandal (সংরক্ষণ)'}
            aria-label="Toggle Bookmark"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { PandalCard };
