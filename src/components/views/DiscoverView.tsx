import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Palette,
  Landmark,
  Flame,
  Sun,
  Star,
} from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import PandalCard from '../cards/PandalCard';
import { t } from '../../lib/i18n';
import { telemetry } from '../../lib/telemetry';

export default function DiscoverView() {
  const { pandals, language } = useMapStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'theme' | 'heritage' | 'photo' | 'traditional'>('all');

  const CATEGORIES: Array<{
    id: 'all' | 'theme' | 'heritage' | 'photo' | 'traditional';
    label: string;
    bng: string;
    icon: React.ReactNode;
  }> = [
    { id: 'all', label: 'All Curated (30)', bng: 'সব আকর্ষণ (৩০)', icon: <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} /> },
    { id: 'theme', label: 'Theme & Art', bng: 'থিম ও শিল্প', icon: <Palette className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'heritage', label: 'Heritage & Bonedi', bng: 'বনেদি ও ঐতিহ্য', icon: <Landmark className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'photo', label: 'Night Illuminations', bng: 'আলোকসজ্জা', icon: <Flame className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'traditional', label: 'Sabeki Pratima', bng: 'সাবেকি প্রতিমা', icon: <Sun className="w-3.5 h-3.5" strokeWidth={1.5} /> },
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
    <div className="w-full h-full overflow-y-auto bg-shola dark:bg-base p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-sand dark:border-line pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-kumkum dark:text-kumkum-lit" strokeWidth={1.5} />
          <span className="text-[11px] font-semibold text-terracotta uppercase tracking-wider">
            EDITORIAL CURATION 2026
          </span>
        </div>
        <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-ink dark:text-text tracking-tight">
          {language === 'bn' ? '৩০টি অবশ্য-দর্শনীয় মণ্ডপ' : '30 Pandals Worth Travelling For'}
        </h1>
        <p className="text-xs sm:text-sm text-smoke dark:text-text-muted max-w-2xl leading-relaxed">
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
                setSelectedCategory(cat.id);
                telemetry.track('discover_category_click', { category: cat.id });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-fast flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[36px] ${
                isActive
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
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
