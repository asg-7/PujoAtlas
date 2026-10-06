import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No pandals match these filters.',
  description = 'Try widening your search radius or clearing active zone and category filters.',
  primaryActionLabel = 'Clear all filters',
  onPrimaryAction,
  secondaryActionLabel = 'Browse all pandals',
  onSecondaryAction,
}) => {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
      {/* 1.5px stroke Terracotta architectural line art icon */}
      <svg
        className="w-16 h-16 text-terracotta stroke-current"
        viewBox="0 0 64 64"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Arch & Colonnade Outline */}
        <path d="M12 56 V24 C12 16 20 8 32 8 C44 8 52 16 52 24 V56" />
        <path d="M8 56 H56" />
        <path d="M20 56 V32 C20 26 25 20 32 20 C39 20 44 26 44 32 V56" />
        <line x1="32" y1="8" x2="32" y2="2" />
        <circle cx="32" cy="2" r="1.5" />
        <path d="M26 40 H38" />
      </svg>

      <div className="space-y-1">
        <h4 className="font-serif font-semibold text-base text-ink dark:text-text">
          {title}
        </h4>
        <p className="text-xs text-smoke dark:text-text-muted leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 w-full justify-center">
        {onPrimaryAction && (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-sindoor hover:bg-kumkum dark:bg-kumkum-lit dark:hover:bg-kumkum text-shola dark:text-base text-xs font-semibold shadow-e1 transition-colors duration-fast cursor-pointer min-h-[36px]"
          >
            {primaryActionLabel}
          </button>
        )}
        {onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-paper dark:bg-surface border border-sand dark:border-line hover:bg-sand/20 text-ink dark:text-text text-xs font-semibold transition-colors duration-fast cursor-pointer min-h-[36px]"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
