import React, { useState, useEffect, useRef } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { telemetry } from '../../lib/telemetry';

interface SearchResult {
  id: string;
  name: string;
  address?: string;
  zone?: string;
  type?: string;
}

/**
 * T-20: Unified Fuzzy Search System.
 * Debounced search across pandals, food, and metro stations.
 */
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant in-memory search
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
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 5);

    const matchedFood = food
      .filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.famousFor?.some((d) => d.toLowerCase().includes(q)) ||
        f.mustTryDishes?.some((d) => d.toLowerCase().includes(q))
      )
      .slice(0, 5);

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

  const hasResults = results.pandals.length > 0 || results.food.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto z-40">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search pandals, food, metro..."
          className="w-full bg-gray-900/90 text-white placeholder-gray-400 border border-gray-700/50 rounded-2xl py-3 pl-11 pr-4 shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-pujo-gold/50 transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-pujo-gold rounded-full animate-spin" />
          ) : (
            <span>🔍</span>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {!hasResults && !isSearching ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto hide-scrollbar py-2">
              {results.pandals.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Pandals
                  </div>
                  {results.pandals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.id, 'pandal')}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-800 transition-colors flex flex-col"
                    >
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="text-xs text-gray-400 truncate">{p.address}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {results.food.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Food & Drink
                  </div>
                  {results.food.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelect(f.id, 'food')}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-800 transition-colors flex flex-col"
                    >
                      <span className="text-sm font-semibold text-white">{f.name}</span>
                      <span className="text-xs text-gray-400 truncate">{f.address}</span>
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
