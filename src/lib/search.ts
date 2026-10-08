import type { PandalEntity, FoodEntity } from './schemas';

/**
 * Normalise text for matching: lowercase, strip Latin accents, collapse
 * punctuation/whitespace. Bengali letters AND combining vowel signs (\p{M})
 * are preserved so Bengali queries keep working.
 */
export function norm(s?: string | null): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(query: string): string[] {
  const n = norm(query);
  return n ? n.split(' ') : [];
}

/** Minimum characters before a query is considered "active". */
export const MIN_QUERY_LENGTH = 2;

export function isActiveQuery(query: string): boolean {
  return norm(query).length >= MIN_QUERY_LENGTH;
}

function pandalHaystack(p: PandalEntity): string {
  return norm(
    [
      p.name,
      p.bngName,
      p.address,
      p.zone,
      p.nearestMetro,
      ...(p.categories ?? []),
      ...(p.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
  );
}

function foodHaystack(f: FoodEntity): string {
  return norm(
    [f.name, f.address, f.zone, f.category, ...(f.famousFor ?? []), ...(f.mustTryDishes ?? [])]
      .filter(Boolean)
      .join(' ')
  );
}

/** Every word the user typed must appear somewhere (order-independent). */
function matchesAll(haystack: string, tokens: string[]): boolean {
  return tokens.every((t) => haystack.includes(t));
}

/** Lower is better: name-prefix < name-contains < other-field match. */
function rank(name: string, tokens: string[]): number {
  const n = norm(name);
  const joined = tokens.join(' ');
  if (n.startsWith(joined)) return 0;
  if (n.includes(joined)) return 1;
  if (tokens.every((t) => n.includes(t))) return 2;
  return 3;
}

export function searchPandals(pandals: PandalEntity[], query: string, limit = Infinity): PandalEntity[] {
  const tokens = tokenize(query);
  if (!isActiveQuery(query)) return [];
  const hits = pandals
    .filter((p) => matchesAll(pandalHaystack(p), tokens))
    .map((p) => ({ p, r: rank(p.name, tokens) }))
    .sort((a, b) => a.r - b.r || a.p.name.localeCompare(b.p.name));
  return hits.slice(0, limit).map((h) => h.p);
}

export function searchFood(food: FoodEntity[], query: string, limit = Infinity): FoodEntity[] {
  const tokens = tokenize(query);
  if (!isActiveQuery(query)) return [];
  const hits = food
    .filter((f) => matchesAll(foodHaystack(f), tokens))
    .map((f) => ({ f, r: rank(f.name, tokens) }))
    .sort((a, b) => a.r - b.r || a.f.name.localeCompare(b.f.name));
  return hits.slice(0, limit).map((h) => h.f);
}

/** Ids of pandals matching the query, or null when the query is inactive (= show everything). */
export function pandalIdsForQuery(pandals: PandalEntity[], query: string): string[] | null {
  if (!isActiveQuery(query)) return null;
  return searchPandals(pandals, query).map((p) => p.id);
}
