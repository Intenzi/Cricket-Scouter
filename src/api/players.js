/**
 * api/players.js
 *
 * Player-related API functions for Cricket Scouter.
 *
 * Exports:
 *   fetchAllPlayers()    - GET /players (no includes, full dump)
 *   fetchPlayerById(id)  - GET /players/{id}?include=career (detail + career)
 *
 * Both functions use the shared api/client.js wrapper which handles:
 *   token injection, timeout, error normalization, and single retry.
 */

import { client } from './client';

/**
 * Fetches the complete player list including career data.
 * This is a heavy request (~42MB) that runs once during boot.
 *
 * @returns {Promise<object[]>} Raw data array of player records.
 */
export async function fetchAllPlayers() {
  const result = await client('/players?include=career');
  return result?.data || [];
}

/**
 * Fetches a single player's enriched record including career data.
 * Used on the player detail page (Phase 2 progressive enrichment).
 *
 * Guard clause: if `id` is missing, not a finite integer when coerced,
 * or <= 0 - throws immediately without making a network call.
 *
 * @param {string|number} id - Player ID from the URL route param.
 * @returns {Promise<object|null>} Raw single player object with career data, or null.
 * @throws {Error} If the id is missing or invalid.
 */
export async function fetchPlayerById(id) {
  const numericId = Number(id);

  if (!id || !Number.isFinite(numericId) || numericId <= 0) {
    throw new Error(`Invalid player ID: ${id}`);
  }

  const result = await client(`/players/${numericId}?include=career,teams`);
  return result?.data || null;
}
