import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { Zone } from '../../lib/schemas';
import { telemetry } from '../../lib/telemetry';

const ZONE_CAPSULES: Array<{ id: Zone | 'ALL'; label: string; bngLabel: string; color: string }> = [
  { id: 'ALL', label: 'All Zones', bngLabel: 'সব পুজো', color: 'var(--ink)' },
  { id: 'NORTH', label: 'North', bngLabel: 'উত্তর', color: '#4A6A8A' },
  { id: 'CENTRAL', label: 'Central', bngLabel: 'মধ্য', color: '#B5513A' },
  { id: 'SOUTH', label: 'South', bngLabel: 'দক্ষিণ', color: '#B8892F' },
  { id: 'EAST', label: 'East', bngLabel: 'পূর্ব', color: '#4F8A83' },
  { id: 'WEST', label: 'West', bngLabel: 'পশ্চিম', color: '#7E5A7E' },
];

const LAYER_CONFIG = {
  pandals: {
    id: 'pandals' as const,
    label: 'Pandals',
    bngLabel: 'মণ্ডপ',
    icon: '🏛️',
    activeColor: 'var(--geru)',
  },
  food: {
    id: 'food' as const,
    label: 'Food Spots',
    bngLabel: 'খাবার',
    icon: '🍽️',
    activeColor: 'var(--brass)',
  },
  metro: {
    id: 'metro' as const,
    label: 'Metro',
    bngLabel: 'মেট্রো',
    icon: '🚇',
    activeColor: 'var(--neel)',
  },
};

/**
 * Bonedi-Bari Multi-Zone Capsule Bar & Layer Controls.
 * Tactile pills with active color fill and dynamic map dimming.
 */
export default function FilterPills() {
  const { activeZone, setZone, activeLayers, toggleLayer } = useMapStore();

  const handleZoneClick = (zoneId: Zone | 'ALL') => {
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
    <div className="w-full space-y-2">
      {/* Zone Capsules */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-3.5 py-1 snap-x">
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
                      color: zone.id === 'ALL' ? 'var(--chalk)' : '#FFFFFF',
                    }
                  : undefined
              }
              className={`flex-none snap-start flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 border ${
                isActive
                  ? 'font-bold shadow-md scale-105 ring-2 ring-offset-1 ring-offset-[var(--chalk)] ring-opacity-60'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--control-border)] hover:border-[var(--ink)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors"
                style={{
                  backgroundColor: isActive
                    ? zone.id === 'ALL'
                      ? 'var(--chalk)'
                      : '#FFFFFF'
                    : zone.color,
                }}
              />
              <span className="font-display tracking-wide">{zone.label}</span>
              <span className="text-[10px] opacity-75 font-normal">({zone.bngLabel})</span>
            </button>
          );
        })}
      </div>

      {/* Layer Toggles (Pandals, Food, Metro) */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-3.5 pb-1 snap-x">
        {(Object.keys(LAYER_CONFIG) as Array<keyof typeof LAYER_CONFIG>).map((key) => {
          const cfg = LAYER_CONFIG[key];
          const isActive = activeLayers[key];
          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => handleLayerClick(cfg.id)}
              style={
                isActive
                  ? {
                      borderColor: cfg.activeColor,
                      color: 'var(--ink)',
                      backgroundColor: 'color-mix(in srgb, ' + cfg.activeColor + ' 16%, var(--chalk-2))',
                    }
                  : undefined
              }
              className={`flex-none snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all active:scale-95 border ${
                isActive
                  ? 'font-semibold shadow-sm'
                  : 'bg-[var(--chalk-2)]/80 text-[var(--ink-2)] border-[var(--border)] hover:border-[var(--control-border)]'
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
              <span
                className="w-2 h-2 rounded-full ml-1 transition-all"
                style={{
                  backgroundColor: isActive ? cfg.activeColor : 'var(--ink-3)',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
