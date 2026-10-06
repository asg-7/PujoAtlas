import React, { useState, useEffect, useRef } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { telemetry } from '../../lib/telemetry';

interface SearchResult {
  id: string;
  name: string;
  address?: string;
  zone?: string;
  type?: string;
  nearestMetro?: string;
  established?: number;
  isHeritage?: boolean;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ pandals: SearchResult[]; food: SearchResult[] }>({
    pandals: [],
    food: [],
  });

  const selectEntity = useMapStore((s) => s.selectEntity);
  const pandals = useMapStore((s) => s.pandals);
  const food = useMapStore((s) => s.food);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ pandals: [], food: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    telemetry.track('search_query', { query: query.trim() });

    const q = query.trim().toLowerCase();
    const matchedPandals = pandals
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          (p.nearestMetro && p.nearestMetro.toLowerCase().includes(q)) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 8);

    const matchedFood = food
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.famousFor?.some((d) => d.toLowerCase().includes(q)) ||
          f.mustTryDishes?.some((d) => d.toLowerCase().includes(q))
      )
      .slice(0, 4);

    setResults({
      pandals: matchedPandals,
      food: matchedFood,
    });
    setIsSearching(false);
  }, [query, pandals, food]);

  const handleSelect = (id: string, type: 'pandal' | 'food') => {
    selectEntity(id, type);
    telemetry.track('search_click', { id, type, query });
    setIsOpen(false);
    setQuery('');
  };

  const handleLocateUser = () => {
    telemetry.track('locate_me_click', {});
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('map:locateUser'));
    }
  };

  const hasResults = results.pandals.length > 0 || results.food.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm sm:max-w-md mx-auto z-40 px-2 sm:px-0">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search pandals..."
          className="w-full bg-[#FFFDF9] text-stone-900 placeholder-stone-500 border border-stone-300/90 rounded-full py-2 pl-4 pr-11 shadow-md focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-400/20 text-sm font-sans transition-all"
        />

        {/* Circular GPS Locate Button (matches screenshot cyan locate button) */}
        <button
          type="button"
          onClick={handleLocateUser}
          title="Locate me (আমার বর্তমান অবস্থান)"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white flex items-center justify-center shadow-sm transition-transform active:scale-90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <circle cx="12" cy="12" r="7" />
            <line x1="12" y1="1" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="1" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="23" y2="12" />
          </svg>
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-2 right-2 sm:left-0 sm:right-0 mt-2 bg-white/95 backdrop-blur-md border border-stone-300 rounded-2xl shadow-2xl overflow-hidden z-50">
          {!hasResults && !isSearching ? (
            <div className="p-4 text-center text-stone-500 text-sm italic">
              কোনো মণ্ডপ বা স্থান পাওয়া যায়নি "{query}"
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-stone-100 py-1">
              {results.pandals.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-red-700 uppercase tracking-wider bg-stone-50">
                    🏛️ দুর্গোৎসব মণ্ডপ ({results.pandals.length})
                  </div>
                  {results.pandals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.id, 'pandal')}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50/60 transition-colors flex flex-col group border-b border-stone-50 last:border-b-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-stone-900 group-hover:text-red-700">
                          {p.name}
                        </span>
                        {p.isHeritage && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                            👑 Heritage
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
                        <span>📍 {p.address || p.zone}</span>
                        {p.nearestMetro && (
                          <span className="text-indigo-600 font-medium shrink-0">
                            • 🚇 {p.nearestMetro}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.food.length > 0 && (
                <div>
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-stone-50">
                    🍽️ জনপ্রিয় খাবার ও মিষ্টি ({results.food.length})
                  </div>
                  {results.food.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelect(f.id, 'food')}
                      className="w-full text-left px-4 py-2 hover:bg-amber-50/60 transition-colors flex flex-col"
                    >
                      <span className="text-sm font-semibold text-stone-900">{f.name}</span>
                      <span className="text-xs text-stone-500 truncate">{f.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
