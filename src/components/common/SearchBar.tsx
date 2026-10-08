import React, { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search, X, Landmark, UtensilsCrossed, MapPinned } from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import { searchPandals, searchFood, isActiveQuery } from '../../lib/search';
import { telemetry } from '../../lib/telemetry';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  trailingAction?: React.ReactNode;
}

type Option =
  | { kind: 'pandal'; id: string; title: string; subtitle: string; heritage?: boolean }
  | { kind: 'food'; id: string; title: string; subtitle: string };

const MAX_PANDALS = 6;
const MAX_FOOD = 3;

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search pandals, localities, or metro...',
  ariaLabel = 'Search',
  className = '',
  trailingAction,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const pandals = useMapStore((s) => s.pandals);
  const food = useMapStore((s) => s.food);
  const language = useMapStore((s) => s.language);
  const selectEntity = useMapStore((s) => s.selectEntity);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // Heavy work is deferred so typing never stutters; the input itself stays instant.
  const deferred = useDeferredValue(value);
  const queryOn = isActiveQuery(deferred);

  const { options, totalPandals } = useMemo(() => {
    if (!queryOn) return { options: [] as Option[], totalPandals: 0 };
    const allP = searchPandals(pandals, deferred);
    const p: Option[] = allP.slice(0, MAX_PANDALS).map((x) => ({
      kind: 'pandal',
      id: x.id,
      title: x.name,
      subtitle: x.nearestMetro ? `${x.zone} · ${x.nearestMetro}` : x.address || x.zone,
      heritage: x.isHeritage,
    }));
    const f: Option[] = searchFood(food, deferred, MAX_FOOD).map((x) => ({
      kind: 'food',
      id: x.id,
      title: x.name,
      subtitle: x.address,
    }));
    return { options: [...p, ...f], totalPandals: allP.length };
  }, [pandals, food, deferred, queryOn]);

  useEffect(() => setActive(-1), [deferred]);

  const closeAndBlur = () => {
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur(); // dismisses the phone keyboard so the map is visible
  };

  const choose = (opt: Option) => {
    telemetry.track('search_click', { id: opt.id, type: opt.kind, query: value });
    selectEntity(opt.id, opt.kind);
    closeAndBlur();
  };

  const showAllOnMap = () => {
    telemetry.track('search_click', { type: 'show_all', query: value, count: totalPandals });
    window.dispatchEvent(new CustomEvent('map:fitToResults', { detail: { query: value } }));
    closeAndBlur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (options.length ? (i + 1) % options.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && options[active]) choose(options[active]);
      else if (totalPandals > 1) showAllOnMap();
      else if (options[0]) choose(options[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const bn = language === 'bn';
  const showPanel = open && queryOn;
  const padRight = trailingAction ? (value ? 'pr-20' : 'pr-11') : value ? 'pr-10' : 'pr-3';

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 h-4 w-4 shrink-0 text-smoke z-10"
          strokeWidth={1.75}
        />

        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          enterKeyHint="search"
          spellCheck={false}
          className={`h-11 sm:h-10 w-full rounded-md border border-sand bg-shola pl-10 ${padRight} text-base sm:text-sm text-ink placeholder:text-smoke outline-none transition focus:border-kumkum dark:focus:border-kumkum-lit focus:ring-2 focus:ring-kumkum/25 dark:focus:ring-kumkum-lit/25`}
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className={`absolute grid h-8 w-8 place-items-center rounded-sm text-smoke hover:text-ink hover:bg-sand/40 transition cursor-pointer z-10 ${
              trailingAction ? 'right-11' : 'right-1.5'
            }`}
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}

        {trailingAction && <div className="absolute right-1.5 flex items-center z-10">{trailingAction}</div>}
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 overflow-hidden rounded-md border border-sand bg-paper shadow-e3"
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-smoke">
              {bn ? 'কিছু পাওয়া যায়নি' : 'No pandal or food spot matches'} “{value.trim()}”
            </div>
          ) : (
            <ul className="max-h-[min(50vh,22rem)] overflow-y-auto overscroll-contain py-1">
              {options.map((o, i) => (
                <li key={`${o.kind}-${o.id}`} role="presentation">
                  <button
                    id={`${listId}-${i}`}
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    tabIndex={-1}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(o)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left cursor-pointer min-h-[48px] ${
                      i === active ? 'bg-sand/40' : 'hover:bg-sand/30'
                    }`}
                  >
                    {o.kind === 'pandal' ? (
                      <Landmark className="h-4 w-4 shrink-0 text-kumkum dark:text-kumkum-lit" strokeWidth={1.5} />
                    ) : (
                      <UtensilsCrossed className="h-4 w-4 shrink-0 text-terracotta" strokeWidth={1.5} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{o.title}</span>
                      <span className="block truncate text-xs text-smoke">{o.subtitle}</span>
                    </span>
                    {o.kind === 'pandal' && o.heritage && (
                      <span className="shrink-0 rounded-sm border border-haldi/60 px-1.5 py-0.5 text-[10px] font-medium text-haldi">
                        {bn ? 'ঐতিহ্য' : 'Heritage'}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {totalPandals > 1 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={showAllOnMap}
              className="flex w-full items-center gap-2 border-t border-sand px-3.5 py-3 text-sm font-medium text-kumkum dark:text-kumkum-lit hover:bg-sand/30 cursor-pointer min-h-[48px]"
            >
              <MapPinned className="h-4 w-4" strokeWidth={1.5} />
              {bn ? `${totalPandals}টি মণ্ডপ ম্যাপে দেখুন` : `Show all ${totalPandals} pandals on map`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
