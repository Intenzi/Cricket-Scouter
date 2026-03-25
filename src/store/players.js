/**
 * store/players.js
 *
 * Module-level in-memory store for Cricket Scouter.
 */

let _players = [];
let _countryMap = new Map();
let _teamMap = new Map();
let _detailCache = new Map();
let _isHydrated = false;

import { writeCache } from '../utils/idb';

export function setStore({ players, countries, teams }) {
  _players = players || [];

  _countryMap.clear();
  (countries || []).forEach((c) => {
    if (c.id != null)  _countryMap.set(c.id, c);
    if (c.name)        _countryMap.set(c.name.toLowerCase(), c);
  });

  _teamMap.clear();
  (teams || []).forEach((t) => {
    if (t.id != null) _teamMap.set(t.id, t);
  });

  _isHydrated = true;
}

export const isHydrated = () => _isHydrated;
export const getStore = () => _players;

export const lookupCountry = (idOrName) => {
  if (typeof idOrName === 'string') {
    return _countryMap.get(idOrName.toLowerCase()) ?? null;
  }
  return _countryMap.get(idOrName) ?? null;
};

export const lookupTeam = (teamId) => _teamMap.get(teamId) ?? null;

export function setDetailCache(id, player) {
  _detailCache.set(id, player);
  writeCache(`player_detail_${id}`, player).catch(() => {});
}

export function getDetailCache(id) {
  return _detailCache.get(id) ?? null;
}

export function getCountryOptions() {
  const counts = new Map();
  for (const p of _players) {
    if (p.country_id == null) continue;
    const entry = counts.get(p.country_id);
    if (entry) {
      entry.count += 1;
    } else {
      const country = lookupCountry(p.country_id);
      counts.set(p.country_id, {
        name:  country?.name || `Country ${p.country_id}`,
        count: 1,
      });
    }
  }

  return [...counts.entries()]
    .map(([countryId, { name, count }]) => ({ countryId, name, playerCount: count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function deriveSlice({
  search = '',
  countryId,
  positionId,
  tournamentType,
  sort = 'id',
  order = 'asc',
  page = 1,
  perPage = 12,
} = {}) {
  let result = _players;

  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (p) => (p.fullname || '').toLowerCase().includes(term)
    );
  }

  if (countryId != null && countryId !== '') {
    const cids = String(countryId).split(',').map(Number);
    result = result.filter((p) => cids.includes(p.country_id));
  }

  if (positionId != null && positionId !== '') {
    const pid = Number(positionId);
    result = result.filter((p) => p.position?.id === pid);
  }

  if (tournamentType != null && tournamentType !== '') {
    const type = tournamentType.toUpperCase();
    result = result.filter((p) => {
      // sanitizePlayerLite stores this as p.formats
      if (!p.formats || p.formats.length === 0) return false;
      return p.formats.some(f => f.toUpperCase() === type);
    });
  }

  result = [...result].sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    if (order === 'asc') return valA < valB ? -1 : valA > valB ? 1 : 0;
    return valA > valB ? -1 : valA < valB ? 1 : 0;
  });

  const total = result.length;
  const start  = (page - 1) * perPage;
  const sliced = result.slice(start, start + perPage);

  return {
    players: sliced,
    total,
    isEmpty: total === 0,
  };
}
