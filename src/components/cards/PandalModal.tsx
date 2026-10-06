import React, { useMemo } from 'react';
import {
  Navigation,
  Bookmark,
  Share2,
  Plus,
  Check,
  Clock,
  Users,
  Train,
  UtensilsCrossed,
  X,
  Landmark,
  Star,
  Footprints,
  Calendar,
} from 'lucide-react';
import type { PandalEntity } from '../../lib/schemas';
import { useMapStore } from '../../store/useMapStore';
import { t } from '../../lib/i18n';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes } from '../../lib/geoUtils';
import { telemetry } from '../../lib/telemetry';

interface PandalModalProps {
  pandal: PandalEntity;
  onClose: () => void;
}

export default function PandalModal({ pandal, onClose }: PandalModalProps) {
  const {
    food,
    language,
    userLocation,
    savedPandalIds,
    toggleSavePandal,
    visitedPandalIds,
    toggleVisitedPandal,
    customRoutePandalIds,
    addToRoute,
    removeFromRoute,
    setShareModalOpen,
  } = useMapStore();

  const isSaved = savedPandalIds.includes(pandal.id);
  const isVisited = visitedPandalIds.includes(pandal.id);
  const isInRoute = customRoutePandalIds.includes(pandal.id);

  const hasValidCoords = pandal.lat && pandal.lng && pandal.lat > 20 && pandal.lng > 80;

  const distanceKm = useMemo(() => {
    if (!userLocation || !hasValidCoords) return null;
    return calculateDistanceKm(userLocation.lat, userLocation.lng, pandal.lat, pandal.lng);
  }, [userLocation, pandal.lat, pandal.lng, hasValidCoords]);

  // Nearby food spots in the same zone
  const nearbyFood = useMemo(() => {
    return food
      .filter((f) => f.zone === pandal.zone || f.associatedPandals?.includes(pandal.id))
      .slice(0, 3);
  }, [food, pandal]);

  const googleMapsSearchUrl =
    pandal.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pandal.name + ' Durga Puja, ' + (pandal.address || 'Kolkata'))}`;

  const directionsDrivingUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=driving`
    : googleMapsSearchUrl;

  const handleShare = () => {
    telemetry.track('share_click', { id: pandal.id, name: pandal.name });
    if (navigator.share) {
      navigator
        .share({
          title: `${pandal.name} — Pujo Atlas 2026`,
          text: `Check out ${pandal.name} on Pujo Atlas 2026! 📍 ${pandal.address}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      setShareModalOpen(true);
    }
  };

  const establishedYear = pandal.established || 0;
  const heritageAge = pandal.heritageAge || (establishedYear ? 2026 - establishedYear : null);

  // Crowd status mapping: low (1 dot), moderate (2 dots), high (3 dots)
  const crowd = pandal.crowdLevel?.toLowerCase() || 'moderate';
  const crowdDots = crowd === 'low' ? 1 : crowd === 'high' ? 3 : 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 dark:bg-black/70 backdrop-blur-xs transition-opacity duration-base"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pandal-title"
    >
      {/* Tap backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Bottom Sheet / Modal Card */}
      <div
        className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[85vh] bg-paper dark:bg-surface text-ink dark:text-text rounded-t-lg sm:rounded-lg border border-sand dark:border-line shadow-e3 z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-base"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 bg-paper dark:bg-surface">
          <div className="w-10 h-1 rounded-full bg-sand dark:bg-line" />
        </div>

        {/* 1. Hero 16:9 Banner Header with Scrim */}
        <div className="relative bg-base text-shola p-5 sm:p-6 overflow-hidden border-b border-sand dark:border-line">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-base via-base/80 to-transparent z-0" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-shola/10 hover:bg-shola/20 text-shola flex items-center justify-center transition-colors duration-fast cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-sm bg-sand/20 text-shola uppercase tracking-wider">
                {pandal.zone} KOLKATA
              </span>

              {pandal.isHeritage && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-terracotta/40 text-shola border border-terracotta/60 flex items-center gap-1">
                  <Landmark className="w-3 h-3" strokeWidth={1.5} />
                  <span>
                    {heritageAge ? `${heritageAge} Yrs (Est. ${pandal.established})` : 'Heritage (>75 Yrs)'}
                  </span>
                </span>
              )}

              {pandal.isFeatured && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-haldi/30 text-shola border border-haldi/50 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" strokeWidth={1.5} />
                  <span>Featured</span>
                </span>
              )}
            </div>

            <h2
              id="modal-pandal-title"
              className="font-serif font-semibold text-xl sm:text-2xl text-shola tracking-tight leading-tight"
            >
              {language === 'bn' ? pandal.bngName || pandal.name : pandal.name}
            </h2>

            <p className="text-xs text-smoke leading-normal flex items-start gap-1">
              <span>📍</span>
              <span>{pandal.address}</span>
            </p>
          </div>
        </div>

        {/* Scrollable Editorial Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* 2. Live Crowd Level & Trust Signal */}
          <div className="p-3.5 rounded-md bg-shola dark:bg-raised border border-sand dark:border-line flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-smoke shrink-0" strokeWidth={1.5} />
              <div>
                <div className="text-xs font-semibold text-ink dark:text-text flex items-center gap-1.5">
                  <span>{language === 'bn' ? 'ভিড়ের মাত্রা' : 'Live Crowd Level'}:</span>
                  <span className="capitalize font-bold text-kumkum dark:text-kumkum-lit">{crowd}</span>
                  {/* Shape-based crowd dots */}
                  <span className="flex items-center gap-0.5 ml-1" title={`${crowdDots} of 3 crowd intensity`}>
                    {[1, 2, 3].map((dot) => (
                      <span
                        key={dot}
                        className={`w-1.5 h-1.5 rounded-full ${
                          dot <= crowdDots ? 'bg-kumkum dark:bg-kumkum-lit' : 'bg-sand dark:bg-line'
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <div className="text-[11px] text-smoke dark:text-text-muted mt-0.5">
                  Last updated: 2h ago
                </div>
              </div>
            </div>

            {pandal.rating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-sand/30 dark:bg-line text-xs font-bold text-ink dark:text-text">
                <Star className="w-3.5 h-3.5 fill-marigold text-marigold" strokeWidth={1.5} />
                <span>{pandal.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 3. Timings & Best Days */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-smoke dark:text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{language === 'bn' ? 'দর্শনের সেরা সময় ও নির্ঘণ্ট' : 'Visiting Hours & Aarti'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-md bg-shola dark:bg-raised border border-sand dark:border-line">
                <span className="font-semibold text-ink dark:text-text block">
                  {language === 'bn' ? 'অনুকূল সময়' : 'Best Visiting Window'}
                </span>
                <span className="text-smoke dark:text-text-muted mt-0.5 block">
                  {pandal.bestTimeToVisit?.join(', ') || '11:00 AM – 3:00 PM (Low Crowd) · 8:00 PM+ (Lighting)'}
                </span>
              </div>
              <div className="p-3 rounded-md bg-shola dark:bg-raised border border-sand dark:border-line">
                <span className="font-semibold text-ink dark:text-text block">
                  {language === 'bn' ? 'প্রধান দিনসমূহ' : 'Peak Festival Days'}
                </span>
                <span className="text-smoke dark:text-text-muted mt-0.5 block">
                  {pandal.bestDays?.join(', ') || 'Shashthi, Saptami, Ashtami, Navami'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Nearest Transit & Walking Distance */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-smoke dark:text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{language === 'bn' ? 'যাতায়াত ও মেট্রো সংযোগ' : 'Transit & Connectivity'}</span>
            </h4>
            <div className="p-3 rounded-md bg-shola dark:bg-raised border border-sand dark:border-line text-xs space-y-1.5">
              {pandal.nearestMetro && (
                <div className="flex items-center gap-2 text-ink dark:text-text font-medium">
                  <span className="w-2 h-2 rounded-full bg-neel shrink-0" />
                  <span>Nearest Station: <strong>{pandal.nearestMetro}</strong></span>
                </div>
              )}
              {distanceKm !== null && (
                <div className="flex items-center gap-2 text-smoke dark:text-text-muted">
                  <Footprints className="w-3.5 h-3.5 text-kumkum dark:text-kumkum-lit shrink-0" strokeWidth={1.5} />
                  <span>
                    Distance from your location: <strong>{formatDistance(distanceKm, language)}</strong> (~{estimateWalkingMinutes(distanceKm)} min walk)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Theme Story & Editorial Description */}
          {pandal.themeDescription && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-smoke dark:text-text-muted uppercase tracking-wider">
                {language === 'bn' ? 'থিম ও ভাবনা' : 'Theme & Artistic Vision'}
              </h4>
              <p className="text-xs text-ink dark:text-text leading-relaxed p-3 rounded-md bg-shola dark:bg-raised border border-sand dark:border-line">
                {pandal.themeDescription}
              </p>
            </div>
          )}

          {/* 6. Nearby Food & Sweets */}
          {nearbyFood.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-smoke dark:text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{language === 'bn' ? 'কাছের মিষ্টি ও খাবারের দোকান' : 'Nearby Food & Sweets'}</span>
              </h4>
              <div className="space-y-1.5">
                {nearbyFood.map((spot) => (
                  <div
                    key={spot.id}
                    className="p-2.5 rounded-md bg-shola dark:bg-raised border border-sand dark:border-line flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-ink dark:text-text block">{spot.name}</span>
                      <span className="text-[11px] text-smoke dark:text-text-muted">{spot.address}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' Kolkata')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-sand/30 dark:bg-line text-ink dark:text-text text-[11px] font-semibold hover:bg-sand/60 transition-colors"
                    >
                      Map ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. Sticky Bottom Action Controls Row */}
        <div className="p-3 sm:p-4 bg-paper dark:bg-surface border-t border-sand dark:border-line flex items-center justify-between gap-2 shadow-e2">
          {/* Main Driving/Walking Navigation Button */}
          <a
            href={directionsDrivingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-md bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit dark:hover:bg-kumkum text-shola dark:text-base text-xs font-semibold flex items-center justify-center gap-2 shadow-e1 transition-colors duration-fast no-underline min-h-[44px]"
          >
            <Navigation className="w-4 h-4" strokeWidth={1.5} />
            <span>{language === 'bn' ? 'গুগল ম্যাপে যান' : 'Get Directions'}</span>
          </a>

          {/* Add to Route */}
          <button
            onClick={() => (isInRoute ? removeFromRoute(pandal.id) : addToRoute(pandal.id))}
            className={`h-11 px-3 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-all duration-fast cursor-pointer ${
              isInRoute
                ? 'bg-kumkum/10 text-kumkum dark:text-kumkum-lit border-kumkum/40'
                : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
            }`}
            title={isInRoute ? 'In Route' : 'Add to Route'}
            aria-label="Add to Route"
          >
            {isInRoute ? <Check className="w-4 h-4" strokeWidth={2} /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
            <span className="hidden sm:inline">{isInRoute ? 'In Route' : 'Add Route'}</span>
          </button>

          {/* Save / Bookmark */}
          <button
            onClick={() => toggleSavePandal(pandal.id)}
            className={`h-11 w-11 rounded-md border flex items-center justify-center transition-all duration-fast cursor-pointer ${
              isSaved
                ? 'bg-neel/10 text-neel border-neel/40 shadow-e1'
                : 'bg-paper dark:bg-surface text-smoke dark:text-text-muted border-sand dark:border-line hover:bg-sand/20'
            }`}
            title={isSaved ? 'Saved' : 'Save Pandal'}
            aria-label="Bookmark pandal"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} strokeWidth={1.5} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="h-11 w-11 rounded-md border border-sand dark:border-line bg-paper dark:bg-surface text-smoke dark:text-text-muted hover:bg-sand/20 flex items-center justify-center transition-colors duration-fast cursor-pointer"
            title="Share"
            aria-label="Share pandal"
          >
            <Share2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { PandalModal };
