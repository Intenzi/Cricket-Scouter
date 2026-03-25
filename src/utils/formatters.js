/**
 * utils/formatters.js
 *
 * Pure formatting and aggregation utilities for Cricket Scouter.
 *
 * Exports:
 *   calcAge(dateOfBirth)            — returns age in years as a number or null
 *   formatDate(isoString)           — "23 Nov 1991" style
 *   formatStyle(rawStyle)           — "right-hand-bat" → "Right Hand Bat"
 *   groupCareer(careerArray)        — aggregates the career array by format type
 *   slugify(name)                   — converts "Virat Kohli" to "virat-kohli"
 *   downloadJson(data, filename)    — triggers client-side JSON download
 *
 * All functions are pure — no side-effects, no imports from the store.
 */

/**
 * Calculates age in whole years from an ISO date-of-birth string.
 *
 * @param {string} dateOfBirth - ISO 8601 date string, e.g. "1991-11-23".
 * @returns {number|null} Age in years, or null if the input is invalid.
 */
export function calcAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Formats an ISO date string as a readable display date.
 *
 * @param {string} isoString - ISO 8601 date string.
 * @returns {string} E.g. "23 Nov 1991", or "–" if invalid.
 */
export function formatDate(isoString) {
  if (!isoString) return '–';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Converts a snake-case API style string to title case for display.
 *
 * Examples:
 *   "right-hand-bat"  → "Right Hand Bat"
 *   "legbreak"        → "Legbreak"
 *   ""                → "–"
 *
 * @param {string} rawStyle - Raw style string from the API.
 * @returns {string} Human-readable title-case string.
 */
export function formatStyle(rawStyle) {
  if (!rawStyle) return '–';
  return rawStyle
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Aggregates a career array (as sanitized by sanitizeCareer) by format type.
 *
 * Groups entries by `type` (case-insensitive), then per group:
 *   - Sums: matches, innings, not_outs, runs, hundreds, fifties, wickets, runs_conceded
 *   - Max:  highest_inning_score (strips trailing "*", compares as number, restores)
 *   - Recalculates average as (runs / (innings - not_outs)) — never averages averages
 *   - Recalculates bowling average as (runs_conceded / wickets)
 *   - Calculates strike_rate as (runs / innings * 100) — simplified approximation
 *   - Calculates economy as (runs_conceded / overs)
 *
 * Returns an empty array if input is falsy or empty.
 *
 * @param {Array<object>} careerArray - Sanitized career entries from the store.
 * @returns {Array<object>} Aggregated rows sorted by a canonical format order.
 */
export function groupCareer(careerArray) {
  if (!Array.isArray(careerArray) || careerArray.length === 0) return [];

  /** Canonical display order for format types */
  const FORMAT_ORDER = ['Test', 'ODI', 'T20I', 'T20', 'Other'];

  /** @type {Map<string, object>} */
  const grouped = new Map();

  for (const entry of careerArray) {
    const key = (entry.type || 'Other').toUpperCase();
    // Normalise to canonical casing
    const canonical =
      FORMAT_ORDER.find((f) => f.toUpperCase() === key) || entry.type || 'Other';

    if (!grouped.has(canonical)) {
      grouped.set(canonical, {
        type: canonical,
        matches: 0,
        innings: 0,
        not_outs: 0,
        runs: 0,
        highest_raw: 0,
        highest_starred: false,
        hundreds: 0,
        fifties: 0,
        wickets: 0,
        runs_conceded: 0,
        overs: 0,
        balls_faced: 0,
      });
    }

    const agg = grouped.get(canonical);
    const b = entry.batting || {};
    const bw = entry.bowling || {};

    agg.matches       += b.matches        || 0;
    agg.innings       += b.innings        || 0;
    agg.not_outs      += b.not_outs       || 0;
    agg.runs          += b.runs_scored    || 0;
    agg.hundreds      += b.hundreds       || 0;
    agg.fifties       += b.fifties        || 0;
    agg.wickets       += bw.wickets       || 0;
    agg.runs_conceded += bw.runs_conceded || 0;
    agg.overs         += bw.overs         || 0;
    agg.balls_faced   += b.balls_faced    || 0;

    // Highest inning score: strip "*", compare numerically, restore star if best was starred.
    const hsRaw = String(b.highest_inning_score || '0');
    const starred = hsRaw.endsWith('*');
    const hsNum = Number(hsRaw.replace('*', '')) || 0;
    if (hsNum > agg.highest_raw) {
      agg.highest_raw = hsNum;
      agg.highest_starred = starred;
    }
  }

  return FORMAT_ORDER
    .filter((fmt) => grouped.has(fmt))
    .concat([...grouped.keys()].filter((k) => !FORMAT_ORDER.includes(k)))
    .map((fmt) => {
      const agg = grouped.get(fmt);
      if (!agg) return null;

      const dismissals = agg.innings - agg.not_outs;
      const battingAvg = dismissals > 0
        ? (agg.runs / dismissals).toFixed(2)
        : agg.innings > 0 ? '∞' : '–';

      const bowlingAvg = agg.wickets > 0
        ? (agg.runs_conceded / agg.wickets).toFixed(2)
        : '–';

      const economy = agg.overs > 0
        ? (agg.runs_conceded / agg.overs).toFixed(2)
        : '–';

      return {
        type:           agg.type,
        matches:        agg.matches,
        innings:        agg.innings,
        not_outs:       agg.not_outs,
        runs:           agg.runs,
        highest:        agg.highest_raw > 0
                          ? `${agg.highest_raw}${agg.highest_starred ? '*' : ''}`
                          : '–',
        batting_avg:    battingAvg,
        hundreds:       agg.hundreds,
        fifties:        agg.fifties,
        wickets:        agg.wickets,
        bowling_avg:    bowlingAvg,
        economy:        economy,
        overs:          agg.overs,
        runs_conceded:  agg.runs_conceded,
        balls_faced:    agg.balls_faced,
      };
    })
    .filter(Boolean);
}

/**
 * Converts a player name into a URL-friendly slug.
 *
 * @param {string} name - The name to slugify.
 * @returns {string} The slug.
 */
export function slugify(name) {
  if (!name) return 'player';
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Triggers a client-side download of JSON data.
 *
 * @param {object} data - The object to export.
 * @param {string} filename - The name of the file (e.g. "player-123.json").
 */
export function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

