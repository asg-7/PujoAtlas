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

/**
 * T-22: Trending Venues Drawer.
 * Displays real-time trending spots based on the backend heuristic algorithm.
 */
export default function TrendingDrawer() {
  const { isTrendingOpen, setTrendingOpen, selectEntity } = useMapStore();
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
      const data = await res.json();
      setTrending(data.data || []);
    } catch (e) {
      console.error('Failed to fetch trending', e);
    } finally {
      setIsLoading(false);
    }
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setTrendingOpen(false)}
      />

      {/* Drawer Content */}
      <div 
        ref={sheetRef}
        className="relative w-full sm:w-96 bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col transform transition-transform animate-slideUp"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-bold text-white">Trending Now</h2>
          </div>
          <button 
            onClick={() => setTrendingOpen(false)}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-gray-700 border-t-pujo-gold rounded-full animate-spin" />
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No trending data available.</div>
          ) : (
            trending.map((item, index) => (
              <button
                key={item.entityId}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-4 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700/50 transition-colors text-left group"
              >
                <div className={`
                  flex-none w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                    index === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300/30' :
                    index === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                    'bg-gray-800 text-gray-500'
                  }
                `}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-pujo-gold transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {item.type} {item.data?.zone ? `• ${item.data.zone}` : ''}
                  </p>
                </div>

                <div className="flex-none text-gray-600 group-hover:text-gray-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
