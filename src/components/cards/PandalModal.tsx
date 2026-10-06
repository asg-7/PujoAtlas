import React, { useMemo } from 'react';
import type { PandalEntity } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';
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

  const zoneColor = ZONE_COLORS[pandal.zone] || '#B5513A';
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

  const directionsTransitUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=transit`
    : googleMapsSearchUrl;

  const directionsWalkUrl = hasValidCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=walking`
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* Tap backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--chalk)] text-[var(--ink)] rounded-t-3xl sm:rounded-3xl border border-[var(--border)] shadow-2xl z-10 flex flex-col">
        {/* Top Header Row with Accent */}
        <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--chalk-2)]">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="px-2.5 py-0.5 text-[10px] font-bold rounded text-white uppercase tracking-wider shadow-xs"
                  style={{ backgroundColor: zoneColor }}
                >
                  {pandal.zone}
                </span>

                {pandal.isHeritage && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300">
                    👑 Heritage {pandal.established ? `(${2026 - pandal.established} Yrs • Est. ${pandal.established})` : '(>75 Yrs)'}
                  </span>
                )}

                {pandal.isFeatured && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 border border-red-200">
                    ⭐ Featured
                  </span>
                )}

                {pandal.rating && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--chalk-3)] text-[var(--ink)]">
                    ★ {pandal.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <h2 className="font-serif font-black text-xl sm:text-2xl text-[var(--ink)] tracking-tight leading-tight">
                {pandal.name}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--ink-2)] flex items-center gap-1">
                <span>📍</span>
                <span>{pandal.address || 'Kolkata, West Bengal'}</span>
              </p>

              {distanceKm !== null && (
                <p className="text-xs font-bold text-emerald-700">
                  📍 {formatDistance(distanceKm, language)} away from your location ({estimateWalkingMinutes(distanceKm)} min walk)
                </p>
              )}
            </div>

            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--chalk)] text-[var(--ink)] hover:bg-[var(--chalk-3)] flex items-center justify-center text-sm font-bold shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Quick Metro Badge */}
          {pandal.nearestMetro && (
            <div className="mt-3 pt-2.5 border-t border-[var(--border)]/70 flex items-center justify-between text-xs text-[var(--ink-2)]">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🚇</span>
                <span className="font-semibold text-[var(--ink)]">{pandal.nearestMetro} Metro Station</span>
              </div>
              <span className="font-bold text-indigo-700">🚶 ~5 min walk</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Theme Description */}
          {pandal.themeDescription && (
            <div className="p-3.5 rounded-xl bg-[var(--chalk-2)] border border-[var(--border)] text-xs sm:text-sm text-[var(--ink-2)] leading-relaxed italic">
              "{pandal.themeDescription}"
            </div>
          )}

          {/* Visiting Windows / Crowd Windows */}
          {pandal.bestTimeToVisit && pandal.bestTimeToVisit.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                <span>🕒</span>
                <span>{t('cards.visitingHours', language)}</span>
              </h4>
              <div className="space-y-1.5">
                {pandal.bestTimeToVisit.map((time, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[var(--chalk-2)] border border-[var(--border)] text-xs text-[var(--ink)] flex items-center justify-between"
                  >
                    <span>{time}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                      Recommended
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Food Spots */}
          {nearbyFood.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <span>🍽️</span>
                <span>Eat Around This Pandal (কাছের বিখ্যাত খাবার)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {nearbyFood.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-[var(--chalk-2)] border border-[var(--border)] space-y-1"
                  >
                    <div className="text-xs font-bold text-[var(--ink)] truncate">{f.name}</div>
                    <div className="text-[10px] text-[var(--ink-3)] line-clamp-1">{f.mustTryDishes?.join(', ')}</div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.name + ' Kolkata')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-amber-800 hover:underline block pt-1"
                    >
                      Maps ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Save, Check In, Add to Route, Share */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <button
              onClick={() => toggleSavePandal(pandal.id)}
              className={`py-2.5 px-1 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isSaved ? 'bg-red-50 text-red-600 border-red-300' : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)]'
              }`}
            >
              <span>{isSaved ? '🔖' : '🤍'}</span>
              <span>{isSaved ? t('cards.saved', language) : t('cards.save', language)}</span>
            </button>

            <button
              onClick={() => toggleVisitedPandal(pandal.id)}
              className={`py-2.5 px-1 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isVisited ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)]'
              }`}
            >
              <span>{isVisited ? '✓' : '👁️'}</span>
              <span>{isVisited ? t('cards.visited', language) : t('cards.markVisited', language)}</span>
            </button>

            <button
              onClick={() => (isInRoute ? removeFromRoute(pandal.id) : addToRoute(pandal.id))}
              className={`py-2.5 px-1 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isInRoute ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)]'
              }`}
            >
              <span>{isInRoute ? '✓' : '➕'}</span>
              <span>{isInRoute ? t('cards.inRoute', language) : t('cards.addToRoute', language)}</span>
            </button>

            <button
              onClick={handleShare}
              className="py-2.5 px-1 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--chalk-2)] text-[var(--ink)] flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <span>📤</span>
              <span>{t('cards.share', language)}</span>
            </button>
          </div>

          {/* Primary Navigation CTAs */}
          <div className="pt-2 space-y-2">
            <a
              href={directionsDrivingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center gap-2 no-underline cursor-pointer"
            >
              <span>🧭</span>
              <span>{t('cards.directions', language)} (Google Maps)</span>
            </a>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={directionsTransitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 text-xs font-semibold rounded-lg bg-[var(--chalk-2)] hover:bg-[var(--chalk-3)] text-[var(--ink)] text-center border border-[var(--border)] no-underline"
              >
                <span>🚇</span> Metro
              </a>
              <a
                href={directionsWalkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 text-xs font-semibold rounded-lg bg-[var(--chalk-2)] hover:bg-[var(--chalk-3)] text-[var(--ink)] text-center border border-[var(--border)] no-underline"
              >
                <span>🚶</span> Walk
              </a>
              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-1 text-xs font-semibold rounded-lg bg-[var(--chalk-2)] hover:bg-[var(--chalk-3)] text-[var(--ink)] text-center border border-[var(--border)] no-underline"
              >
                <span>📍</span> Place Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PandalModal };
