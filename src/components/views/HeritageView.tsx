import React, { useState, useMemo } from 'react';
import { useMapStore } from '../../store/useMapStore';
import PandalCard from '../cards/PandalCard';
import { t } from '../../lib/i18n';
import { telemetry } from '../../lib/telemetry';

export default function HeritageView() {
  const { pandals, language } = useMapStore();
  const [ageFilter, setAgeFilter] = useState<'ALL' | '200' | '150' | '100' | '75'>('ALL');

  const heritagePandals = useMemo(() => {
    return pandals.filter((p) => p.isHeritage || (p.established && 2026 - p.established >= 75));
  }, [pandals]);

  const filtered = useMemo(() => {
    if (ageFilter === 'ALL') return heritagePandals;
    const minAge = parseInt(ageFilter, 10);
    return heritagePandals.filter((p) => p.established && 2026 - p.established >= minAge);
  }, [heritagePandals, ageFilter]);

  const AGE_PILLS = [
    { id: 'ALL', label: `All Heritage (${heritagePandals.length})`, bng: `সব ঐতিহ্য (${heritagePandals.length})` },
    { id: '200', label: '🏛️ 200+ Yrs (1820s)', bng: '🏛️ ২০০+ বছর' },
    { id: '150', label: '🏛️ 150+ Yrs (1870s)', bng: '🏛️ ১৫০+ বছর' },
    { id: '100', label: '🏛️ 100+ Yrs (1920s)', bng: '🏛️ ১০০+ বছর' },
    { id: '75', label: '🏛️ 75+ Yrs (1950s)', bng: '🏛️ ৭৫+ বছর' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-[var(--chalk)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Heritage Editorial Header */}
      <div className="space-y-2 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏛️</span>
          <span className="meta text-amber-800 font-bold">HERITAGE KOLKATA</span>
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight">
          {language === 'bn' ? 'কলকাতার বনেদি ও শতবর্ষীয় দুর্গোৎসব' : 'Discover the City’s Oldest Durga Pujas'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
          {language === 'bn'
            ? 'শোভাবাজার রাজবাড়ি থেকে সাবর্ণ রায়চৌধুরীর আটচালা—কলকাতার ইতিহাস ও আভিজাত্যে মোড়া দুর্গোৎসবের শতাব্দী প্রাচীন ঐতিহ্য।'
            : 'Step into the aristocratic Thakur Dalans of Sovabazar Rajbari, Sabarna Roy Chowdhury, and historic century-old barowaris.'}
        </p>
      </div>

      {/* Age Bracket Filter Chips */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-1">
        {AGE_PILLS.map((pill) => {
          const isActive = ageFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => {
                setAgeFilter(pill.id as any);
                telemetry.track('heritage_age_click', { age: pill.id });
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              <span>{language === 'bn' ? pill.bng : pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Heritage Pandals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((pandal) => (
          <PandalCard key={pandal.id} pandal={pandal} />
        ))}
      </div>
    </div>
  );
}
