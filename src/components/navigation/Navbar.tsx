import React from 'react';
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

  const TABS: Array<{ id: MainTab; labelKey: string; icon: string; badge?: number }> = [
    { id: 'explore', labelKey: 'nav.explore', icon: '🗺️' },
    { id: 'discover', labelKey: 'nav.discover', icon: '⭐' },
    { id: 'heritage', labelKey: 'nav.heritage', icon: '🏛️' },
    { id: 'food', labelKey: 'nav.food', icon: '🍽️' },
    { id: 'planner', labelKey: 'nav.planner', icon: '🧭' },
    {
      id: 'mypuja',
      labelKey: 'nav.mypuja',
      icon: '❤️',
      badge: savedPandalIds.length + visitedPandalIds.length || undefined,
    },
  ];

  return (
    <header className="w-full bg-[var(--chalk)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Subtitle */}
        <div
          onClick={() => handleTabClick('explore')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0 group"
        >
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-lg shadow-md group-hover:scale-105 transition-transform">
            🪔
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-black text-lg sm:text-xl text-[var(--ink)] tracking-tight leading-none">
              {t('brandTitle', language)}
            </span>
            <span className="text-[10px] sm:text-xs text-[var(--geru-text)] font-medium tracking-wide">
              {t('brandSubtitle', language)}
            </span>
          </div>
        </div>

        {/* Desktop Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-[var(--ink)] hover:bg-[var(--chalk-3)]/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{t(tab.labelKey, language)}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                      isActive ? 'bg-white text-red-700' : 'bg-red-600 text-white'
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Near Me CTA Button */}
          <button
            onClick={handleNearMeClick}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
              userLocation
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-[var(--chalk-2)] text-[var(--ink)] border-[var(--control-border)] hover:bg-[var(--chalk-3)]'
            }`}
            title="Sort by nearest pandals (আমার কাছের পুজো)"
          >
            <span>📍</span>
            <span className="hidden xs:inline">{t('hero.nearMe', language)}</span>
          </button>

          {/* Language Switcher EN | বাংলা */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-full text-xs font-bold border border-[var(--control-border)] bg-[var(--chalk-2)] text-[var(--ink)] hover:bg-[var(--chalk-3)] transition-colors cursor-pointer"
            title="Toggle Language / ভাষা পরিবর্তন করুন"
          >
            {language === 'en' ? 'বাংলা' : 'EN'}
          </button>

          {/* Theme Switcher Din / Raat */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border border-[var(--control-border)] bg-[var(--chalk-2)] text-[var(--ink)] hover:bg-[var(--chalk-3)] flex items-center justify-center text-xs transition-colors cursor-pointer"
            title="Toggle Day/Night Mode (দিন / রাত)"
          >
            🌙
          </button>
        </div>
      </div>
    </header>
  );
}
