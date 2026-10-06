import React, { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Cake,
  Soup,
  Coffee,
  Navigation,
  Clock,
} from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import type { FoodCategory } from '../../lib/schemas';
import { telemetry } from '../../lib/telemetry';

export default function FoodView() {
  const { food, language } = useMapStore();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'ALL'>('ALL');

  const CATEGORIES: Array<{
    id: FoodCategory | 'ALL';
    label: string;
    bng: string;
    icon: React.ReactNode;
  }> = [
    { id: 'ALL', label: 'All Food Spots', bng: 'সব খাবার', icon: <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'SWEETS', label: 'Mishti & Desserts', bng: 'মিষ্টি ও ডেজার্ট', icon: <Cake className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'STREET_FOOD', label: 'Street Food & Rolls', bng: 'স্ট্রিট ফুড ও রোল', icon: <Soup className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'RESTAURANT', label: 'Bengali Thali & Biryani', bng: 'রেস্তোরাঁ ও বিরিয়ানি', icon: <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'CAFE', label: 'Heritage Cafes & Tea', bng: 'ক্যাফে ও চা', icon: <Coffee className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  ];

  const filteredFood = useMemo(() => {
    if (selectedCategory === 'ALL') return food;
    return food.filter((f) => f.category === selectedCategory);
  }, [food, selectedCategory]);

  return (
    <div className="w-full h-full overflow-y-auto bg-shola dark:bg-base p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Food Header */}
      <div className="space-y-2 border-b border-sand dark:border-line pb-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
          <span className="text-[11px] font-semibold text-terracotta uppercase tracking-wider">
            PUJA FOOD & SWEETS GUIDE
          </span>
        </div>
        <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-ink dark:text-text tracking-tight">
          {language === 'bn' ? 'পুজোর আড্ডা ও সেরা খাওয়াদাওয়া' : 'Eat Around Kolkata Pandals'}
        </h1>
        <p className="text-xs sm:text-sm text-smoke dark:text-text-muted max-w-2xl leading-relaxed">
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

      {/* Food Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFood.map((item) => {
          return (
            <div
              key={item.id}
              className="rounded-md bg-paper dark:bg-surface border border-sand dark:border-line p-4 shadow-e1 hover:shadow-e2 transition-all duration-fast flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-sm bg-sand/60 dark:bg-line text-ink dark:text-text uppercase tracking-wider">
                    {item.zone}
                  </span>

                  <span className="text-xs font-medium text-smoke dark:text-text-muted px-2 py-0.5 rounded-sm bg-shola dark:bg-base border border-sand dark:border-line">
                    {item.priceRange === 'BUDGET' ? '₹ Budget' : item.priceRange === 'PREMIUM' ? '₹₹₹ Premium' : '₹₹ Mid'}
                  </span>
                </div>

                <h3 className="font-serif font-semibold text-base text-ink dark:text-text tracking-tight">
                  {item.name}
                </h3>

                <p className="text-xs text-smoke dark:text-text-muted line-clamp-1">
                  📍 {item.address}
                </p>

                {item.mustTryDishes && item.mustTryDishes.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-medium text-terracotta">Must Try:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.mustTryDishes.map((dish) => (
                        <span
                          key={dish}
                          className="px-2 py-0.5 rounded-sm text-[11px] font-normal bg-shola dark:bg-base text-ink dark:text-text border border-sand dark:border-line"
                        >
                          {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-sand/60 dark:border-line flex items-center justify-between gap-2">
                <span className="text-[11px] text-smoke dark:text-text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{item.openHours || 'Open late night'}</span>
                </span>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + item.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-xs font-medium shadow-e1 no-underline flex items-center gap-1.5 transition-colors duration-fast min-h-[36px]"
                >
                  <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} />
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
