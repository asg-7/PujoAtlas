import React, { useEffect, useState, useRef } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { telemetry } from '../../lib/telemetry';

interface TrendingEntity {
  entityId: string;
  score: number;
  type: 'pandal' | 'food';
  name: string;
  data: any;
}

export default function TrendingDrawer() {
  const { isTrendingOpen, setTrendingOpen, selectEntity, pandals, food } = useMapStore();
  const [trending, setTrending] = useState<TrendingEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTrendingOpen) {
      fetchTrending();
    }
  }, [isTrendingOpen]);

  const fetchTrending = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/trending?limit=10');
      if (res.ok) {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          setTrending(data.data);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      // Fallback to in-memory list
    }

    const topPandals: TrendingEntity[] = pandals
      .filter((p) => p.isFamous)
      .slice(0, 6)
      .map((p) => ({
        entityId: p.id,
        score: 125,
        type: 'pandal',
        name: p.name,
        data: p,
      }));

    const topFood: TrendingEntity[] = food
      .filter((f) => f.isLateNight)
      .slice(0, 4)
      .map((f) => ({
        entityId: f.id,
        score: 115,
        type: 'food',
        name: f.name,
        data: f,
      }));

    setTrending([...topPandals, ...topFood]);
    setIsLoading(false);
  };

  const handleSelect = (entity: TrendingEntity) => {
    selectEntity(entity.entityId, entity.type);
    telemetry.track('entity_view', { id: entity.entityId, source: 'trending_drawer' });
  };

  if (!isTrendingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setTrendingOpen(false)}
      />

      {/* Thaal Drawer */}
      <div 
        ref={sheetRef}
        className="relative w-full sm:w-[420px] thaal paper paper-2 shadow-2xl max-h-[85vh] flex flex-col transform transition-transform animate-slideUp"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <h2 className="text-lg font-display font-bold text-[var(--ink)]">জনপ্রিয় আকর্ষণ (Trending Now)</h2>
              <p className="text-xs text-[var(--ink-3)]">এই মুহূর্তে সর্বাধিক দর্শনার্থীদের পছন্দ</p>
            </div>
          </div>
          <button 
            onClick={() => setTrendingOpen(false)}
            className="btn min-h-[32px] w-[32px] p-0 rounded-full border-[var(--control-border)] text-[var(--ink)] hover:bg-[var(--chalk)] shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 hide-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-3 border-[var(--border)] border-t-[var(--geru)] rounded-full animate-spin" />
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center text-[var(--ink-3)] py-8 font-display italic">কোনো তথ্য নেই</div>
          ) : (
            trending.map((item, index) => (
              <button
                key={item.entityId}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-3.5 p-3 rounded-lg bg-[var(--chalk-3)] hover:bg-[var(--chalk)] border border-[var(--border)] transition-all text-left group"
              >
                <div className={`
                  flex-none w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs
                  ${index === 0 ? 'bg-[var(--geru)] text-white shadow-sm' : 
                    index === 1 ? 'bg-[var(--brass)] text-white' :
                    index === 2 ? 'bg-[var(--neel)] text-white' :
                    'bg-[var(--chalk-2)] text-[var(--ink-2)] border border-[var(--control-border)]'
                  }
                `}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display font-bold text-[var(--ink)] truncate group-hover:text-[var(--geru-text)] transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-[var(--ink-3)] flex items-center gap-1.5 mt-0.5">
                    <span>{item.type === 'pandal' ? '🏛️ মণ্ডপ' : '🍽️ আহার'}</span>
                    {item.data?.zone && <span>• {item.data.zone}</span>}
                  </p>
                </div>

                <div className="flex-none text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors">
                  →
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
