import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { Zone } from '../../lib/schemas';
import PandalCard from '../cards/PandalCard';
import { t } from '../../lib/i18n';
import { calculateDistanceKm } from '../../lib/geoUtils';
import { telemetry } from '../../lib/telemetry';

export default function ExploreView() {
  const {
    pandals,
    activeFilter,
    setFilter,
    activeZone,
    setZone,
    searchQuery,
    setSearchQuery,
    userLocation,
    language,
    savedPandalIds,
    visitedPandalIds,
    selectedEntity,
    selectEntity,
    activeLayers,
    toggleLayer,
  } = useMapStore();

  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic statistics
  const stats = useMemo(() => {
    let all = 0;
    let featured = 0;
    let heritage = 0;

    pandals.forEach((p) => {
      all++;
      if (p.isFeatured) featured++;
      if (p.isHeritage) heritage++;
    });

    return {
      all: all || 732,
      featured: featured || 30,
      heritage: heritage || 412,
      saved: savedPandalIds.length,
      visited: visitedPandalIds.length,
    };
  }, [pandals, savedPandalIds, visitedPandalIds]);

  // Filtered pandal list
  const filteredPandals = useMemo(() => {
    let list = [...pandals];

    // 1. Text Search Query
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q) ||
          p.nearestMetro?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Active Filter Chip
    if (activeFilter === 'FEATURED') {
      list = list.filter((p) => p.isFeatured);
    } else if (activeFilter === 'HERITAGE') {
      list = list.filter((p) => p.isHeritage);
    } else if (activeFilter === 'SAVED') {
      list = list.filter((p) => savedPandalIds.includes(p.id));
    } else if (activeFilter === 'VISITED') {
      list = list.filter((p) => visitedPandalIds.includes(p.id));
    } else if (['NORTH', 'SOUTH', 'CENTRAL', 'EAST', 'HOWRAH', 'OTHERS', 'WEST'].includes(activeFilter)) {
      list = list.filter((p) => p.zone === activeFilter);
    }

    // 3. Distance sorting if user location is available
    if (userLocation) {
      list.sort((a, b) => {
        const dA = a.lat && a.lng ? calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng) : 9999;
        const dB = b.lat && b.lng ? calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng) : 9999;
        return dA - dB;
      });
    }

    return list;
  }, [pandals, searchQuery, activeFilter, savedPandalIds, visitedPandalIds, userLocation]);

  const REGIONS: Array<{ id: Zone | 'ALL'; labelKey: string }> = [
    { id: 'ALL', labelKey: 'regions.ALL' },
    { id: 'NORTH', labelKey: 'regions.NORTH' },
    { id: 'SOUTH', labelKey: 'regions.SOUTH' },
    { id: 'CENTRAL', labelKey: 'regions.CENTRAL' },
    { id: 'EAST', labelKey: 'regions.EAST' },
    { id: 'HOWRAH', labelKey: 'regions.HOWRAH' },
    { id: 'OTHERS', labelKey: 'regions.OTHERS' },
  ];

  const handlePillClick = (filterId: string) => {
    const next = activeFilter === filterId && filterId !== 'ALL' ? 'ALL' : filterId;
    setFilter(next);
    telemetry.track('filter_click', { filter: next });
  };

  const handleLocateUser = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('map:locateUser'));
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* LEFT PANEL: 40% Desktop Editorial & Pandal List */}
      <div
        ref={listContainerRef}
        className={`w-full md:w-[42%] lg:w-[38%] h-full overflow-y-auto bg-[var(--chalk)] border-r border-[var(--border)] z-20 flex flex-col transition-all ${
          mobileView === 'map' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sticky Search & Filter Header */}
        <div className="p-3 sm:p-4 bg-[var(--chalk)] border-b border-[var(--border)] sticky top-0 z-10 space-y-2.5 shadow-xs">
          {/* Search Box with Integrated Locate Button */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('hero.searchPlaceholder', language)}
              className="w-full bg-[var(--chalk-2)] text-[var(--ink)] placeholder-[var(--ink-3)] border border-[var(--control-border)] rounded-full py-2.5 pl-4 pr-11 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-600 transition-all shadow-xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--ink-3)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleLocateUser}
              title="Locate me (আমার অবস্থান)"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
            >
              🎯
            </button>
          </div>

          {/* Primary Quick Filter Pills */}
          <div className="flex overflow-x-auto hide-scrollbar gap-1.5 py-0.5 items-center">
            <button
              type="button"
              onClick={() => handlePillClick('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs font-bold'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              🏛️ {t('filters.all', language)} ({stats.all})
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('FEATURED')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                activeFilter === 'FEATURED'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs font-bold'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              ⭐ {t('filters.featured', language)} ({stats.featured})
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('HERITAGE')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                activeFilter === 'HERITAGE'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs font-bold'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              👑 {t('filters.heritage', language)}
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('SAVED')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                activeFilter === 'SAVED'
                  ? 'bg-red-600 text-white border-red-600 shadow-xs font-bold'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              🔖 {t('filters.saved', language)} ({stats.saved})
            </button>
          </div>

          {/* Region Sub-chips */}
          <div className="flex overflow-x-auto hide-scrollbar gap-1 py-0.5 items-center">
            {REGIONS.slice(1).map((r) => {
              const isAct = activeFilter === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handlePillClick(r.id)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all border cursor-pointer ${
                    isAct
                      ? 'bg-[var(--ink)] text-[var(--shankha)] border-[var(--ink)] font-bold'
                      : 'bg-[var(--chalk-2)]/80 text-[var(--ink-2)] border-[var(--border)] hover:text-[var(--ink)]'
                  }`}
                >
                  {t(r.labelKey, language)}
                </button>
              );
            })}
          </div>

          {/* Result Count and Layer Toggles */}
          <div className="flex items-center justify-between text-[11px] text-[var(--ink-3)] font-medium pt-1">
            <span>
              {filteredPandals.length} {t('hero.pandalsCount', language)}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleLayer('metro')}
                className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer ${
                  activeLayers.metro
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                    : 'bg-[var(--chalk-2)] text-[var(--ink-3)] border-[var(--border)] opacity-60'
                }`}
              >
                🚇 {t('filters.metroLines', language)}
              </button>

              <button
                type="button"
                onClick={() => toggleLayer('food')}
                className={`px-2 py-0.5 rounded border text-[10px] cursor-pointer ${
                  activeLayers.food
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                    : 'bg-[var(--chalk-2)] text-[var(--ink-3)] border-[var(--border)] opacity-60'
                }`}
              >
                🍽️ {t('filters.foodLayer', language)}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Pandal List */}
        <div className="p-3 sm:p-4 space-y-3 flex-1 overflow-y-auto">
          {filteredPandals.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="text-3xl">🔍</div>
              <h4 className="font-serif font-bold text-base text-[var(--ink)]">কোনো মণ্ডপ পাওয়া যায়নি (No Pandals Found)</h4>
              <p className="text-xs text-[var(--ink-3)] max-w-xs mx-auto">
                অন্য এলাকা বা নাম দিয়ে সন্ধান করুন অথবা ফিল্টার রিসেট করুন।
              </p>
              <button
                onClick={() => {
                  setFilter('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                {t('filters.clearAll', language)}
              </button>
            </div>
          ) : (
            filteredPandals.map((pandal) => (
              <PandalCard
                key={pandal.id}
                pandal={pandal}
                onSelect={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('map:flyToPandal', {
                        detail: { lat: pandal.lat, lng: pandal.lng },
                      })
                    );
                  }
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: 60% Map Canvas (WebGL2 Hardware-accelerated) */}
      <div className="flex-1 h-full relative">
        {/* Map Container Target */}
        <div id="map-container" className="absolute inset-0 w-full h-full" />

        {/* Mobile Top Floating Quick Search & Filter Chips */}
        <div className="md:hidden absolute top-2 left-2 right-2 z-20 pointer-events-auto space-y-1.5">
          <div className="relative flex items-center bg-[var(--chalk)]/95 backdrop-blur-md rounded-full shadow-md border border-[var(--border)] p-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('hero.searchPlaceholder', language)}
              className="w-full bg-transparent text-[var(--ink)] placeholder-[var(--ink-3)] text-xs font-sans px-3 py-1.5 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleLocateUser}
              className="w-7 h-7 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center text-xs shrink-0 mr-1"
            >
              🎯
            </button>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar gap-1.5 px-1 py-0.5">
            <button
              onClick={() => handlePillClick('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs whitespace-nowrap ${
                activeFilter === 'ALL'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-[var(--chalk)]/90 text-[var(--ink)] border-[var(--border)]'
              }`}
            >
              All {stats.all}
            </button>
            <button
              onClick={() => handlePillClick('FEATURED')}
              className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs whitespace-nowrap ${
                activeFilter === 'FEATURED'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-[var(--chalk)]/90 text-[var(--ink)] border-[var(--border)]'
              }`}
            >
              ⭐ Featured ({stats.featured})
            </button>
            <button
              onClick={() => handlePillClick('HERITAGE')}
              className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs whitespace-nowrap ${
                activeFilter === 'HERITAGE'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-[var(--chalk)]/90 text-[var(--ink)] border-[var(--border)]'
              }`}
            >
              👑 Heritage
            </button>
          </div>
        </div>

        {/* Floating Mobile Map / List Toggle Button */}
        <div className="md:hidden absolute bottom-20 right-4 z-30 pointer-events-auto">
          <button
            onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
            className="px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xl flex items-center gap-1.5 transition-transform active:scale-90 cursor-pointer"
          >
            <span>{mobileView === 'map' ? '📋' : '🗺️'}</span>
            <span>{mobileView === 'map' ? 'View List (তালিকা)' : 'View Map (মানচিত্র)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
