/**
 * hooks/usePlayerDetail.js
 *
 * Manages fetching and progressive enrichment for a single player's detail page.
 *
 * Two-phase render:
 *   Phase 1 — Instant: base player data from the in-memory store.
 *   Phase 2 — Progressive: career data fetched from GET /players/{id}?include=career.
 *
 * The hook also manages the detail cache so back-navigation is instant.
 */

import { useState, useEffect, useRef } from 'react';
import { fetchPlayerById } from '../api/players';
import { readCache } from '../utils/idb';
import {
  getStore,
  getDetailCache,
  setDetailCache,
} from '../store/players';
import { sanitizePlayer } from '../utils/sanitize';
import { DETAIL_CACHE_TTL } from '../utils/constants';
import { writeCache } from '../utils/idb';

/**
 * Fetches and progressively enriches a player record.
 */
export function usePlayerDetail(id) {
  const numericId = Number(id);

  // Phase 1: start from in-memory cache/store instantly
  const fromCache = getDetailCache(numericId);
  const fromStore = !fromCache ? (getStore().find((p) => p.id === numericId) || null) : null;
  const initialPlayer = fromCache || fromStore;

  const [player, setPlayer] = useState(initialPlayer);
  const [careerLoading, setCareerLoading] = useState(numericId && !fromCache);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const checkCacheAndFetch = async () => {
      // 1. Validation check
      if (!numericId || !Number.isFinite(numericId)) {
        if (isMounted.current) {
          setError(new Error('Invalid player ID'));
          setCareerLoading(false);
        }
        return;
      }

      // 2. Sync memory check
      const currentSync = getDetailCache(numericId);
      if (currentSync) {
        setPlayer(currentSync);
        setCareerLoading(false);
        return;
      }

      // 2. Async check (IndexedDB)
      try {
        const cached = await readCache(`player_detail_${numericId}`);
        if (cached && cached.fetchedAt && Date.now() - cached.fetchedAt < DETAIL_CACHE_TTL && isMounted.current) {
          setPlayer(cached.data);
          setCareerLoading(false);
          setDetailCache(numericId, cached.data);
          return;
        }
      } catch {
        // Continue to fetch if IDB fails
      }

      // 3. Fallback to base player (instant but partial)
      const base = getStore().find((p) => p.id === numericId) || null;
      if (isMounted.current) {
        setPlayer(base);
        setCareerLoading(true);
        setError(null);
      }

      // 4. Final fetch Phase 2
      try {
        const raw = await fetchPlayerById(numericId);
        if (!isMounted.current) return;
        const enriched = sanitizePlayer(raw);
        setDetailCache(numericId, enriched);
        setPlayer(enriched);
        setCareerLoading(false);
        
        // Write to IDB with timestamp for 2h TTL
        await writeCache(`player_detail_${numericId}`, {
          data: enriched,
          fetchedAt: Date.now(),
        });
      } catch (err) {
        if (!isMounted.current) return;
        setError(err);
        setCareerLoading(false);
      }
    };

    checkCacheAndFetch();
  }, [numericId]);

  return { player, careerLoading, error };
}
