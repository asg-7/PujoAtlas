import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Locate,
  Train,
  UtensilsCrossed,
  X,
  Star,
  Landmark,
  Bookmark,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import type { Zone } from '../../lib/schemas';
import PandalCard from '../cards/PandalCard';
import { EmptyState } from '../common/EmptyState';
import { PandalCardSkeleton } from '../common/PandalCardSkeleton';
import { SearchBar } from '../common/SearchBar';
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
    searchQuery: storeSearchQuery,
    setSearchQuery: setStoreSearchQuery,
    userLocation,
    language,
    savedPandalIds,
    visitedPandalIds,
    selectedEntity,
    selectEntity,
    activeLayers,
    toggleLayer,
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
  } = useMapStore();

  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [isLoading, setIsLoading] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Local input state for instant, buttery-smooth typing
  const [searchQuery, setSearchQuery] = useState(storeSearchQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState(storeSearchQuery || '');

  // Debounce search filter by 200ms to eliminate typing lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setStoreSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, setStoreSearchQuery]);

  // Sync if store search query is reset externally (e.g. from Clear Filters)
  useEffect(() => {
    if (storeSearchQuery !== searchQuery) {
      setSearchQuery(storeSearchQuery);
      setDebouncedQuery(storeSearchQuery);
    }
  }, [storeSearchQuery]);

  // 4.2 URL State Synchronization (Shareable, restorable, back button works)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlFilter = params.get('filter');
      const urlQ = params.get('q');
      if (urlFilter && urlFilter !== activeFilter) {
        setFilter(urlFilter);
      }
      if (urlQ && urlQ !== searchQuery) {
        setSearchQuery(urlQ);
        setDebouncedQuery(urlQ);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (activeFilter !== 'ALL') {
        params.set('filter', activeFilter);
      } else {
        params.delete('filter');
      }
      if (debouncedQuery) {
        params.set('q', debouncedQuery);
      } else {
        params.delete('q');
      }
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);
    } catch (e) {}
  }, [activeFilter, debouncedQuery]);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

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
      all: all || 737,
      featured: featured || 30,
      heritage: heritage || 412,
      saved: savedPandalIds.length,
      visited: visitedPandalIds.length,
    };
  }, [pandals, savedPandalIds, visitedPandalIds]);

  // Filtered pandal list
  const filteredPandals = useMemo(() => {
    let list = [...pandals];

    // 1. Text Search Query (Debounced for buttery-smooth typing)
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bngName?.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q) ||
          p.nearestMetro?.toLowerCase().includes(q) ||
          p.categories?.some((c) => c.toLowerCase().includes(q)) ||
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
  }, [pandals, debouncedQuery, activeFilter, savedPandalIds, visitedPandalIds, userLocation]);

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
    <div className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex overflow-hidden pointer-events-none">
      {/* LEFT PANEL: 320px–40% Desktop Editorial & Pandal Directory (Collapsible) */}
      <div
        ref={listContainerRef}
        className={`h-full overflow-y-auto bg-paper dark:bg-surface border-r border-sand dark:border-line z-20 flex flex-col transition-all duration-base ease-inout shrink-0 pointer-events-auto ${
          mobileView === 'map' ? 'hidden md:flex' : 'flex'
        } ${
          isSidebarCollapsed
            ? 'md:w-0 md:max-w-0 md:-translate-x-full md:opacity-0 md:pointer-events-none md:border-r-0'
            : 'w-full md:w-[420px] lg:w-[460px] md:translate-x-0 md:opacity-100 shadow-e2 md:shadow-none'
        }`}
      >
        {/* Sticky Search & Filter Header */}
        <div className="p-3.5 sm:p-4 bg-paper dark:bg-surface border-b border-sand dark:border-line sticky top-0 z-10 space-y-2.5 shadow-e1">
          {/* Search Box + Minimize Sidebar Button */}
          <div className="flex items-center gap-2">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('hero.searchPlaceholder', language)}
              ariaLabel="Search pandals, localities, or metro stations"
              className="flex-1"
              trailingAction={
                <button
                  type="button"
                  onClick={handleLocateUser}
                  title={language === 'bn' ? 'আমার অবস্থান' : 'Locate me on map'}
                  className="w-7 h-7 rounded-sm bg-neel hover:bg-neel/90 text-shola flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-e1"
                  aria-label="Locate me on map"
                >
                  <Locate className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              }
            />

            {/* Desktop Sidebar Minimize Toggle */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-md border border-sand dark:border-line bg-shola dark:bg-base text-smoke hover:text-ink dark:hover:text-text hover:bg-sand/20 transition-all duration-fast cursor-pointer shrink-0 shadow-e1 active:scale-95"
              title={
                language === 'bn'
                  ? 'প্যানেল ছোট করুন (ম্যাপ বড় করুন)'
                  : 'Minimize sidebar (Full Map View) — Ctrl+B'
              }
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Primary Quick Filter Pills (Horizontal Scroll, never wraps) */}
          <div className="flex overflow-x-auto hide-scrollbar gap-1.5 py-0.5 items-center">
            <button
              type="button"
              onClick={() => handlePillClick('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-fast border cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-shola dark:bg-base text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              {t('filters.all', language)} ({stats.all})
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('FEATURED')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-fast border cursor-pointer flex items-center gap-1 ${
                activeFilter === 'FEATURED'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-shola dark:bg-base text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              <Star className="w-3 h-3 fill-current" strokeWidth={1.5} />
              <span>{t('filters.featured', language)} ({stats.featured})</span>
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('HERITAGE')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-fast border cursor-pointer flex items-center gap-1 ${
                activeFilter === 'HERITAGE'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-shola dark:bg-base text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              <Landmark className="w-3 h-3" strokeWidth={1.5} />
              <span>{t('filters.heritage', language)} ({stats.heritage})</span>
            </button>

            <button
              type="button"
              onClick={() => handlePillClick('SAVED')}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-fast border cursor-pointer flex items-center gap-1 ${
                activeFilter === 'SAVED'
                  ? 'bg-neel text-shola border-neel font-semibold shadow-e1'
                  : 'bg-shola dark:bg-base text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              <Bookmark className="w-3 h-3 fill-current" strokeWidth={1.5} />
              <span>{t('filters.saved', language)} ({stats.saved})</span>
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
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium whitespace-nowrap transition-all duration-fast border cursor-pointer ${
                    isAct
                      ? 'bg-sindoor text-shola border-sindoor font-semibold'
                      : 'bg-shola dark:bg-base text-smoke dark:text-text-muted border-sand dark:border-line hover:text-ink dark:hover:text-text'
                  }`}
                >
                  {t(r.labelKey, language)}
                </button>
              );
            })}
          </div>

          {/* Result Count and Reset */}
          <div className="flex items-center justify-between text-[11px] text-smoke dark:text-text-muted font-normal pt-1">
            <span>
              {filteredPandals.length} {t('hero.pandalsCount', language)}
            </span>

            {(activeFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-[10px] text-kumkum dark:text-kumkum-lit font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>{t('filters.clearAll', language)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Pandal List */}
        <div className="p-3 sm:p-4 space-y-3 flex-1 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <PandalCardSkeleton key={i} />)
          ) : filteredPandals.length === 0 ? (
            <EmptyState
              title={language === 'bn' ? 'কোনো মণ্ডপ পাওয়া যায়নি' : 'No pandals match these filters.'}
              description={
                language === 'bn'
                  ? 'অন্য কোনো এলাকা বা নাম দিয়ে সন্ধান করুন অথবা ফিল্টারগুলো মুছে ফেলুন।'
                  : 'Try widening your search radius or clearing active zone and category filters.'
              }
              primaryActionLabel={t('filters.clearAll', language)}
              onPrimaryAction={() => {
                setFilter('ALL');
                setSearchQuery('');
              }}
              secondaryActionLabel={language === 'bn' ? 'সব মণ্ডপ দেখুন (৭৩৭)' : `Browse all ${stats.all || 737} pandals`}
              onSecondaryAction={() => {
                setFilter('ALL');
                setSearchQuery('');
              }}
            />
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

      {/* RIGHT PANEL: Map Canvas Pass-Through Area */}
      <div className="flex-1 h-full relative pointer-events-none">
        {/* Floating Expand Sidebar Button on Desktop when collapsed */}
        {isSidebarCollapsed && (
          <div className="hidden md:flex absolute top-4 left-4 z-30 pointer-events-auto items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-base">
            <button
              type="button"
              onClick={toggleSidebar}
              className="bg-paper/95 dark:bg-surface/95 backdrop-blur-md border border-sand dark:border-line text-ink dark:text-text shadow-e2 hover:shadow-e3 hover:bg-sand/20 rounded-full px-4 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all duration-fast active:scale-95 cursor-pointer group"
              title={
                language === 'bn'
                  ? 'মণ্ডপ তালিকা খুলুন'
                  : 'Show Pandal Directory (Expand Sidebar) — Ctrl+B'
              }
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-kumkum dark:text-kumkum-lit group-hover:scale-110 transition-transform duration-fast" strokeWidth={1.5} />
              <span>{language === 'bn' ? 'মণ্ডপ তালিকা' : 'Show Pandals'}</span>
              <span className="bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-[11px] font-bold px-2 py-0.5 rounded-full shadow-e1">
                {filteredPandals.length}
              </span>
            </button>
          </div>
        )}

        {/* Floating Map Layers Control Island (Desktop/Tablet — Top-Right Thumb/Click Area) */}
        <div className="hidden md:flex absolute top-4 right-4 z-30 pointer-events-auto items-center gap-2 bg-paper/95 dark:bg-surface/95 backdrop-blur-md border border-sand dark:border-line p-1.5 rounded-full shadow-e2 transition-all">
          <div className="flex items-center gap-1.5 px-1">
            {/* Metro Lines Toggle */}
            <button
              type="button"
              onClick={() => toggleLayer('metro')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-fast border shadow-sm cursor-pointer active:scale-95 ${
                activeLayers.metro
                  ? 'bg-neel text-shola border-neel shadow-e1 font-bold'
                  : 'bg-shola/90 dark:bg-base/90 text-smoke dark:text-text-muted border-sand dark:border-line hover:text-ink dark:hover:text-text hover:bg-sand/30'
              }`}
              title={language === 'bn' ? 'মেট্রো লাইন এবং স্টেশন দেখান/লুকান' : 'Toggle Metro Lines & Stations'}
              aria-pressed={activeLayers.metro}
            >
              <Train className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span className="whitespace-nowrap">{t('filters.metroLines', language)}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeLayers.metro ? 'bg-[#93C5FD] animate-pulse' : 'bg-stone-400 opacity-40'
                }`}
              />
            </button>

            {/* Food Spots Toggle */}
            <button
              type="button"
              onClick={() => toggleLayer('food')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-fast border shadow-sm cursor-pointer active:scale-95 ${
                activeLayers.food
                  ? 'bg-[#8C3A27] text-shola border-[#8C3A27] shadow-e1 font-bold'
                  : 'bg-shola/90 dark:bg-base/90 text-smoke dark:text-text-muted border-sand dark:border-line hover:text-ink dark:hover:text-text hover:bg-sand/30'
              }`}
              title={language === 'bn' ? 'কলকাতার বিখ্যাত খাবার কেন্দ্র দেখান/লুকান' : 'Toggle Iconic Food Spots'}
              aria-pressed={activeLayers.food}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
              <span className="whitespace-nowrap">{t('filters.foodLayer', language)}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeLayers.food ? 'bg-[#FED7AA] animate-pulse' : 'bg-stone-400 opacity-40'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Top Floating Quick Search & Filter Chips */}
        <div className="md:hidden absolute top-2 left-2 right-2 z-20 pointer-events-auto space-y-1.5">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('hero.searchPlaceholder', language)}
            ariaLabel="Search pandals on mobile"
            className="w-full shadow-e2"
            trailingAction={
              <button
                type="button"
                onClick={handleLocateUser}
                title={language === 'bn' ? 'আমার অবস্থান' : 'Locate me on map'}
                className="w-7 h-7 rounded-sm bg-neel text-shola flex items-center justify-center cursor-pointer shadow-e1 active:scale-95"
                aria-label="Locate me on map"
              >
                <Locate className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            }
          />

          <div className="flex overflow-x-auto hide-scrollbar gap-1.5 px-1 py-0.5 items-center">
            <button
              onClick={() => handlePillClick('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium border shadow-e1 whitespace-nowrap ${
                activeFilter === 'ALL'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold'
                  : 'bg-paper/90 dark:bg-surface/90 text-ink dark:text-text border-sand dark:border-line'
              }`}
            >
              All ({stats.all})
            </button>
            <button
              onClick={() => handlePillClick('FEATURED')}
              className={`px-3 py-1 rounded-full text-xs font-medium border shadow-e1 whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'FEATURED'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold'
                  : 'bg-paper/90 dark:bg-surface/90 text-ink dark:text-text border-sand dark:border-line'
              }`}
            >
              <Star className="w-3 h-3 fill-current" strokeWidth={1.5} />
              <span>Featured ({stats.featured})</span>
            </button>
            <button
              onClick={() => handlePillClick('HERITAGE')}
              className={`px-3 py-1 rounded-full text-xs font-medium border shadow-e1 whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'HERITAGE'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold'
                  : 'bg-paper/90 dark:bg-surface/90 text-ink dark:text-text border-sand dark:border-line'
              }`}
            >
              <Landmark className="w-3 h-3" strokeWidth={1.5} />
              <span>Heritage ({stats.heritage})</span>
            </button>

            <div className="w-px h-4 bg-sand dark:bg-line mx-0.5 shrink-0" />

            {/* Mobile quick layer toggles */}
            <button
              onClick={() => toggleLayer('metro')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border shadow-e1 whitespace-nowrap flex items-center gap-1 cursor-pointer active:scale-95 ${
                activeLayers.metro
                  ? 'bg-neel text-shola border-neel font-semibold'
                  : 'bg-paper/90 dark:bg-surface/90 text-smoke dark:text-text-muted border-sand dark:border-line'
              }`}
            >
              <Train className="w-3 h-3" strokeWidth={1.5} />
              <span>{t('filters.metroLines', language)}</span>
            </button>
            <button
              onClick={() => toggleLayer('food')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border shadow-e1 whitespace-nowrap flex items-center gap-1 cursor-pointer active:scale-95 ${
                activeLayers.food
                  ? 'bg-[#8C3A27] text-shola border-[#8C3A27] font-semibold'
                  : 'bg-paper/90 dark:bg-surface/90 text-smoke dark:text-text-muted border-sand dark:border-line'
              }`}
            >
              <UtensilsCrossed className="w-3 h-3" strokeWidth={1.5} />
              <span>{t('filters.foodLayer', language)}</span>
            </button>
          </div>
        </div>

        {/* Floating Mobile Map / List Toggle Button */}
        <div className="md:hidden absolute bottom-20 right-4 z-30 pointer-events-auto">
          <button
            onClick={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
            className="px-4 py-2.5 rounded-full bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-xs font-semibold shadow-e3 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
            aria-label="Toggle map and list view"
          >
            <span>{mobileView === 'map' ? '📋' : '🗺️'}</span>
            <span>{mobileView === 'map' ? 'View List' : 'View Map'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
