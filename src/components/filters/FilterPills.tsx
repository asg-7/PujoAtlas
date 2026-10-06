import React, { useMemo } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { telemetry } from '../../lib/telemetry';

export default function FilterPills() {
  const {
    pandals,
    activeFilter,
    setFilter,
    savedPandalIds,
    activeLayers,
    toggleLayer,
  } = useMapStore();

  const counts = useMemo(() => {
    let all = 0;
    let featured = 0;
    let heritage = 0;

    pandals.forEach((p) => {
      if (p.lat && p.lng && p.lat > 20 && p.lng > 80) all++;
      if (p.isFeatured) featured++;
      if (p.isHeritage) heritage++;
    });

    return {
      all: all || 626,
      featured: featured || 30,
      heritage: heritage || 412,
      saved: savedPandalIds.length,
    };
  }, [pandals, savedPandalIds]);

  const PILLS = [
    {
      id: 'ALL',
      label: `All ${counts.all}`,
      icon: '🏛️',
    },
    {
      id: 'FEATURED',
      label: `Featured (${counts.featured})`,
      icon: '⭐',
    },
    {
      id: 'HERITAGE',
      label: 'Heritage (>75 Yrs)',
      icon: '👑',
    },
    {
      id: 'SAVED',
      label: `Saved (${counts.saved})`,
      icon: '🔖',
    },
    {
      id: 'NORTH',
      label: 'North Kolkata',
      icon: '',
    },
    {
      id: 'SOUTH',
      label: 'South Kolkata',
      icon: '',
    },
    {
      id: 'CENTRAL',
      label: 'Central Kolkata',
      icon: '',
    },
    {
      id: 'EAST',
      label: 'East Kolkata',
      icon: '',
    },
    {
      id: 'HOWRAH',
      label: 'Howrah',
      icon: '',
    },
    {
      id: 'OTHERS',
      label: 'Others',
      icon: '',
    },
  ];

  const handlePillClick = (pillId: string) => {
    const nextFilter = activeFilter === pillId && pillId !== 'ALL' ? 'ALL' : pillId;
    setFilter(nextFilter);
    telemetry.track('filter_click', { filter: nextFilter });
  };

  return (
    <div className="w-full space-y-1.5 px-2 sm:px-4">
      {/* Primary Reference Pills Row */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-1 items-center">
        {PILLS.map((pill) => {
          const isActive = activeFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => handlePillClick(pill.id)}
              className={`flex-none inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border select-none ${
                isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-md font-bold'
                  : 'bg-white/95 text-stone-800 border-stone-300 hover:bg-stone-50 hover:border-stone-400 font-medium shadow-sm'
              }`}
            >
              {pill.icon && <span className="text-xs">{pill.icon}</span>}
              <span className="whitespace-nowrap font-sans">{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Layer Controls: Quick toggles for Metro and Food Spots */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-0.5 items-center">
        <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider pl-1">
          Layers:
        </span>
        <button
          type="button"
          onClick={() => toggleLayer('metro')}
          className={`flex-none inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors select-none ${
            activeLayers.metro
              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
              : 'bg-white/80 text-stone-600 border-stone-200 opacity-60'
          }`}
        >
          <span>🚇</span>
          <span>Metro Lines</span>
        </button>

        <button
          type="button"
          onClick={() => toggleLayer('food')}
          className={`flex-none inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors select-none ${
            activeLayers.food
              ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
              : 'bg-white/80 text-stone-600 border-stone-200 opacity-60'
          }`}
        >
          <span>🍽️</span>
          <span>Food Spots</span>
        </button>
      </div>
    </div>
  );
}
