import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { MainTab } from '../../store/useMapStore';
import { t } from '../../lib/i18n';
import { telemetry } from '../../lib/telemetry';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, language, savedPandalIds, visitedPandalIds } = useMapStore();

  const handleTabClick = (tab: MainTab) => {
    setActiveTab(tab);
    telemetry.track('mobile_nav_click', { tab });
  };

  const TABS: Array<{ id: MainTab; labelKey: string; icon: string; badge?: number }> = [
    { id: 'explore', labelKey: 'nav.explore', icon: '🗺️' },
    { id: 'discover', labelKey: 'nav.discover', icon: '⭐' },
    { id: 'heritage', labelKey: 'nav.heritage', icon: '🏛️' },
    { id: 'planner', labelKey: 'nav.planner', icon: '🧭' },
    { id: 'food', labelKey: 'nav.food', icon: '🍽️' },
    {
      id: 'mypuja',
      labelKey: 'nav.mypuja',
      icon: '❤️',
      badge: savedPandalIds.length + visitedPandalIds.length || undefined,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--chalk)]/95 backdrop-blur-md border-t border-[var(--border)] shadow-lg safe-area-bottom">
      <div className="grid grid-cols-6 h-16 items-center px-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
                isActive ? 'text-red-600 font-bold scale-105' : 'text-[var(--ink-2)] hover:text-[var(--ink)]'
              }`}
            >
              <div className="relative text-base sm:text-lg">
                <span>{tab.icon}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[50px]">
                {t(tab.labelKey, language)}
              </span>
              {isActive && <div className="w-5 h-0.5 bg-red-600 rounded-full mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
