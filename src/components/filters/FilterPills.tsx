import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { Zone } from '../../lib/schemas';
import { telemetry } from '../../lib/telemetry';

const ZONES: Array<{ id: Zone | 'ALL'; label: string; colorClass: string }> = [
  { id: 'ALL', label: 'All Zones', colorClass: 'bg-gray-700 text-white' },
  { id: 'NORTH', label: 'North', colorClass: 'bg-blue-600 text-white' },
  { id: 'SOUTH', label: 'South', colorClass: 'bg-emerald-600 text-white' },
  { id: 'CENTRAL', label: 'Central', colorClass: 'bg-red-600 text-white' },
  { id: 'EAST', label: 'East', colorClass: 'bg-amber-600 text-white' },
  { id: 'WEST', label: 'West', colorClass: 'bg-purple-600 text-white' },
];

const LAYER_CONFIG = {
  pandals: {
    id: 'pandals' as const,
    label: 'Pandals',
    icon: '🎪',
    activeClass: 'bg-rose-900/80 text-rose-100 border-rose-500 font-semibold shadow-sm shadow-rose-950',
    indicatorClass: 'bg-rose-400',
  },
  food: {
    id: 'food' as const,
    label: 'Food Spots',
    icon: '🍽️',
    activeClass: 'bg-amber-900/80 text-amber-100 border-amber-500 font-semibold shadow-sm shadow-amber-950',
    indicatorClass: 'bg-amber-400',
  },
  metro: {
    id: 'metro' as const,
    label: 'Metro Network',
    icon: '🚇',
    activeClass: 'bg-sky-900/80 text-sky-100 border-sky-400 font-semibold shadow-sm shadow-sky-950',
    indicatorClass: 'bg-sky-400',
  },
};

/**
 * T-21: Multi-Zone & Layer Filter Bar.
 * Horizontal scrollable pills for zone filtering and layer toggling.
 */
export default function FilterPills() {
  const { activeZone, setZone, activeLayers, toggleLayer } = useMapStore();

  const handleZoneClick = (zoneId: Zone | 'ALL') => {
    if (activeZone === zoneId) return;
    setZone(zoneId);
    telemetry.track('zone_click', { zone: zoneId });
    
    // Dispatch custom event for the map engine to catch and execute flyTo bounds
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('map:flyToZone', { detail: { zone: zoneId } }));
    }
  };

  const handleLayerClick = (layerId: keyof typeof activeLayers) => {
    toggleLayer(layerId);
    telemetry.track('layer_toggle', { layer: layerId, active: !activeLayers[layerId] });
  };

  return (
    <div className="w-full">
      {/* Zone Filters */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 py-2 snap-x">
        {ZONES.map((zone) => {
          const isActive = activeZone === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => handleZoneClick(zone.id)}
              className={`flex-none snap-start px-4 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                isActive
                  ? zone.colorClass + ' shadow-lg scale-105'
                  : 'bg-gray-800/80 text-gray-400 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {zone.label}
            </button>
          );
        })}
      </div>

      {/* Layer Toggles */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 pb-2 snap-x">
        {(Object.keys(LAYER_CONFIG) as Array<keyof typeof LAYER_CONFIG>).map((key) => {
          const cfg = LAYER_CONFIG[key];
          const isActive = activeLayers[key];
          return (
            <button
              key={cfg.id}
              onClick={() => handleLayerClick(cfg.id)}
              className={`flex-none snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95 border ${
                isActive
                  ? cfg.activeClass
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ml-0.5 transition-colors ${
                  isActive ? cfg.indicatorClass : 'bg-gray-600'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
