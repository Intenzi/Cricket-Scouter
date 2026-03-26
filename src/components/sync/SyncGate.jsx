/**
 * components/sync/SyncGate.jsx
 *
 * Smart gate that decides whether to show the full-screen SyncScreen loader
 * or immediately render the application.
 */

import React, { useState, useEffect, useCallback } from 'react';
import App from '../../App';
import SyncScreen from './SyncScreen';
import { readCache } from '../../utils/idb';
import { setStore } from '../../store/players';
import { BOOTSTRAP_CACHE_KEY, LOADER_CACHE_KEY, LOADER_TTL } from '../../utils/constants';

const SyncGate = () => {
  const [hydrated, setHydrated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkHydration() {
      try {
        const cached = await readCache(BOOTSTRAP_CACHE_KEY);
        const lMeta  = await readCache(LOADER_CACHE_KEY);
        
        const path = window.location.pathname;
        const isDetailPage = path.includes('/players/') && path !== '/players';
        
        if (cached && cached.players) {
          const loaderFresh = lMeta && (Date.now() - lMeta.lastSeen < LOADER_TTL);
          
          /**
           * Smart Bypass:
           * 1. We ALWAYS bypass on DETAIL pages if data exists (they have their own skeletons).
           * 2. We bypass on DIRECTORY if the "cool ritual" was seen within the last 1 hour.
           */
          if (isDetailPage || loaderFresh) {
            setStore({
              players: cached.players || [],
              countries: cached.countries || [],
              teams: cached.teams || [],
            });
            setHydrated(true);
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[SyncGate] Cache read failed, proceeding to full sync.', err);
        }
      } finally {
        setChecking(false);
      }
    }
    
    checkHydration();
  }, []);

  const handleDone = useCallback(() => {
    setHydrated(true);
  }, []);

  if (hydrated) return <App />;
  if (checking) return null; // Brief blank state while checking IDB (usually < 10ms)

  return <SyncScreen onDone={handleDone} />;
};

export default SyncGate;
