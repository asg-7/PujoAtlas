import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  trailingAction?: React.ReactNode;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search pandals, localities, or metro...',
  ariaLabel = 'Search',
  className = '',
  trailingAction,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={`relative flex items-center ${className}`}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 h-4 w-4 text-smoke dark:text-text-muted shrink-0 z-10"
        strokeWidth={1.75}
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        enterKeyHint="search"
        spellCheck={false}
        className={`h-9 sm:h-10 w-full rounded-md border border-sand dark:border-line bg-shola dark:bg-base pl-9.5 text-xs sm:text-sm text-ink dark:text-text placeholder-smoke outline-none transition focus:border-kumkum dark:focus:border-kumkum-lit focus:ring-2 focus:ring-kumkum/20 dark:focus:ring-kumkum-lit/20 ${
          trailingAction ? (value ? 'pr-16' : 'pr-10') : (value ? 'pr-9' : 'pr-3')
        }`}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className={`absolute grid h-7 w-7 place-items-center rounded-sm text-smoke hover:text-ink dark:hover:text-text hover:bg-sand/30 dark:hover:bg-line transition cursor-pointer z-10 ${
            trailingAction ? 'right-9' : 'right-1.5'
          }`}
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}

      {trailingAction && (
        <div className="absolute right-1.5 flex items-center z-10">
          {trailingAction}
        </div>
      )}
    </form>
  );
}

export default SearchBar;
