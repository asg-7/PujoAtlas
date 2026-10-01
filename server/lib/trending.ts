/**
 * Trending Algorithm — Pujo Atlas Heuristic
 *
 * In-memory popularity scoring with atomic updates and 6-hour sliding window decay.
 *
 * Scoring rules:
 *   Base: 100
 *   Outbound navigate click: +3
 *   Search result click: +2 to target, -1 to others in view
 *   Time decay: scores decrement in 6-hour windows without positive actions (floor 0)
 */

interface ScoreEntry {
  score: number;
  lastPositiveAction: number; // timestamp ms
}

const BASELINE_SCORE = 100;
const NAVIGATE_CLICK_BOOST = 3;
const SEARCH_CLICK_BOOST = 2;
const SEARCH_VIEW_PENALTY = -1;
const DECAY_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours
const DECAY_AMOUNT = 5; // points lost per decay window without activity

const scoreCache = new Map<string, ScoreEntry>();

function getEntry(entityId: string): ScoreEntry {
  let entry = scoreCache.get(entityId);
  if (!entry) {
    entry = { score: BASELINE_SCORE, lastPositiveAction: Date.now() };
    scoreCache.set(entityId, entry);
  }
  return entry;
}

function clampFloor(value: number): number {
  return Math.max(0, value);
}

/**
 * Record an outbound navigation click for an entity.
 */
export function recordNavigateClick(entityId: string): number {
  const entry = getEntry(entityId);
  entry.score = clampFloor(entry.score + NAVIGATE_CLICK_BOOST);
  entry.lastPositiveAction = Date.now();
  return entry.score;
}

/**
 * Record a search result click.
 * @param clickedId - The entity the user clicked on (+2)
 * @param viewedIds - All entity IDs visible in search results (-1 each, except clicked)
 */
export function recordSearchClick(clickedId: string, viewedIds: string[]): number {
  const clickedEntry = getEntry(clickedId);
  clickedEntry.score = clampFloor(clickedEntry.score + SEARCH_CLICK_BOOST);
  clickedEntry.lastPositiveAction = Date.now();

  for (const id of viewedIds) {
    if (id === clickedId) continue;
    const entry = getEntry(id);
    entry.score = clampFloor(entry.score + SEARCH_VIEW_PENALTY);
  }

  return clickedEntry.score;
}

/**
 * Apply time-decay to all scores.
 * Scores without positive actions in the last 6-hour window lose points.
 */
export function applyTimeDecay(): void {
  const now = Date.now();

  for (const [, entry] of scoreCache) {
    const elapsed = now - entry.lastPositiveAction;
    if (elapsed >= DECAY_WINDOW_MS) {
      const windowsElapsed = Math.floor(elapsed / DECAY_WINDOW_MS);
      const totalDecay = windowsElapsed * DECAY_AMOUNT;
      entry.score = clampFloor(entry.score - totalDecay);
    }
  }
}

/**
 * Get the current score for an entity.
 */
export function getScore(entityId: string): number {
  return getEntry(entityId).score;
}

/**
 * Get all scores sorted descending.
 */
export function getTrendingScores(limit = 20): Array<{ entityId: string; score: number }> {
  applyTimeDecay();

  const entries: Array<{ entityId: string; score: number }> = [];
  for (const [entityId, entry] of scoreCache) {
    entries.push({ entityId, score: entry.score });
  }

  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, limit);
}

/**
 * Initialize scores for a list of entity IDs at baseline.
 */
export function initializeScores(entityIds: string[]): void {
  const now = Date.now();
  for (const id of entityIds) {
    if (!scoreCache.has(id)) {
      scoreCache.set(id, { score: BASELINE_SCORE, lastPositiveAction: now });
    }
  }
}

/**
 * Start the periodic decay worker (runs every 6 hours).
 */
let decayInterval: ReturnType<typeof setInterval> | null = null;

export function startDecayWorker(): void {
  if (decayInterval) return;
  decayInterval = setInterval(() => {
    applyTimeDecay();
    console.log('[trending] Time decay applied');
  }, DECAY_WINDOW_MS);
  // Don't block Node.js exit
  if (decayInterval.unref) decayInterval.unref();
}

export function stopDecayWorker(): void {
  if (decayInterval) {
    clearInterval(decayInterval);
    decayInterval = null;
  }
}
