/**
 * utils/sanitize.js
 *
 * Primitive guards and sanitizers for every API response shape in Cricket Scouter.
 *
 * Rules:
 *   - Sanitizers never throw — they coerce or silently omit bad values.
 *   - Sanitizers are pure functions (no side-effects, no imports from the store).
 *   - Every field is optional-chained and protected by a primitive guard.
 *   - In DEV mode, sanitizeCareer() logs a warning if the shape is unexpected.
 *
 * Primitive guards:
 *   str(v)  → string: trims, strips < > " characters, returns '' if not a string
 *   num(v)  → number: returns Number(v) if finite, null otherwise
 *   bool(v) → Boolean coercion
 *   arr(v)  → returns v if Array.isArray(v), else []
 */

/**
 * Coerces `v` to a trimmed, stripped string.
 * Strips < > " to prevent accidental XSS from API data injected into the DOM.
 *
 * @param {*} v
 * @returns {string}
 */
export const str = (v) =>
  typeof v === 'string' ? v.trim().replace(/[<>"]/g, '') : '';

/**
 * Coerces `v` to a finite number, or returns null.
 *
 * @param {*} v
 * @returns {number|null}
 */
export const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/**
 * Boolean coercion.
 *
 * @param {*} v
 * @returns {boolean}
 */
export const bool = (v) => Boolean(v);

/**
 * Returns `v` if it is an array, otherwise returns an empty array.
 *
 * @param {*} v
 * @returns {Array}
 */
export const arr = (v) => (Array.isArray(v) ? v : []);

/**
 * Sanitizes a raw player record from GET /players or GET /players/{id}.
 *
 * @param {*} raw - Raw player object from the API response.
 * @returns {object|null} Sanitized player, or null if input is not an object.
 */
export function sanitizePlayer(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    id:           num(raw.id),
    country_id:   num(raw.country_id),
    firstname:    str(raw.firstname),
    lastname:     str(raw.lastname),
    fullname:     str(raw.fullname),
    image_path:   str(raw.image_path),   // consumers add onerror; no modification here
    dateofbirth:  str(raw.dateofbirth),
    gender:       str(raw.gender),
    battingstyle: str(raw.battingstyle),
    bowlingstyle: str(raw.bowlingstyle),
    position: {
      id:   num(raw.position?.id),
      name: str(raw.position?.name || 'Unknown'),
    },
    updated_at: str(raw.updated_at),
    career:     sanitizeCareer(raw.career || []),
    teams:      arr(raw.teams).map(sanitizeTeam).filter(Boolean),
  };
}

/**
 * Sanitizes a raw country record from GET /countries.
 * Does NOT touch extra.flag (inline SVG — XSS risk).
 *
 * @param {*} raw - Raw country object from the API response.
 * @returns {object|null}
 */
export function sanitizeCountry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id:         num(raw.id),
    name:       str(raw.name),
    image_path: str(raw.image_path),
    iso2:       str(raw.extra?.iso2),
    continent:  str(raw.extra?.continent),
  };
}

/**
 * Sanitizes a raw team record from GET /teams.
 *
 * @param {*} raw - Raw team object from the API response.
 * @returns {object|null}
 */
export function sanitizeTeam(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id:            num(raw.id),
    name:          str(raw.name),
    code:          str(raw.code),
    image_path:    str(raw.image_path),
    country_id:    num(raw.country_id),
    national_team: bool(raw.national_team),
  };
}

/**
 * Lightweight player sanitizer for the 60k Global Registry.
 * Only extracts fields necessary for the listing page and filtering.
 *
 * @param {object} raw - Raw player object.
 * @returns {object}
 */
export function sanitizePlayerLite(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // Extract unique format types for filtering (e.g. ['T20', 'ODI'])
  const formats = new Set();
  (raw.career || []).forEach(c => {
    if (c.type) formats.add(c.type.toUpperCase());
  });

  return {
    id:          num(raw.id),
    country_id:  num(raw.country_id),
    firstname:   str(raw.firstname),
    fullname:    str(raw.fullname),
    image_path:  str(raw.image_path),
    updated_at:  str(raw.updated_at),
    position: {
      id:   num(raw.position?.id),
      name: str(raw.position?.name || 'Unknown'),
    },
    formats: Array.from(formats), // Stored as array for IDB compatibility
  };
}

/**
 * Sanitizes the career array from a GET /players/{id}?include=career response.
 *
 * Written maximally defensively — the career include shape is unconfirmed.
 * Every field is optional-chained through a primitive guard.
 * In DEV mode, logs a warning if the top-level shape is unexpected.
 *
 * @param {*} rawArray - Raw career data array (or unknown/missing value).
 * @returns {object[]} Array of sanitized career entries (may be empty).
 */
export function sanitizeCareer(rawArray) {
  if (!Array.isArray(rawArray)) {
    if (import.meta.env.DEV && rawArray !== undefined && rawArray !== null) {
      console.warn('[sanitizeCareer] Unexpected career shape — expected array, got:', typeof rawArray, rawArray);
    }
    return [];
  }

  return rawArray.map((item) => {
    if (!item || typeof item !== 'object') return null;

    const b  = item.batting  || {};
    const bw = item.bowling  || {};

    if (import.meta.env.DEV && !item.batting) {
      console.warn('[sanitizeCareer] Career entry missing "batting" key:', item);
    }

    return {
      season_id: num(item.season_id),
      type:      str(item.type),
      batting: {
        matches:              num(b.matches)              ?? 0,
        innings:              num(b.innings)              ?? 0,
        runs_scored:          num(b.runs_scored)          ?? 0,
        not_outs:             num(b.not_outs)             ?? 0,
        highest_inning_score: b.highest_inning_score != null ? String(b.highest_inning_score) : '0',
        average:              num(b.average)              ?? null,
        strike_rate:          num(b.strike_rate)          ?? null,
        hundreds:             num(b.hundreds)             ?? 0,
        fifties:              num(b.fifties)              ?? 0,
        fours:                num(b.four_x)               ?? 0,
        sixes:                num(b.six_x)                ?? 0,
        balls_faced:          num(b.balls_faced)          ?? 0,
      },
      bowling: {
        overs:         num(bw.overs)         ?? 0,
        wickets:       num(bw.wickets)       ?? 0,
        average:       num(bw.average)       ?? null,
        econ_rate:     num(bw.econ_rate)     ?? null,
        runs_conceded: num(bw.runs)              ?? 0,
      },
    };
  }).filter(Boolean);
}
