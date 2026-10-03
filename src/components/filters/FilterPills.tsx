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

// Inline SVG renderers for chip icons matching map markers
const PandalIcon = ({ color }: { color: string }) => (
  <svg width="14" height="17" viewBox="0 0 48 58" className="shrink-0">
    <path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill="#2A2622" stroke="#2A2622" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M24 56 C22 53 6 40.5 6 23.5 C6 13 13.5 7 24 2 C34.5 7 42 13 42 23.5 C42 40 26.2 53 24 56 Z" fill={color} stroke="#F8F5EE" strokeWidth="2.4" strokeLinejoin="round"/>
    <g fill="none" stroke="#F8F5EE" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 27.5 C18.5 26 22 19.5 24 14.5 C26 19.5 29.5 26 35.5 27.5"/>
      <path d="M17 28 V37.5 M31 28 V37.5 M12.5 38 H35.5"/>
      <path d="M21.6 38 V33.5 Q24 30.6 26.4 33.5 V38"/>
    </g>
    <circle cx="24" cy="11.6" r="1.9" fill="#F8F5EE"/>
  </svg>
);

const FoodIcon = ({ color }: { color: string }) => (
  <svg width="15" height="15" viewBox="0 0 48 48" className="shrink-0">
    <circle cx="24" cy="24" r="22" fill="#2A2622"/>
    <circle cx="24" cy="24" r="19.6" fill={color} stroke="#F8F5EE" strokeWidth="2.4"/>
    <path d="M12.2 26.5 H35.8 C35.8 33.8 30.6 38.6 24 38.6 C17.4 38.6 12.2 33.8 12.2 26.5 Z" fill="#F8F5EE" stroke="#F8F5EE" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M18.6 41 H29.4" stroke="#F8F5EE" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
    <g fill="none" stroke="#F8F5EE" strokeWidth="2.3" strokeLinecap="round">
      <path d="M17.6 22.2 C15.4 19.8 19.8 17.8 17.6 15"/>
      <path d="M24 22.2 C21.8 19.6 26.2 17.4 24 14"/>
      <path d="M30.4 22.2 C28.2 19.8 32.6 17.8 30.4 15"/>
    </g>
  </svg>
);

const MetroIcon = ({ color = '#3D4A5C' }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 48 48" className="shrink-0">
    <rect x="2" y="2" width="44" height="44" rx="12" fill="#2A2622"/>
    <rect x="4.4" y="4.4" width="39.2" height="39.2" rx="10" fill={color} stroke="#F8F5EE" strokeWidth="2.4"/>
    <g fill="none" stroke="#F8F5EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="14.5" y="10.5" width="19" height="23" rx="5.5"/>
      <path d="M17.5 39 L21 34 M30.5 39 L27 34"/>
    </g>
    <rect x="18.2" y="15" width="11.6" height="6.4" rx="1.6" fill="#F8F5EE"/>
    <circle cx="19.4" cy="28.3" r="1.9" fill="#F8F5EE"/><circle cx="28.6" cy="28.3" r="1.9" fill="#F8F5EE"/>
  </svg>
);

const LAYER_CONFIG = {
  pandals: {
    id: 'pandals' as const,
    label: 'Pandals',
    bngLabel: 'মণ্ডপ',
    iconRenderer: (active: boolean) => <PandalIcon color={active ? '#B5513A' : '#716B61'} />,
    activeColor: 'var(--geru)',
  },
  food: {
    id: 'food' as const,
    label: 'Food Spots',
    bngLabel: 'খাবার',
    iconRenderer: (active: boolean) => <FoodIcon color={active ? '#B8892F' : '#716B61'} />,
    activeColor: 'var(--brass)',
  },
  metro: {
    id: 'metro' as const,
    label: 'Metro',
    bngLabel: 'মেট্রো',
    iconRenderer: (active: boolean) => <MetroIcon color={active ? '#4A6A8A' : '#716B61'} />,
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
              {cfg.iconRenderer(isActive)}
              <span className="font-display tracking-wide">{cfg.label}</span>
              <span className="text-[10px] opacity-75 font-normal">({cfg.bngLabel})</span>
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
