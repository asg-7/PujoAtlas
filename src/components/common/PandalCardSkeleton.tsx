import React from 'react';

export const PandalCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-md bg-paper dark:bg-surface border border-sand dark:border-line p-4 space-y-3 shadow-e1 animate-pulse">
      {/* Top badges placeholder */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 rounded-sm bg-sand/60 dark:bg-line skeleton-shimmer" />
          <div className="w-20 h-5 rounded-sm bg-sand/60 dark:bg-line skeleton-shimmer" />
        </div>
        <div className="w-8 h-4 rounded-sm bg-sand/60 dark:bg-line skeleton-shimmer" />
      </div>

      {/* Title & Address */}
      <div className="space-y-2">
        <div className="w-3/4 h-5 rounded-sm bg-sand/80 dark:bg-line skeleton-shimmer" />
        <div className="w-1/2 h-3.5 rounded-sm bg-sand/50 dark:bg-line skeleton-shimmer" />
      </div>

      {/* Transit & Distance */}
      <div className="flex items-center gap-3 pt-1">
        <div className="w-28 h-3.5 rounded-sm bg-sand/50 dark:bg-line skeleton-shimmer" />
        <div className="w-20 h-3.5 rounded-sm bg-sand/50 dark:bg-line skeleton-shimmer" />
      </div>

      {/* Bottom CTA Row */}
      <div className="pt-2 border-t border-sand/40 dark:border-line flex items-center justify-between gap-2">
        <div className="flex-1 h-9 rounded-md bg-sand/60 dark:bg-line skeleton-shimmer" />
        <div className="w-9 h-9 rounded-md bg-sand/60 dark:bg-line skeleton-shimmer" />
        <div className="w-9 h-9 rounded-md bg-sand/60 dark:bg-line skeleton-shimmer" />
        <div className="w-9 h-9 rounded-md bg-sand/60 dark:bg-line skeleton-shimmer" />
      </div>
    </div>
  );
};
