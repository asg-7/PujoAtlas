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
 * Bonedi-Bari Styled Search System with paper surface and serif typography.
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
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto z-40 px-3">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="সন্ধান করুন: মণ্ডপ, রেস্তোরাঁ, মেট্রো..."
          className="w-full bg-[var(--chalk-2)] text-[var(--ink)] placeholder-[var(--ink-3)] border border-[var(--control-border)] rounded-full py-2.5 pl-10 pr-4 shadow-md focus:outline-none focus:border-[var(--geru-text)] focus:ring-1 focus:ring-[var(--geru)] transition-all font-body text-sm"
        />
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-2)]">
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-[var(--ink-3)] border-t-[var(--geru)] rounded-full animate-spin" />
          ) : (
            <span className="text-sm">🔍</span>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-3 right-3 mt-1.5 paper paper-2 border border-[var(--control-border)] rounded-xl shadow-2xl overflow-hidden z-50">
          {!hasResults && !isSearching ? (
            <div className="p-4 text-center text-[var(--ink-3)] text-sm font-display italic">
              কোনো তথ্য পাওয়া যায়নি "{query}"
            </div>
          ) : (
            <div className="max-h-[55vh] overflow-y-auto hide-scrollbar py-2 divide-y divide-[var(--border)]">
              {results.pandals.length > 0 && (
                <div className="pb-1">
                  <div className="px-3.5 py-1 meta text-[var(--geru-text)]">
                    🏛️ দুর্গোৎসব মণ্ডপ ({results.pandals.length})
                  </div>
                  {results.pandals.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.id, 'pandal')}
                      className="w-full text-left px-4 py-2 hover:bg-[var(--chalk-3)] transition-colors flex flex-col"
                    >
                      <span className="text-sm font-display font-semibold text-[var(--ink)]">{p.name}</span>
                      <span className="text-xs text-[var(--ink-3)] truncate">{p.address}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {results.food.length > 0 && (
                <div className="pt-1">
                  <div className="px-3.5 py-1 meta text-[var(--brass-text)]">
                    🍽️ জনপ্রিয় আহার ও মিষ্টি ({results.food.length})
                  </div>
                  {results.food.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelect(f.id, 'food')}
                      className="w-full text-left px-4 py-2 hover:bg-[var(--chalk-3)] transition-colors flex flex-col"
                    >
                      <span className="text-sm font-display font-semibold text-[var(--ink)]">{f.name}</span>
                      <span className="text-xs text-[var(--ink-3)] truncate">{f.address}</span>
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
