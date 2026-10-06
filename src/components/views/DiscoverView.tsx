import React, { useState, useMemo } from 'react';
import { useMapStore } from '../../store/useMapStore';
import PandalCard from '../cards/PandalCard';
import { t } from '../../lib/i18n';
import { telemetry } from '../../lib/telemetry';

export default function DiscoverView() {
  const { pandals, language, selectEntity } = useMapStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'theme' | 'heritage' | 'photo' | 'traditional'>('all');

  const CATEGORIES = [
    { id: 'all', label: 'All Featured (30)', bng: 'সব আকর্ষণ (৩০)', icon: '⭐' },
    { id: 'theme', label: 'Best Theme & Art', bng: 'সেরা থিম ও শিল্প', icon: '🎨' },
    { id: 'heritage', label: 'Best Heritage & Bonedi', bng: 'সেরা বনেদি ও ঐতিহ্য', icon: '🏛️' },
    { id: 'photo', label: 'Photogenic & Night Spectacle', bng: 'সেরা আলোকসজ্জা', icon: '✨' },
    { id: 'traditional', label: 'Best Traditional Idol', bng: 'সেরা সাবেকি প্রতিমা', icon: '🪔' },
  ];

  const featuredPandals = useMemo(() => {
    return pandals.filter((p) => p.isFeatured || p.isFamous);
  }, [pandals]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return featuredPandals;
    if (selectedCategory === 'theme') {
      return featuredPandals.filter(
        (p) => p.categories?.includes('theme-based') || p.tags?.includes('Theme') || p.zone === 'SOUTH' || p.zone === 'EAST'
      );
    }
    if (selectedCategory === 'heritage') {
      return featuredPandals.filter((p) => p.isHeritage || p.categories?.includes('traditional'));
    }
    if (selectedCategory === 'photo') {
      return featuredPandals.filter(
        (p) => p.categories?.includes('famous-for-lighting') || p.categories?.includes('award-winner')
      );
    }
    if (selectedCategory === 'traditional') {
      return featuredPandals.filter((p) => p.categories?.includes('traditional') || p.isHeritage);
    }
    return featuredPandals;
  }, [featuredPandals, selectedCategory]);

  return (
    <div className="w-full h-full overflow-y-auto bg-[var(--chalk)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="meta text-red-700 font-bold">EDITOR'S PICKS 2026</span>
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight">
          {language === 'bn' ? '৩০টি অবশ্য-দর্শনীয় মণ্ডপ' : '30 Pandals Worth Travelling For'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
          {language === 'bn'
            ? 'কলকাতার মহোৎসবের শ্রেষ্ঠ থিম, বনেদি বাড়ির সাবেকি পুজো এবং চোখ ধাঁধানো আলোকসজ্জার নির্বাচিত সংগ্রহ।'
            : 'Hand-picked architectural marvels, grand lighting installations, and iconic centuries-old traditional pujas.'}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 py-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id as any);
                telemetry.track('discover_category_click', { category: cat.id });
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{language === 'bn' ? cat.bng : cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((pandal) => (
          <PandalCard key={pandal.id} pandal={pandal} />
        ))}
      </div>
    </div>
  );
}
