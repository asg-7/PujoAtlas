import React, { useState } from 'react';
import {
  Route,
  Navigation,
  Sparkles,
  MapPin,
  Clock,
  Footprints,
  Check,
  Trash2,
  ChevronUp,
  ChevronDown,
  Car,
  Train,
  Share2,
} from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import { PUJA_TRAILS, type PujaTrail } from '../../data/trails';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes, optimizeRouteOrder } from '../../lib/geoUtils';
import { EmptyState } from '../common/EmptyState';
import { t } from '../../lib/i18n';

export const PlannerView: React.FC = () => {
  const {
    pandals,
    language,
    customRoutePandalIds,
    userLocation,
    removeFromRoute,
    clearRoute,
    setRoutePandals,
    selectEntity,
    setActiveTab,
  } = useMapStore();

  const [activeSubTab, setActiveSubTab] = useState<'trails' | 'custom'>('trails');
  const [activeTrailId, setActiveTrailId] = useState<string | null>(PUJA_TRAILS[0].id);
  const [travelMode, setTravelMode] = useState<'walk' | 'drive' | 'metro'>('walk');

  // Map pandal objects for custom route
  const routePandals = customRoutePandalIds
    .map((id) => pandals.find((p) => p.id === id))
    .filter(Boolean) as (typeof pandals)[0][];

  // Calculate route metrics
  let totalDistanceKm = 0;
  for (let i = 0; i < routePandals.length - 1; i++) {
    const p1 = routePandals[i];
    const p2 = routePandals[i + 1];
    if (p1.lat && p1.lng && p2.lat && p2.lng) {
      totalDistanceKm += calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
    }
  }

  const speedKmh = travelMode === 'walk' ? 4.0 : travelMode === 'drive' ? 18.0 : 12.0;
  const totalMinutes = Math.round((totalDistanceKm / speedKmh) * 60);

  // Optimize route order
  const handleOptimizeRoute = () => {
    if (routePandals.length < 3) return;
    const optimized = optimizeRouteOrder(
      routePandals.map((p) => ({ ...p, id: p.id })),
      userLocation || undefined
    );
    setRoutePandals(optimized.map((p) => p.id));
  };

  // Reorder single stop
  const moveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= customRoutePandalIds.length) return;
    const newIds = [...customRoutePandalIds];
    const [moved] = newIds.splice(index, 1);
    newIds.splice(targetIndex, 0, moved);
    setRoutePandals(newIds);
  };

  // Build Google Maps Multi-Destination URL
  const buildGoogleMapsRouteUrl = (items: typeof routePandals) => {
    if (items.length === 0) return '#';
    if (items.length === 1) {
      return (
        items[0].googleMapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${items[0].lat},${items[0].lng}`
      );
    }
    const origin = `${items[0].lat},${items[0].lng}`;
    const destination = `${items[items.length - 1].lat},${items[items.length - 1].lng}`;
    const mode = travelMode === 'walk' ? 'walking' : travelMode === 'drive' ? 'driving' : 'transit';
    if (items.length === 2) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`;
    }
    const waypoints = items
      .slice(1, -1)
      .map((p) => `${p.lat},${p.lng}`)
      .join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=${mode}`;
  };

  const handleLoadTrail = (trail: PujaTrail) => {
    setRoutePandals(trail.pandalIds);
    setActiveSubTab('custom');
  };

  return (
    <div className="flex flex-col h-full bg-shola dark:bg-base overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-surface border-b border-sand dark:border-line p-6 sm:p-8 text-ink dark:text-text shadow-e1">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sand/40 dark:bg-line text-xs font-semibold text-terracotta uppercase tracking-wider">
            <Route className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{language === 'bn' ? 'স্মার্ট রুট প্ল্যানার' : 'Route Optimizer & Trails'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink dark:text-text tracking-tight">
            {language === 'bn' ? 'পরিক্রমা প্ল্যানার' : 'Plan My Puja Route'}
          </h1>
          <p className="text-xs sm:text-sm text-smoke dark:text-text-muted max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'সেরা কিউরেটেড ট্রেইল বেছে নিন অথবা আপনার পছন্দের মণ্ডপগুলো দিয়ে সবচেয়ে কম দূরত্বের রুট সাজিয়ে নিন।'
              : 'Choose expert-curated walking trails or build a custom route with automatic shortest-path optimization.'}
          </p>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1.5 pt-3">
            <button
              onClick={() => setActiveSubTab('trails')}
              className={`py-1.5 px-3.5 text-xs font-medium rounded-full border transition-all duration-fast cursor-pointer min-h-[36px] ${
                activeSubTab === 'trails'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              Curated Trails ({PUJA_TRAILS.length})
            </button>
            <button
              onClick={() => setActiveSubTab('custom')}
              className={`py-1.5 px-3.5 text-xs font-medium rounded-full border transition-all duration-fast flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                activeSubTab === 'custom'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              <span>My Itinerary</span>
              {customRoutePandalIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-sindoor text-shola text-[10px] flex items-center justify-center font-bold">
                  {customRoutePandalIds.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
        {activeSubTab === 'trails' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PUJA_TRAILS.map((trail) => {
                const isSelected = activeTrailId === trail.id;
                return (
                  <div
                    key={trail.id}
                    className={`rounded-md border p-5 flex flex-col justify-between transition-all duration-fast cursor-pointer ${
                      isSelected
                        ? 'border-kumkum dark:border-kumkum-lit bg-paper dark:bg-surface shadow-e2 ring-1 ring-kumkum/30'
                        : 'border-sand dark:border-line bg-paper dark:bg-surface hover:border-smoke/40 shadow-e1'
                    }`}
                    onClick={() => setActiveTrailId(trail.id)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-sand/60 dark:bg-line text-ink dark:text-text uppercase tracking-wider">
                          {trail.zone} KOLKATA
                        </span>
                        <span className="text-xs text-smoke dark:text-text-muted font-medium">
                          {trail.distanceKm} km · ~{trail.estimatedHours}h
                        </span>
                      </div>

                      <h3 className="text-base font-serif font-semibold text-ink dark:text-text">
                        {language === 'bn' ? trail.bngTitle : trail.title}
                      </h3>
                      <p className="text-xs text-smoke dark:text-text-muted leading-relaxed line-clamp-2">
                        {trail.description}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-1">
                        {trail.highlights.slice(0, 2).map((hl, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 bg-shola dark:bg-base text-ink dark:text-text border border-sand dark:border-line rounded-sm"
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-sand/60 dark:border-line flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadTrail(trail);
                        }}
                        className="flex-1 py-1.5 px-3 bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-xs font-semibold rounded-md shadow-e1 flex items-center justify-center gap-1.5 transition-colors duration-fast min-h-[36px]"
                      >
                        <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Start Trail</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTrailId(trail.id);
                        }}
                        className="py-1.5 px-3 bg-shola dark:bg-base border border-sand dark:border-line hover:bg-sand/20 text-ink dark:text-text text-xs font-medium rounded-md transition-colors duration-fast min-h-[36px]"
                      >
                        {isSelected ? 'Selected' : 'View Stops'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Custom Route Tab */
          <div>
            {routePandals.length === 0 ? (
              <EmptyState
                title={language === 'bn' ? 'আপনার রুটে কোনো মণ্ডপ নেই' : 'Your Puja Route is Empty'}
                description={
                  language === 'bn'
                    ? 'যেকোনো মণ্ডপ কার্ডে "রুট"-এ ক্লিক করে যুক্ত করুন অথবা কিউরেটেড ট্রেইলগুলো থেকে শুরু করুন।'
                    : 'Click "Route" on any pandal card to build your personalized itinerary, or load a curated trail.'
                }
                primaryActionLabel="Explore Curated Trails"
                onPrimaryAction={() => setActiveSubTab('trails')}
                secondaryActionLabel="Browse All Pandals"
                onSecondaryAction={() => setActiveTab('explore')}
              />
            ) : (
              <div className="space-y-4">
                {/* Route Summary Bar */}
                <div className="bg-paper dark:bg-surface rounded-md border border-sand dark:border-line p-4 shadow-e1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[11px] text-smoke dark:text-text-muted uppercase font-semibold">
                          Stops
                        </div>
                        <div className="text-xl font-bold font-serif text-ink dark:text-text">
                          {routePandals.length}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-sand dark:bg-line" />
                      <div>
                        <div className="text-[11px] text-smoke dark:text-text-muted uppercase font-semibold">
                          Est. Distance
                        </div>
                        <div className="text-xl font-bold font-serif text-kumkum dark:text-kumkum-lit">
                          {formatDistance(totalDistanceKm, language)}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-sand dark:bg-line" />
                      <div>
                        <div className="text-[11px] text-smoke dark:text-text-muted uppercase font-semibold">
                          Est. Time
                        </div>
                        <div className="text-xl font-bold font-serif text-ink dark:text-text">
                          ~{totalMinutes} min
                        </div>
                      </div>
                    </div>

                    {/* Travel Mode Selector */}
                    <div className="flex items-center gap-1 bg-shola dark:bg-base p-1 rounded-md border border-sand dark:border-line">
                      <button
                        onClick={() => setTravelMode('walk')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                          travelMode === 'walk' ? 'bg-kumkum text-shola font-semibold' : 'text-smoke hover:text-ink'
                        }`}
                        title="Walking mode"
                      >
                        <Footprints className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Walk</span>
                      </button>
                      <button
                        onClick={() => setTravelMode('drive')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                          travelMode === 'drive' ? 'bg-kumkum text-shola font-semibold' : 'text-smoke hover:text-ink'
                        }`}
                        title="Driving mode"
                      >
                        <Car className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Drive</span>
                      </button>
                      <button
                        onClick={() => setTravelMode('metro')}
                        className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                          travelMode === 'metro' ? 'bg-kumkum text-shola font-semibold' : 'text-smoke hover:text-ink'
                        }`}
                        title="Metro mode"
                      >
                        <Train className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Metro</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sand/60 dark:border-line">
                    <button
                      onClick={handleOptimizeRoute}
                      disabled={routePandals.length < 3}
                      className="px-3.5 py-1.5 bg-kumkum dark:bg-kumkum-lit hover:bg-sindoor text-shola dark:text-base text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-e1 transition-all disabled:opacity-40 cursor-pointer min-h-[36px]"
                    >
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Optimize Shortest Route</span>
                    </button>

                    <a
                      href={buildGoogleMapsRouteUrl(routePandals)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-e1 transition-all no-underline min-h-[36px]"
                    >
                      <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Export to Google Maps</span>
                    </a>

                    <button
                      onClick={clearRoute}
                      className="p-2 text-smoke hover:text-sindoor rounded-md border border-sand dark:border-line hover:bg-sand/20 transition-colors ml-auto cursor-pointer"
                      title="Clear Route"
                      aria-label="Clear route"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Stops List */}
                <div className="space-y-2">
                  {routePandals.map((pandal, idx) => (
                    <div
                      key={pandal.id}
                      className="bg-paper dark:bg-surface rounded-md border border-sand dark:border-line p-3.5 shadow-e1 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-sindoor text-shola text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4
                            onClick={() => selectEntity(pandal.id, 'pandal')}
                            className="font-semibold text-sm text-ink dark:text-text hover:text-kumkum cursor-pointer truncate"
                          >
                            {language === 'bn' ? pandal.bngName || pandal.name : pandal.name}
                          </h4>
                          <p className="text-xs text-smoke dark:text-text-muted truncate">
                            {pandal.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => moveStop(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-smoke hover:text-ink disabled:opacity-20 cursor-pointer"
                          aria-label="Move stop up"
                        >
                          <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => moveStop(idx, 'down')}
                          disabled={idx === routePandals.length - 1}
                          className="p-1 text-smoke hover:text-ink disabled:opacity-20 cursor-pointer"
                          aria-label="Move stop down"
                        >
                          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => removeFromRoute(pandal.id)}
                          className="p-1 text-smoke hover:text-sindoor cursor-pointer"
                          aria-label="Remove stop"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
