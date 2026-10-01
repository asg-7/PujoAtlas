import React from 'react';

interface NearbyEntity {
  id: string;
  name: string;
  type: 'pandal' | 'food';
  distanceMeters: number;
}

interface NearbyLinksProps {
  type: 'pandal' | 'food';
  items: NearbyEntity[];
  onSelect: (id: string, type: 'pandal' | 'food') => void;
}

export default function NearbyLinks({ type, items, onSelect }: NearbyLinksProps) {
  if (!items || items.length === 0) return null;

  const isPandal = type === 'pandal';
  const title = isPandal ? 'Nearby Food & Drink' : 'Nearby Pandals';
  const icon = isPandal ? '🍽️' : '🎪';

  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{icon}</span>
        <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{title}</h3>
      </div>
      
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 snap-x gap-3 hide-scrollbar">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id, item.type)}
            className="flex-none w-48 p-3 bg-gray-800/80 hover:bg-gray-700 rounded-xl border border-gray-700 snap-start text-left transition-colors active:scale-95"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-bold text-white leading-tight line-clamp-2">
                {item.name}
              </p>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              {item.distanceMeters < 1000
                ? `${item.distanceMeters}m away`
                : `${(item.distanceMeters / 1000).toFixed(1)}km away`}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
