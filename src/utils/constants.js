/**
 * utils/constants.js
 *
 * Application-wide constant values for Cricket Scouter.
 *
 * Contains:
 *   CRICKET_FACTS   — rotating fact strings shown on the SyncScreen
 *   SORT_OPTIONS    — available sort keys for the player listing
 *   POSITION_MAP    — confirmed position IDs from the SportMonks v2 dataset
 *   CACHE_TTL_MS    — 24-hour IndexedDB cache TTL in milliseconds
 *   PER_PAGE        — default players per page
 *
 * Never import from this file in CSS — tokens.css is the sole CSS source of truth.
 */

/**
 * Rotating cricket facts displayed on the SyncScreen during the initial load.
 * Each string is shown for ~5 seconds before fading to the next.
 *
 * @type {string[]}
 */
export const CRICKET_FACTS = [
  'Sachin Tendulkar is the only player to score 100 international centuries.',
  'The longest Test match lasted 12 days — England vs South Africa, 1939.',
  'Sir Don Bradman retired with a Test batting average of 99.94.',
  'Cricket is believed to have originated in south-east England in the 16th century.',
  'The highest individual Test score is 400* by Brian Lara (2004).',
  'Shane Warne\'s "Ball of the Century" dismissed Mike Gatting in 1993.',
  'Muthiah Muralidaran is the highest Test wicket-taker with 800 wickets.',
  'India beat the West Indies in the inaugural 1975 Cricket World Cup — wait, they didn\'t. West Indies won.',
  'The fastest delivery recorded in cricket was 161.3 km/h by Shoaib Akhtar.',
  'James Anderson became England\'s highest Test wicket-taker, surpassing Ian Botham.',
];

/**
 * Sort options available in the listing page sort controls.
 *
 * @type {{ value: string, label: string }[]}
 */
export const SORT_OPTIONS = [
  { value: 'id',         label: 'ID' },
  { value: 'firstname',  label: 'First Name' },
  { value: 'updated_at', label: 'Recently Updated' },
];

/**
 * Position IDs confirmed from the SportMonks v2 dataset (embedded in player records).
 * Players with IDs outside 1–4 appear only in the unfiltered view.
 *
 * @type {Record<number, string>}
 */
export const POSITION_MAP = {
  1: 'Batsman',
  2: 'Bowler',
  3: 'Wicket Keeper',
  4: 'All-Rounder',
};

/**
 * Position filter options derived from POSITION_MAP for the UI.
 *
 * @type {{ id: number, label: string }[]}
 */
export const POSITION_OPTIONS = Object.entries(POSITION_MAP).map(([id, label]) => ({
  id: Number(id),
  label,
}));

/**
 * Hardcoded list of unique career tournament types available in the API.
 * Generated via scripts/update-tournaments.js
 *
 * @type {{ id: string, label: string }[]}
 */
export const TOURNAMENT_OPTIONS = [
  { id: '100-ball', label: '100-BALL' },
  { id: '4day', label: '4DAY' },
  { id: 'list a', label: 'LIST A' },
  { id: 'odi', label: 'ODI' },
  { id: 't10', label: 'T10' },
  { id: 't20', label: 'T20' },
  { id: 't20i', label: 'T20I' },
  { id: 'test', label: 'TEST' },
  { id: 'test/5day', label: 'TEST/5DAY' },
  { id: 'youth odi', label: 'YOUTH ODI' },
];

/**
 * 24-hour TTL for the global player list (bootstrap) cache.
 *
 * @type {number}
 */
export const BOOTSTRAP_CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * 2-hour TTL for individual player detail enrichment.
 *
 * @type {number}
 */
export const DETAIL_CACHE_TTL = 2 * 60 * 60 * 1000;

/**
 * Number of player cards to show per listing page.
 *
 * @type {number}
 */
export const PER_PAGE = 12;

/**
 * 1-hour TTL for the "cool" loading animation ritual.
 * Decoupled from the 24-hour data fetch for better performance.
 *
 * @type {number}
 */
export const LOADER_TTL = 1 * 60 * 60 * 1000;

/**
 * IndexedDB cache key for the full bootstrap payload.
 *
 * @type {string}
 */
export const BOOTSTRAP_CACHE_KEY = 'bootstrap';

/**
 * IndexedDB cache key for loader metadata (last seen timestamp).
 *
 * @type {string}
 */
export const LOADER_CACHE_KEY = 'loader_meta';

/**
 * Static "scout summary" copy keyed by position name.
 * Used on the detail page because the API has no narrative player data.
 *
 * @type {Record<string, string>}
 */
export const SCOUT_SUMMARIES = {
  Batsman:
    'A technically sound top-order presence. Comfortable against both pace and spin, with the ability to anchor an innings or accelerate at will.',
  Bowler:
    'A versatile pace or spin option capable of picking up wickets in all phases. Consistent lines and lengths under pressure.',
  'Wicket Keeper':
    'Agile behind the stumps with lightning-fast reflexes. Also contributes healthy runs in the lower-to-middle order.',
  'All-Rounder':
    'A genuine match-winner in both departments. Can single-handedly shift the balance of a game with bat or ball.',
  Unknown:
    'A seasoned international campaigner with experience across multiple formats. A valuable member of any touring squad.',
};
