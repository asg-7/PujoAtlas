import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { Zone } from '../../lib/schemas';
import { telemetry } from '../../lib/telemetry';

const ZONE_CAPSULES: Array<{ id: Zone | 'ALL'; label: string; color: string }> = [
  { id: 'ALL', label: 'All', color: '#EAB308' },
  { id: 'NORTH', label: 'North Kolkata', color: '#A855F7' },
  { id: 'SOUTH', label: 'South Kolkata', color: '#EAB308' },
  { id: 'CENTRAL', label: 'Central Kolkata', color: '#EF4444' },
  { id: 'EAST', label: 'Salt Lake / East', color: '#38BDF8' },
  { id: 'WEST', label: 'Behala / Howrah', color: '#14B8A6' },
];

const LAYER_CONFIG = {
  pandals: {
    id: 'pandals' as const,
    label: 'Pandals',
    icon: '🎪',
    activeClass: 'bg-rose-950/80 text-rose-100 border-rose-500 font-semibold shadow-sm',
    indicatorClass: 'bg-rose-400',
  },
  food: {
    id: 'food' as const,
    label: 'Food Spots',
    icon: '🍽️',
    activeClass: 'bg-amber-950/80 text-amber-100 border-amber-500 font-semibold shadow-sm',
    indicatorClass: 'bg-amber-400',
  },
  metro: {
    id: 'metro' as const,
    label: 'Metro Network',
    icon: '🚇',
    activeClass: 'bg-sky-950/80 text-sky-100 border-sky-400 font-semibold shadow-sm',
    indicatorClass: 'bg-sky-400',
  },
};

/**
 * Multi-Zone Capsule Bar & Layer Filter Controls.
 * High-visibility capsule chips with active color fill and translucent dimming on the map.
 */
export default function FilterPills() {
  const { activeZone, setZone, activeLayers, toggleLayer } = useMapStore();

  const handleZoneClick = (zoneId: Zone | 'ALL') => {
    // Tapping the active zone again clears and resets to ALL
    const nextZone = activeZone === zoneId && zoneId !== 'ALL' ? 'ALL' : zoneId;
    setZone(nextZone);
    telemetry.track('zone_click', { zone: nextZone });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('map:flyToZone', { detail: { zone: nextZone } }));
    }
  };

  const handleLayerClick = (layerId: keyof typeof activeLayers) => {
    toggleLayer(layerId);
    telemetry.track('layer_toggle', { layer: layerId, active: !activeLayers[layerId] });
  };

  return (
    <div className="w-full">
      {/* Zone Capsule Filter Row (matching reference map pills) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-3 py-2 snap-x">
        {ZONE_CAPSULES.map((zone) => {
          const isActive = activeZone === zone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => handleZoneClick(zone.id)}
              style={
                isActive
                  ? {
                      backgroundColor: zone.color,
                      borderColor: zone.color,
                      color: '#0B0E14',
                    }
                  : undefined
              }
              className={`flex-none snap-start flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 border ${
                isActive
                  ? 'font-bold shadow-md shadow-black/40 scale-105'
                  : 'bg-[#181D24]/90 text-gray-200 border-gray-700/80 hover:border-gray-500 hover:bg-[#222933]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors"
                style={{
                  backgroundColor: isActive ? '#0B0E14' : zone.color,
                }}
              />
              <span>{zone.label}</span>
            </button>
          );
        })}
      </div>

      {/* Layer Toggles (Pandals, Food, Metro) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-3 pb-2 snap-x">
        {(Object.keys(LAYER_CONFIG) as Array<keyof typeof LAYER_CONFIG>).map((key) => {
          const cfg = LAYER_CONFIG[key];
          const isActive = activeLayers[key];
          return (
            <button
              key={cfg.id}
              type="button"
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
