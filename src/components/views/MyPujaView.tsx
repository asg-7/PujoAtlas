import React, { useState } from 'react';
import {
  Bookmark,
  Check,
  Trophy,
  Sparkles,
  Landmark,
  Route,
} from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import { PandalCard } from '../cards/PandalCard';
import { EmptyState } from '../common/EmptyState';
import { t } from '../../lib/i18n';

export const MyPujaView: React.FC = () => {
  const {
    pandals,
    savedPandalIds,
    visitedPandalIds,
    language,
    setActiveTab,
    setRoutePandals,
  } = useMapStore();

  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'visited'>('saved');

  const savedPandals = pandals.filter((p) => savedPandalIds.includes(p.id));
  const visitedPandals = pandals.filter((p) => visitedPandalIds.includes(p.id));

  const GOAL_PANDALS = 30;
  const progressPercent = Math.min(100, Math.round((visitedPandals.length / GOAL_PANDALS) * 100));

  const heritageVisitedCount = visitedPandals.filter(
    (p) => p.heritageAge || p.isHeritage || (p.established && 2026 - p.established >= 75)
  ).length;

  const handlePlanRouteFromSaved = () => {
    setRoutePandals(savedPandalIds);
    setActiveTab('planner');
  };

  return (
    <div className="flex flex-col h-full bg-shola dark:bg-base overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-surface border-b border-sand dark:border-line p-6 sm:p-8 text-ink dark:text-text shadow-e1">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sand/40 dark:bg-line text-xs font-semibold text-terracotta uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{language === 'bn' ? 'আমার পার্সোনাল ড্যাশবোর্ড' : 'Personal Passport & Progress'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink dark:text-text tracking-tight">
            {language === 'bn' ? 'আমার পুজো ডায়েরি' : 'My Puja Passport'}
          </h1>
          <p className="text-xs sm:text-sm text-smoke dark:text-text-muted max-w-xl leading-relaxed">
            {language === 'bn'
              ? 'আপনার পছন্দের মণ্ডপগুলো ট্র্যাক করুন এবং আপনি কতগুলো ঠাকুর দর্শন করলেন তার হিসাব রাখুন।'
              : 'Track your bookmarked pandals, celebrate check-ins, and build your Puja hopping trail.'}
          </p>

          {/* Puja Progress Card */}
          <div className="mt-4 bg-paper dark:bg-raised border border-sand dark:border-line rounded-md p-4 sm:p-5 space-y-3 shadow-e1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-marigold" strokeWidth={1.5} />
                <span className="text-sm sm:text-base font-semibold text-ink dark:text-text">
                  {language === 'bn'
                    ? `${visitedPandals.length} / ${GOAL_PANDALS} মণ্ডপ দর্শন সম্পন্ন`
                    : `${visitedPandals.length} of ${GOAL_PANDALS} Pandals Visited`}
                </span>
              </div>
              <span className="text-xs font-semibold text-kumkum dark:text-kumkum-lit px-2 py-0.5 rounded bg-kumkum/10">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-sand/40 dark:bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-kumkum dark:bg-kumkum-lit rounded-full transition-all duration-base"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>

            {/* Milestone badges */}
            <div className="flex flex-wrap gap-2 text-xs pt-1">
              <span className="px-2 py-0.5 rounded-sm bg-sand/40 dark:bg-line text-ink dark:text-text flex items-center gap-1">
                <Landmark className="w-3 h-3 text-terracotta" strokeWidth={1.5} />
                <span>{heritageVisitedCount} Heritage Visited</span>
              </span>
              {savedPandals.length > 0 && (
                <span className="px-2 py-0.5 rounded-sm bg-sand/40 dark:bg-line text-ink dark:text-text flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-neel" strokeWidth={1.5} />
                  <span>{savedPandals.length} Saved</span>
                </span>
              )}
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveSubTab('saved')}
              className={`py-1.5 px-3.5 text-xs font-medium rounded-full border transition-all duration-fast cursor-pointer min-h-[36px] ${
                activeSubTab === 'saved'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              Saved Pandals ({savedPandals.length})
            </button>
            <button
              onClick={() => setActiveSubTab('visited')}
              className={`py-1.5 px-3.5 text-xs font-medium rounded-full border transition-all duration-fast cursor-pointer min-h-[36px] ${
                activeSubTab === 'visited'
                  ? 'bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base border-kumkum font-semibold shadow-e1'
                  : 'bg-paper dark:bg-surface text-ink dark:text-text border-sand dark:border-line hover:bg-sand/20'
              }`}
            >
              Visited Check-ins ({visitedPandals.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1">
        {activeSubTab === 'saved' ? (
          <div>
            {savedPandals.length === 0 ? (
              <EmptyState
                title={language === 'bn' ? 'কোনো মণ্ডপ সেভ করা হয়নি' : 'No Saved Pandals Yet'}
                description={
                  language === 'bn'
                    ? 'এক্সপ্লোর বা ডিসকভার ট্যাব থেকে আপনার পছন্দের মণ্ডপগুলোতে বুকমার্ক বাটনে ক্লিক করুন।'
                    : 'Bookmark pandals while exploring to build your personal must-visit list!'
                }
                primaryActionLabel="Explore Pandals"
                onPrimaryAction={() => setActiveTab('explore')}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-smoke dark:text-text-muted">
                    {savedPandals.length} pandals saved
                  </span>
                  <button
                    onClick={handlePlanRouteFromSaved}
                    className="px-3.5 py-1.5 bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit text-shola dark:text-base text-xs font-semibold rounded-md shadow-e1 flex items-center gap-1.5 transition-colors duration-fast cursor-pointer min-h-[36px]"
                  >
                    <Route className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Create Route from Saved</span>
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
              <EmptyState
                title={language === 'bn' ? 'কোনো দর্শন চেক-ইন নেই' : 'No Visited Pandals Yet'}
                description={
                  language === 'bn'
                    ? 'আপনি যে মণ্ডপগুলোতে গেছেন সেগুলোতে "দর্শন করেছি" বা চেক-ইন বাটনে ক্লিক করে ডায়েরিতে যোগ করুন।'
                    : 'Check in at pandals you have visited during Durga Puja to track your score!'
                }
                primaryActionLabel="Start Hopping"
                onPrimaryAction={() => setActiveTab('explore')}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-kumkum dark:text-kumkum-lit flex items-center gap-1">
                    <Check className="w-4 h-4" strokeWidth={2} />
                    <span>{visitedPandals.length} pandals checked off</span>
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
