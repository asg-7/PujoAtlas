import React, { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { PUJA_TRAILS, type PujaTrail } from '../../data/trails';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes, optimizeRouteOrder } from '../../lib/geoUtils';
import { t } from '../../lib/i18n';

export const PlannerView: React.FC = () => {
  const {
    pandals,
    language,
    customRoutePandalIds,
    userLocation,
    addToRoute,
    removeFromRoute,
    clearRoute,
    setRoutePandals,
    selectEntity,
    setActiveTab,
  } = useMapStore();

  const [activeSubTab, setActiveSubTab] = useState<'trails' | 'custom'>('trails');
  const [activeTrailId, setActiveTrailId] = useState<string | null>(PUJA_TRAILS[0].id);

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
  const totalMinutes = estimateWalkingMinutes(totalDistanceKm);

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
      return items[0].googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${items[0].lat},${items[0].lng}`;
    }
    const origin = `${items[0].lat},${items[0].lng}`;
    const destination = `${items[items.length - 1].lat},${items[items.length - 1].lng}`;
    if (items.length === 2) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    }
    const waypoints = items
      .slice(1, -1)
      .map((p) => `${p.lat},${p.lng}`)
      .join('|');
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(waypoints)}&travelmode=walking`;
  };

  // Load a trail into custom itinerary
  const handleLoadTrail = (trail: PujaTrail) => {
    setRoutePandals(trail.pandalIds);
    setActiveSubTab('custom');
  };

  return (
    <div className="flex flex-col h-full bg-sand-50 dark:bg-zinc-950 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-terracotta-700 via-terracotta-600 to-amber-700 text-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-2">
            🧭 {language === 'bn' ? 'স্মার্ট রুট প্ল্যানার' : 'Smart Puja Itinerary'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            {language === 'bn' ? 'পরিক্রমা প্ল্যানার' : 'Plan My Puja Trail'}
          </h1>
          <p className="text-sm sm:text-base text-terracotta-100 mt-1 max-w-2xl">
            {language === 'bn'
              ? 'সেরা কিউরেটেড ট্রেইল বেছে নিন অথবা আপনার পছন্দের মণ্ডপগুলো দিয়ে সবচেয়ে ছোট রুট তৈরি করুন।'
              : 'Choose expert-curated walking trails or craft a custom route with automatic shortest-path optimization.'}
          </p>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 mt-5 p-1 bg-black/20 rounded-xl max-w-sm">
            <button
              onClick={() => setActiveSubTab('trails')}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeSubTab === 'trails'
                  ? 'bg-white text-terracotta-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ⭐ {language === 'bn' ? 'কিউরেটেড ট্রেইল' : 'Curated Trails'}
            </button>
            <button
              onClick={() => setActiveSubTab('custom')}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'custom'
                  ? 'bg-white text-terracotta-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              📍 {language === 'bn' ? 'আমার রুট' : 'My Custom Route'}
              {customRoutePandalIds.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-terracotta-600 text-white text-xs flex items-center justify-center font-bold">
                  {customRoutePandalIds.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1">
        {activeSubTab === 'trails' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PUJA_TRAILS.map((trail) => {
                const isSelected = activeTrailId === trail.id;
                return (
                  <div
                    key={trail.id}
                    className={`rounded-2xl border transition-all p-5 flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-terracotta-500 bg-terracotta-50/50 dark:bg-terracotta-950/20 shadow-md ring-2 ring-terracotta-500/20'
                        : 'border-sand-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-terracotta-300 shadow-sm'
                    }`}
                    onClick={() => setActiveTrailId(trail.id)}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-3xl">{trail.coverEmoji}</div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sand-100 dark:bg-zinc-800 text-sand-800 dark:text-zinc-300">
                          {trail.zone} KOLKATA
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-serif text-sand-950 dark:text-zinc-100 mt-2">
                        {language === 'bn' ? trail.bngTitle : trail.title}
                      </h3>
                      <p className="text-xs text-terracotta-600 dark:text-terracotta-400 font-medium mt-0.5">
                        {language === 'bn' ? trail.bngTagline : trail.tagline}
                      </p>
                      <p className="text-xs text-sand-600 dark:text-zinc-400 mt-2 line-clamp-2">
                        {trail.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {trail.highlights.map((hl, i) => (
                          <span
                            key={i}
                            className="inline-block text-[11px] px-2 py-0.5 bg-white dark:bg-zinc-800 border border-sand-200 dark:border-zinc-700 text-sand-700 dark:text-zinc-300 rounded-md"
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-sand-100 dark:border-zinc-800/80 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadTrail(trail);
                        }}
                        className="flex-1 py-2 px-3 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        ⚡ {language === 'bn' ? 'এই রুটে যান' : 'Start This Trail'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTrailId(trail.id);
                        }}
                        className="py-2 px-3 bg-sand-100 dark:bg-zinc-800 hover:bg-sand-200 text-sand-800 dark:text-zinc-200 text-xs font-medium rounded-xl transition-colors"
                      >
                        {isSelected ? '✓ ' + (language === 'bn' ? 'নির্বাচিত' : 'Selected') : (language === 'bn' ? 'মণ্ডপ দেখুন' : 'View Stops')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Trail Details */}
            {activeTrailId && (
              <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-sand-200 dark:border-zinc-800 p-6 shadow-sm">
                {(() => {
                  const trail = PUJA_TRAILS.find((t) => t.id === activeTrailId)!;
                  const trailPandals = trail.pandalIds
                    .map((id) => pandals.find((p) => p.id === id))
                    .filter(Boolean) as (typeof pandals)[0][];

                  return (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-200 dark:border-zinc-800">
                        <div>
                          <div className="text-xs font-bold text-terracotta-600 dark:text-terracotta-400 uppercase tracking-wide">
                            {trail.zone} · {trail.estimatedHours} Hours · {trail.distanceKm} km
                          </div>
                          <h2 className="text-xl font-serif font-bold text-sand-950 dark:text-zinc-100 mt-0.5">
                            {language === 'bn' ? trail.bngTitle : trail.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadTrail(trail)}
                            className="px-4 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                          >
                            🚀 {language === 'bn' ? 'কাস্টমাইজ ও অপটিমাইজ করুন' : 'Load Into Itinerary'}
                          </button>
                          {trailPandals.length > 0 && (
                            <a
                              href={buildGoogleMapsRouteUrl(trailPandals)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                            >
                              🗺️ Google Maps
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {trailPandals.map((pandal, idx) => (
                          <div
                            key={pandal.id}
                            onClick={() => selectEntity(pandal.id, 'pandal')}
                            className="flex items-center gap-3 p-3 rounded-xl border border-sand-100 dark:border-zinc-800/80 hover:border-terracotta-300 dark:hover:border-terracotta-700 hover:bg-sand-50/50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group"
                          >
                            <span className="w-7 h-7 rounded-full bg-sand-200 dark:bg-zinc-800 text-sand-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center group-hover:bg-terracotta-600 group-hover:text-white transition-colors">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm text-sand-950 dark:text-zinc-100 truncate">
                                  {language === 'bn' ? pandal.bngName || pandal.name : pandal.name}
                                </h4>
                                {((pandal.heritageAge && pandal.heritageAge >= 75) || (pandal.established && 2026 - pandal.established >= 75)) && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                    👑 {pandal.heritageAge || (pandal.established ? 2026 - pandal.established : 75)}y
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-sand-500 dark:text-zinc-400 truncate">
                                📍 {pandal.address}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-terracotta-600 dark:text-terracotta-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {language === 'bn' ? 'বিস্তারিত' : 'View'} →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          /* Custom Route Tab */
          <div>
            {routePandals.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-sand-200 dark:border-zinc-800 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-sand-100 dark:bg-zinc-800 text-3xl flex items-center justify-center mx-auto mb-4">
                  🗺️
                </div>
                <h3 className="text-lg font-serif font-bold text-sand-900 dark:text-zinc-100">
                  {language === 'bn' ? 'আপনার রুটে এখনো কোনো মণ্ডপ যুক্ত করা হয়নি' : 'Your Puja Route is Empty'}
                </h3>
                <p className="text-xs sm:text-sm text-sand-600 dark:text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  {language === 'bn'
                    ? 'যেকোনো মণ্ডপ কার্ডে "রুট"-এ ক্লিক করে যুক্ত করুন অথবা উপরের কিউরেটেড ট্রেইলগুলো থেকে শুরু করুন।'
                    : 'Click "Route" on any pandal card to build your personalized hopping trail, or choose a curated trail!'}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveSubTab('trails')}
                    className="px-4 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
                  >
                    ⭐ {language === 'bn' ? 'কিউরেটেড ট্রেইল দেখুন' : 'Explore Curated Trails'}
                  </button>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="px-4 py-2.5 bg-sand-100 dark:bg-zinc-800 hover:bg-sand-200 text-sand-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                  >
                    🔍 {language === 'bn' ? 'সব মণ্ডপ ব্রাউজ করুন' : 'Browse All Pandals'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Route Summary Bar */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-sand-200 dark:border-zinc-800 p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-sand-500 dark:text-zinc-400 uppercase font-semibold">
                          {language === 'bn' ? 'মোট মণ্ডপ' : 'Total Stops'}
                        </div>
                        <div className="text-2xl font-bold font-serif text-sand-950 dark:text-zinc-100">
                          {routePandals.length}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-sand-200 dark:bg-zinc-800" />
                      <div>
                        <div className="text-xs text-sand-500 dark:text-zinc-400 uppercase font-semibold">
                          {language === 'bn' ? 'দূরত্ব' : 'Est. Distance'}
                        </div>
                        <div className="text-2xl font-bold font-serif text-terracotta-600 dark:text-terracotta-400">
                          {formatDistance(totalDistanceKm, language)}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-sand-200 dark:bg-zinc-800" />
                      <div>
                        <div className="text-xs text-sand-500 dark:text-zinc-400 uppercase font-semibold">
                          {language === 'bn' ? 'হাঁটার সময়' : 'Walking Time'}
                        </div>
                        <div className="text-2xl font-bold font-serif text-sand-950 dark:text-zinc-100">
                          ~{totalMinutes} {language === 'bn' ? 'মি' : 'min'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleOptimizeRoute}
                        disabled={routePandals.length < 3}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                        title="Reorders stops to minimize walking/driving distance"
                      >
                        ⚡ {language === 'bn' ? 'সবচেয়ে ছোট রুট সাজান' : 'Optimize Shortest Route'}
                      </button>
                      <a
                        href={buildGoogleMapsRouteUrl(routePandals)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        🗺️ Google Maps Navigation
                      </a>
                      <button
                        onClick={clearRoute}
                        className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors text-xs font-semibold"
                        title="Clear Route"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stops Timeline */}
                <div className="space-y-3">
                  {routePandals.map((pandal, idx) => {
                    let legDist = 0;
                    if (idx < routePandals.length - 1) {
                      const next = routePandals[idx + 1];
                      if (pandal.lat && pandal.lng && next.lat && next.lng) {
                        legDist = calculateDistanceKm(pandal.lat, pandal.lng, next.lat, next.lng);
                      }
                    }

                    return (
                      <React.Fragment key={pandal.id}>
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-sand-200 dark:border-zinc-800 p-4 shadow-sm flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-terracotta-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4
                                onClick={() => selectEntity(pandal.id, 'pandal')}
                                className="font-bold text-sand-950 dark:text-zinc-100 text-sm hover:text-terracotta-600 cursor-pointer truncate"
                              >
                                {language === 'bn' ? pandal.bngName || pandal.name : pandal.name}
                              </h4>
                              <p className="text-xs text-sand-500 dark:text-zinc-400 truncate">
                                📍 {pandal.address}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => moveStop(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 text-sand-600 dark:text-zinc-400 hover:bg-sand-100 dark:hover:bg-zinc-800 disabled:opacity-20 rounded-lg text-xs"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveStop(idx, 'down')}
                              disabled={idx === routePandals.length - 1}
                              className="p-1.5 text-sand-600 dark:text-zinc-400 hover:bg-sand-100 dark:hover:bg-zinc-800 disabled:opacity-20 rounded-lg text-xs"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => removeFromRoute(pandal.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs"
                              title="Remove from Route"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Leg connector */}
                        {idx < routePandals.length - 1 && legDist > 0 && (
                          <div className="flex items-center gap-2 pl-7 py-1">
                            <div className="w-0.5 h-6 bg-dashed border-l-2 border-terracotta-400 dark:border-terracotta-700" />
                            <span className="text-[11px] font-medium text-terracotta-600 dark:text-terracotta-400 bg-sand-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                              🚶 {formatDistance(legDist, language)} · ~{estimateWalkingMinutes(legDist)} min
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
