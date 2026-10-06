import React, { useState, useMemo } from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { FoodCategory } from '../../lib/schemas';
import { ZONE_COLORS } from '../../lib/map/MapEngineAdapter';
import { t } from '../../lib/i18n';
import { telemetry } from '../../lib/telemetry';

export default function FoodView() {
  const { food, language, pandals, selectEntity } = useMapStore();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'ALL'>('ALL');

  const CATEGORIES: Array<{ id: FoodCategory | 'ALL'; label: string; bng: string; icon: string }> = [
    { id: 'ALL', label: 'All Food Spots', bng: 'সব খাবার', icon: '🍽️' },
    { id: 'SWEETS', label: 'Mishti & Desserts', bng: 'মিষ্টি ও ডেজার্ট', icon: '🧁' },
    { id: 'STREET_FOOD', label: 'Kolkata Street Food', bng: 'স্ট্রিট ফুড ও রোল', icon: '🌯' },
    { id: 'RESTAURANT', label: 'Bengali Thali & Biryani', bng: 'রেস্তোরাঁ ও বিরিয়ানি', icon: '🥘' },
    { id: 'CAFE', label: 'Heritage Cafes & Tea', bng: 'ক্যাফে ও চা', icon: '☕' },
  ];

  const filteredFood = useMemo(() => {
    if (selectedCategory === 'ALL') return food;
    return food.filter((f) => f.category === selectedCategory);
  }, [food, selectedCategory]);

  return (
    <div className="w-full h-full overflow-y-auto bg-[var(--chalk)] p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Food Header */}
      <div className="space-y-2 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="meta text-amber-800 font-bold">PUJA FOOD & SWEETS GUIDE</span>
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight">
          {language === 'bn' ? 'পুজোর আড্ডা ও সেরা খাওয়াদাওয়া' : 'Eat Around Kolkata Pandals'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)] max-w-2xl leading-relaxed">
          {language === 'bn'
            ? 'মণ্ডপ পরিক্রমার ফাঁকে কলকাতার সেরা মিষ্টি, মুঘলাই পরোটা, কাঠি রোল এবং ঐতিহ্যবাহী বাঙালি রেস্তোরাঁ।'
            : 'Legendary sweet shops, steaming kathi rolls, Kosha Mangsho, and iconic heritage cafes near major pandals.'}
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
                telemetry.track('food_category_click', { category: cat.id });
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                  : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--border)] hover:bg-[var(--chalk-3)]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{language === 'bn' ? cat.bng : cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFood.map((item) => {
          const zoneColor = ZONE_COLORS[item.zone] || '#B8892F';
          return (
            <div
              key={item.id}
              className="rounded-2xl bg-[var(--chalk-2)] border border-[var(--border)] p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold rounded text-white uppercase tracking-wider"
                    style={{ backgroundColor: zoneColor }}
                  >
                    {item.zone}
                  </span>

                  <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {item.priceRange === 'BUDGET' ? '₹ Budget' : item.priceRange === 'PREMIUM' ? '₹₹₹ Premium' : '₹₹ Mid'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[var(--ink)] tracking-tight">
                  {item.name}
                </h3>

                <p className="text-xs text-[var(--ink-2)] line-clamp-1">
                  📍 {item.address}
                </p>

                {item.mustTryDishes && item.mustTryDishes.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-red-700">Must Try:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.mustTryDishes.map((dish) => (
                        <span
                          key={dish}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--chalk)] text-[var(--ink)] border border-[var(--border)]"
                        >
                          {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--ink-3)]">
                  🕒 {item.openHours || 'Open late night'}
                </span>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + item.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs no-underline flex items-center gap-1"
                >
                  <span>🧭</span>
                  <span>Directions</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
