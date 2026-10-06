import React, { useState, useMemo } from 'react';
import { Landmark, History, Clock } from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import PandalCard from '../cards/PandalCard';
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

  const AGE_PILLS: Array<{ id: 'ALL' | '200' | '150' | '100' | '75'; label: string; bng: string }> = [
    { id: 'ALL', label: `All Heritage (${heritagePandals.length})`, bng: `সব ঐতিহ্য (${heritagePandals.length})` },
    { id: '200', label: '200+ Yrs (1820s)', bng: '২০০+ বছর (১৮২০)' },
    { id: '150', label: '150+ Yrs (1870s)', bng: '১৫০+ বছর (১৮৭০)' },
    { id: '100', label: '100+ Yrs (1920s)', bng: '১০০+ বছর (১৯২০)' },
    { id: '75', label: '75+ Yrs (1950s)', bng: '৭৫+ বছর (১৯৫০)' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-shola dark:bg-base p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Heritage Editorial Header */}
      <div className="space-y-2 border-b border-sand dark:border-line pb-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
          <span className="text-[11px] font-semibold text-terracotta uppercase tracking-wider">
            HERITAGE & BONEDI BARI
          </span>
        </div>
        <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-ink dark:text-text tracking-tight">
          {language === 'bn' ? 'কলকাতার বনেদি ও শতবর্ষীয় দুর্গোৎসব' : 'Discover the City’s Oldest Durga Pujas'}
        </h1>
        <p className="text-xs sm:text-sm text-smoke dark:text-text-muted max-w-2xl leading-relaxed">
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
                setAgeFilter(pill.id);
                telemetry.track('heritage_age_click', { age: pill.id });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-fast flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[36px] ${
                isActive
                  ? 'bg-terracotta text-shola border-terracotta font-semibold shadow-e1'
                  : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              <History className="w-3.5 h-3.5" strokeWidth={1.5} />
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
