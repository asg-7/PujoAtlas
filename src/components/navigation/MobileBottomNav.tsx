import React from 'react';
import {
  Compass,
  Sparkles,
  Landmark,
  Route,
  UtensilsCrossed,
  Bookmark,
} from 'lucide-react';
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

  const TABS: Array<{ id: MainTab; labelKey: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'explore', labelKey: 'nav.explore', icon: <Compass className="w-5 h-5" strokeWidth={1.5} /> },
    { id: 'discover', labelKey: 'nav.discover', icon: <Sparkles className="w-5 h-5" strokeWidth={1.5} /> },
    { id: 'heritage', labelKey: 'nav.heritage', icon: <Landmark className="w-5 h-5" strokeWidth={1.5} /> },
    { id: 'planner', labelKey: 'nav.planner', icon: <Route className="w-5 h-5" strokeWidth={1.5} /> },
    { id: 'food', labelKey: 'nav.food', icon: <UtensilsCrossed className="w-5 h-5" strokeWidth={1.5} /> },
    {
      id: 'mypuja',
      labelKey: 'nav.mypuja',
      icon: <Bookmark className="w-5 h-5" strokeWidth={1.5} />,
      badge: savedPandalIds.length + visitedPandalIds.length || undefined,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 dark:bg-surface/95 backdrop-blur-md border-t border-sand dark:border-line shadow-e2 safe-area-bottom transition-colors duration-fast"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid grid-cols-6 h-16 items-center px-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all duration-fast relative ${
                isActive
                  ? 'text-kumkum dark:text-kumkum-lit font-semibold'
                  : 'text-smoke dark:text-text-muted hover:text-ink dark:hover:text-text'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <span>{tab.icon}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-e1">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-normal mt-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[52px] leading-none">
                {t(tab.labelKey, language)}
              </span>
              {isActive && <div className="w-4 h-0.5 bg-kumkum dark:bg-kumkum-lit rounded-full mt-1" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
