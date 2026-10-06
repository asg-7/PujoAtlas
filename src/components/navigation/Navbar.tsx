import React from 'react';
import {
  Compass,
  Sparkles,
  Landmark,
  UtensilsCrossed,
  Route,
  Bookmark,
  Locate,
  Moon,
  Sun,
  Flame,
} from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import type { MainTab } from '../../store/useMapStore';
import { t } from '../../lib/i18n';
import { telemetry } from '../../lib/telemetry';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    savedPandalIds,
    visitedPandalIds,
    userLocation,
    setUserLocation,
  } = useMapStore();

  const handleTabClick = (tab: MainTab) => {
    setActiveTab(tab);
    telemetry.track('nav_tab_click', { tab });
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
    telemetry.track('language_toggle', { lang: nextLang });
  };

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      const current = document.documentElement.dataset.theme;
      const next = current === 'din' ? 'raat' : 'din';
      document.documentElement.dataset.theme = next;
      window.dispatchEvent(new CustomEvent('map:themeChange', { detail: { theme: next } }));
    }
  };

  const handleNearMeClick = () => {
    telemetry.track('near_me_click', {});
    if (!navigator.geolocation) {
      alert(language === 'bn' ? 'আপনার ডিভাইসে লোকেশন সক্রিয় নেই' : 'Geolocation is not supported on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords, 'granted');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('map:locateUser'));
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setUserLocation(null, 'denied');
        alert(
          language === 'bn'
            ? 'লোকেশন পারমিশন পাওয়া যায়নি। আপনি ম্যানুয়ালি ম্যাপ ঘুরে দেখতে পারেন।'
            : 'Location permission was denied. You can continue exploring Kolkata manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const TABS: Array<{ id: MainTab; labelKey: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'explore', labelKey: 'nav.explore', icon: <Compass className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'discover', labelKey: 'nav.discover', icon: <Sparkles className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'heritage', labelKey: 'nav.heritage', icon: <Landmark className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'planner', labelKey: 'nav.planner', icon: <Route className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'food', labelKey: 'nav.food', icon: <UtensilsCrossed className="w-4 h-4" strokeWidth={1.5} /> },
    {
      id: 'mypuja',
      labelKey: 'nav.mypuja',
      icon: <Bookmark className="w-4 h-4" strokeWidth={1.5} />,
      badge: savedPandalIds.length + visitedPandalIds.length || undefined,
    },
  ];

  return (
    <header className="w-full bg-paper/95 dark:bg-surface/95 backdrop-blur-md border-b border-sand dark:border-line shadow-e1 sticky top-0 z-30 transition-colors duration-fast">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Editorial Subtitle */}
        <div
          onClick={() => handleTabClick('explore')}
          className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleTabClick('explore')}
          aria-label="Pujo Atlas Home"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-sindoor flex items-center justify-center text-shola shadow-e1 group-hover:scale-105 transition-transform duration-fast">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-shola" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-semibold text-base sm:text-lg text-ink dark:text-text tracking-tight leading-none">
              {t('brandTitle', language)}
            </span>
            <span className="text-[11px] text-terracotta dark:text-smoke font-normal tracking-normal mt-0.5 leading-tight">
              {t('brandSubtitle', language)}
            </span>
          </div>
        </div>

        {/* Desktop Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-fast flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                  isActive
                    ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base font-semibold shadow-e1'
                    : 'text-ink dark:text-text hover:bg-sand/30 dark:hover:bg-line/40'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{tab.icon}</span>
                <span>{t(tab.labelKey, language)}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                      isActive
                        ? 'bg-shola text-kumkum dark:bg-base dark:text-kumkum-lit'
                        : 'bg-kumkum text-shola dark:bg-kumkum-lit dark:text-base'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Near Me, Language, Theme */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Near Me CTA Button */}
          <button
            onClick={handleNearMeClick}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all duration-fast cursor-pointer min-h-[36px] ${
              userLocation
                ? 'bg-paper text-kumkum dark:text-kumkum-lit border-kumkum/40 shadow-e1'
                : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
            }`}
            title={language === 'bn' ? 'আমার নিকটের মণ্ডপ' : 'Find pandals near me'}
            aria-label="Locate pandals near me"
          >
            <Locate className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">{t('hero.nearMe', language)}</span>
          </button>

          {/* Language Switcher EN | বাংলা */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold border border-sand dark:border-line bg-paper dark:bg-surface text-ink dark:text-text hover:bg-sand/20 transition-colors duration-fast cursor-pointer min-h-[36px]"
            title="Toggle Language / ভাষা পরিবর্তন করুন"
            aria-label="Toggle language between English and Bengali"
          >
            {language === 'en' ? 'বাংলা' : 'EN'}
          </button>

          {/* Theme Switcher Din / Raat */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-sand dark:border-line bg-paper dark:bg-surface text-ink dark:text-text hover:bg-sand/20 flex items-center justify-center transition-colors duration-fast cursor-pointer"
            title="Toggle Day/Night Mode (দিন / রাত)"
            aria-label="Toggle light and dark mode"
          >
            <Moon className="w-4 h-4 dark:hidden" strokeWidth={1.5} />
            <Sun className="w-4 h-4 hidden dark:block" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
