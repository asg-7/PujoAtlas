import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PandalEntity, Zone } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';
import { navigateToDestination } from '../../lib/navigation';
import type { TravelMode } from '../../lib/navigation';

interface PandalHeaderProps {
  pandal: PandalEntity;
  metroStationName?: string;
  metroWalkingMinutes?: number;
  onClose: () => void;
  onNavigate?: (lat: number, lng: number) => void;
}

const ZONE_LABELS: Record<Zone, { en: string; bn: string }> = {
  NORTH:   { en: 'North Kolkata',   bn: 'উত্তর কলকাতা' },
  SOUTH:   { en: 'South Kolkata',   bn: 'দক্ষিণ কলকাতা' },
  CENTRAL: { en: 'Central Kolkata', bn: 'মধ্য কলকাতা' },
  EAST:    { en: 'East Kolkata',    bn: 'পূর্ব কলকাতা / সল্টলেক' },
  WEST:    { en: 'West Kolkata',    bn: 'পশ্চিম কলকাতা / বেহালা' },
};

export default function PandalHeader({
  pandal,
  metroStationName,
  metroWalkingMinutes,
  onClose,
}: PandalHeaderProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, isDragging: false });

  const zoneColor = ZONE_COLORS[pandal.zone] || '#B5513A';

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragRef.current.startY = e.touches[0].clientY;
    dragRef.current.isDragging = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.isDragging || !sheetRef.current) return;
    const deltaY = e.touches[0].clientY - dragRef.current.startY;
    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!sheetRef.current) return;
    const deltaY = sheetRef.current.getBoundingClientRect().top - window.innerHeight * 0.3;
    dragRef.current.isDragging = false;

    if (deltaY > 150) {
      sheetRef.current.style.transform = 'translateY(100%)';
      setTimeout(onClose, 260);
    } else {
      sheetRef.current.style.transform = 'translateY(0)';
    }
  }, [onClose]);

  useEffect(() => {
    if (sheetRef.current) {
      requestAnimationFrame(() => {
        if (sheetRef.current) {
          sheetRef.current.style.transform = 'translateY(0)';
        }
      });
    }
  }, []);

  const zoneInfo = ZONE_LABELS[pandal.zone] || { en: 'Kolkata', bn: 'কলকাতা' };

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out max-w-xl mx-auto"
      style={{ transform: 'translateY(100%)' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Backdrop for easy tap-out */}
      <div className="fixed inset-0 -top-full bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Thaal Sheet with Paper surface and Nimantran styling */}
      <div className="relative thaal paper paper-2 max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Lal-par decorative top border */}
        <div className="lal-par-top w-full pt-2">
          {/* Drag handle */}
          <div className="flex justify-center pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1 bg-[var(--control-border)] rounded-full opacity-60" />
          </div>
        </div>

        {/* Invitation Card Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Top Header Row */}
          <div className="nimantran paper paper-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 text-[11px] font-semibold rounded-sm text-white tracking-wider uppercase"
                    style={{ backgroundColor: zoneColor }}
                  >
                    {zoneInfo.en} • {zoneInfo.bn}
                  </span>
                  {pandal.isFamous && (
                    <span className="chip text-[10px]">
                      ⭐ ঐতিহাসিক / খ্যাতনামা
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--ink)] tracking-tight leading-tight mt-1">
                  {pandal.name}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--ink-2)] flex items-center gap-1">
                  <span>📍</span>
                  <span>{pandal.address}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="btn min-h-[36px] w-[36px] p-0 rounded-full border-[var(--control-border)] text-[var(--ink)] hover:bg-[var(--chalk)] shrink-0"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Metro Connectivity Badge */}
            {metroStationName && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--ink-2)]">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚇</span>
                  <div>
                    <span className="font-semibold text-[var(--ink)]">{metroStationName}</span>
                    <span className="text-[var(--ink-3)] ml-1">মেট্রো স্টেশন</span>
                  </div>
                </div>
                {metroWalkingMinutes !== undefined && (
                  <span className="meta text-[var(--neel)] font-bold">
                    🚶 {metroWalkingMinutes} min walk
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Crowd Timings & Visiting Windows */}
          {pandal.bestTimeToVisit && pandal.bestTimeToVisit.length > 0 && (
            <div className="space-y-1.5">
              <div className="meta text-[var(--geru-text)] flex items-center gap-1.5">
                <span>🕒</span>
                <span>সেরা দর্শনের সময় (Visiting Hours & Crowd Windows)</span>
              </div>
              <div className="space-y-1">
                {pandal.bestTimeToVisit.map((time, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-[var(--chalk-3)] border border-[var(--border)] text-xs text-[var(--ink)] flex items-center justify-between"
                  >
                    <span>{time}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--geru)]/15 text-[var(--geru-text)]">
                      পরামর্শ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {pandal.tags && pandal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pandal.tags.map((tag) => (
                <span key={tag} className="chip text-[10px]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pandal.name + ' Durga Puja, ' + pandal.address + ', Kolkata')}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary w-full py-3 text-sm font-bold shadow-md tracking-wide flex items-center justify-center gap-2 no-underline"
            >
              <span>🧭</span>
              <span>গুগল ম্যাপে মণ্ডপ দর্শন করুন (Directions)</span>
            </a>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pandal.name + ' Durga Puja, ' + pandal.address + ', Kolkata')}&travelmode=transit`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn py-2 text-xs no-underline text-center"
              >
                <span>🚇</span> Metro
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn py-2 text-xs no-underline text-center"
              >
                <span>🚶</span> Walk
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn py-2 text-xs no-underline text-center"
                title="Exact GPS Pin"
              >
                <span>📍</span> GPS Pin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
