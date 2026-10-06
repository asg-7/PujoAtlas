import React, { useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { PandalCard } from '../cards/PandalCard';
import { t } from '../../lib/i18n';

export const MyPujaView: React.FC = () => {
  const {
    pandals,
    savedPandalIds,
    visitedPandalIds,
    customRoutePandalIds,
    language,
    setActiveTab,
    setRoutePandals,
  } = useMapStore();

  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'visited'>('saved');

  const savedPandals = pandals.filter((p) => savedPandalIds.includes(p.id));
  const visitedPandals = pandals.filter((p) => visitedPandalIds.includes(p.id));

  const GOAL_PANDALS = 30;
  const progressPercent = Math.min(100, Math.round((visitedPandals.length / GOAL_PANDALS) * 100));

  // Heritage visited count
  const heritageVisitedCount = visitedPandals.filter(
    (p) => p.heritageAge || p.isHeritage || (p.established && 2026 - p.established >= 75)
  ).length;

  const handlePlanRouteFromSaved = () => {
    setRoutePandals(savedPandalIds);
    setActiveTab('planner');
  };

  return (
    <div className="flex flex-col h-full bg-sand-50 dark:bg-zinc-950 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sand-900 via-zinc-900 to-terracotta-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-2 text-amber-300">
            ❤️ {language === 'bn' ? 'আমার পার্সোনাল ড্যাশবোর্ড' : 'Personal Puja Dashboard'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            {language === 'bn' ? 'আমার পুজো ডায়েরি' : 'My Puja Passport'}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 mt-1 max-w-xl">
            {language === 'bn'
              ? 'আপনার পছন্দের মণ্ডপগুলো ট্র্যাক করুন এবং আপনি কতগুলো ঠাকুর দর্শন করলেন তার হিসাব রাখুন।'
              : 'Track your bookmarked pandals, celebrate check-ins, and build your Puja legacy.'}
          </p>

          {/* Puja Progress Card */}
          <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {language === 'bn'
                    ? `${visitedPandals.length} / ${GOAL_PANDALS} মণ্ডপ দর্শন সম্পন্ন`
                    : `${visitedPandals.length} of ${GOAL_PANDALS} Pandals Hopped`}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/20 px-2.5 py-1 rounded-full">
                {progressPercent}% {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-terracotta-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>

            {/* Milestone badges */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-200 flex items-center gap-1">
                🏛️ {heritageVisitedCount} {language === 'bn' ? 'ঐতিহাসিক পুজো' : 'Heritage Visited'}
              </span>
              {visitedPandals.length >= 10 && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                  ⭐ {language === 'bn' ? 'দশমী পদক' : 'Pro Hopper'}
                </span>
              )}
              {savedPandals.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-200 flex items-center gap-1">
                  📌 {savedPandals.length} {language === 'bn' ? 'সংরক্ষিত' : 'Saved'}
                </span>
              )}
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 mt-5 p-1 bg-black/30 rounded-xl max-w-xs">
            <button
              onClick={() => setActiveSubTab('saved')}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeSubTab === 'saved'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              📌 {language === 'bn' ? 'পছন্দের তালিকা' : 'Saved'} ({savedPandals.length})
            </button>
            <button
              onClick={() => setActiveSubTab('visited')}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeSubTab === 'visited'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ✓ {language === 'bn' ? 'দর্শন তালিকা' : 'Visited'} ({visitedPandals.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1">
        {activeSubTab === 'saved' ? (
          <div>
            {savedPandals.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-sand-200 dark:border-zinc-800 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-sand-100 dark:bg-zinc-800 text-3xl flex items-center justify-center mx-auto mb-4">
                  📌
                </div>
                <h3 className="text-lg font-serif font-bold text-sand-900 dark:text-zinc-100">
                  {language === 'bn' ? 'কোনো মণ্ডপ সেভ করা হয়নি' : 'No Saved Pandals Yet'}
                </h3>
                <p className="text-xs sm:text-sm text-sand-600 dark:text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  {language === 'bn'
                    ? 'এক্সপ্লোর বা ডিসকভার ট্যাব থেকে আপনার পছন্দের মণ্ডপগুলোতে বুকমার্ক আইকনটিতে ক্লিক করুন।'
                    : 'Bookmark pandals while exploring to build your personal must-visit list!'}
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-6 px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  🔍 {language === 'bn' ? 'মণ্ডপ খুঁজুন' : 'Explore Pandals'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-semibold text-sand-600 dark:text-zinc-400">
                    {savedPandals.length} {language === 'bn' ? 'টি মণ্ডপ সংরক্ষিত' : 'saved pandals'}
                  </span>
                  <button
                    onClick={handlePlanRouteFromSaved}
                    className="px-3.5 py-1.5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    🗺️ {language === 'bn' ? 'সেভ করা মণ্ডপের রুট বানান' : 'Create Route from Saved'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedPandals.map((pandal) => (
                    <PandalCard key={pandal.id} pandal={pandal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {visitedPandals.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-sand-200 dark:border-zinc-800 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-sand-100 dark:bg-zinc-800 text-3xl flex items-center justify-center mx-auto mb-4">
                  ✨
                </div>
                <h3 className="text-lg font-serif font-bold text-sand-900 dark:text-zinc-100">
                  {language === 'bn' ? 'কোনো দর্শন চেক-ইন নেই' : 'No Visited Pandals Yet'}
                </h3>
                <p className="text-xs sm:text-sm text-sand-600 dark:text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  {language === 'bn'
                    ? 'আপনি যে মণ্ডপগুলোতে গেছেন সেগুলোতে "দর্শন করেছি" বা চেক-ইন বাটনে ক্লিক করে ডায়েরিতে যোগ করুন।'
                    : 'Check in at pandals you have visited during Durga Puja to track your score!'}
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-6 px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  🔍 {language === 'bn' ? 'মণ্ডপ দেখুন' : 'Start Hopping'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ✓ {visitedPandals.length} {language === 'bn' ? 'টি মণ্ডপ ঘুরে দেখেছেন' : 'pandals checked off'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visitedPandals.map((pandal) => (
                    <PandalCard key={pandal.id} pandal={pandal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
