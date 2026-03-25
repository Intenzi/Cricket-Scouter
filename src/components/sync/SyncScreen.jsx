/**
 * components/sync/SyncScreen.jsx
 *
 * Full-screen animation ritual for database synchronization.
 * Shown roughly every hour to verify data integrity and show rotating facts.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fetchAllPlayers } from '../../api/players';
import { fetchCountries, fetchTeams } from '../../api/bootstrap';
import { sanitizePlayerLite, sanitizeCountry, sanitizeTeam } from '../../utils/sanitize';
import { readCache, writeCache } from '../../utils/idb';
import { setStore } from '../../store/players';
import { CRICKET_FACTS, BOOTSTRAP_CACHE_KEY, BOOTSTRAP_CACHE_TTL, LOADER_CACHE_KEY } from '../../utils/constants';
import '../../styles/components/sync-screen.css';

/**
 * SyncScreen component — handles both fresh fetches and ritual simulations.
 */
const SyncScreen = ({ onDone }) => {
  const [phase, setPhase] = useState('sync'); // 'sync' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [percent, setPercent] = useState(0);
  const [task, setTask] = useState('Establishing Secure Handshake...');
  const [currentFact, setCurrentFact] = useState(0);
  const factIntervalRef = useRef(null);

  useEffect(() => {
    // Basic simulation start
    const int = setInterval(() => {
      setPercent(prev => (prev < 30 ? prev + 1 : prev));
    }, 100);
    return () => clearInterval(int);
  }, []);

  const factRotation = useCallback(() => {
    setCurrentFact((prev) => (prev + 1) % CRICKET_FACTS.length);
  }, []);

  const stopFactRotation = () => {
    if (factIntervalRef.current) {
      clearInterval(factIntervalRef.current);
      factIntervalRef.current = null;
    }
  };

  useEffect(() => {
    factIntervalRef.current = setInterval(factRotation, 5000);
    return () => stopFactRotation();
  }, [factRotation]);

  useEffect(() => {
    async function runRitual() {
      try {
        const cached = await readCache(BOOTSTRAP_CACHE_KEY);
        const isDataFresh = cached && cached.players && (Date.now() - cached.fetchedAt < BOOTSTRAP_CACHE_TTL);

        if (isDataFresh) {
          /** --- Ritual Only: Data is fresh, just do the 1.2s cool animation --- */
          setTask('Record Verified - Finalizing Handshake...');
          
          // Fast-forward simulation
          let p = 30;
          const snapInt = setInterval(() => {
            p += 5;
            setPercent(prev => Math.min(prev + 5, 100));
            if (p >= 100) {
              clearInterval(snapInt);
              setTask('Integrity Check Complete.');
              
              // Record the ritual seen
              writeCache(LOADER_CACHE_KEY, { lastSeen: Date.now() });
              
              setStore({
                players: cached.players,
                countries: cached.countries,
                teams: cached.teams,
              });
              
              setTimeout(onDone, 800);
            }
          }, 40);
          return;
        }

        /** --- Full Sync: Stale data or first load, do the API fetch --- */
        setTask('Fetching Global Player Registry (API)...');
        
        const [playerRes, countryRes, teamRes] = await Promise.allSettled([
          fetchAllPlayers(),
          fetchCountries(),
          fetchTeams(),
        ]);

        if (playerRes.status === 'rejected') {
          throw playerRes.reason;
        }

        const rawPlayers = playerRes.value || [];
        const rawCountries = countryRes.status === 'fulfilled' ? countryRes.value : [];
        const rawTeams = teamRes.status === 'fulfilled' ? teamRes.value : [];

        const players = rawPlayers.map(sanitizePlayerLite).filter(Boolean);
        const countries = rawCountries.map(sanitizeCountry).filter(Boolean);
        const teams = rawTeams.map(sanitizeTeam).filter(Boolean);

        setStore({ players, countries, teams });

        await writeCache(BOOTSTRAP_CACHE_KEY, {
          players,
          countries,
          teams,
          fetchedAt: Date.now(),
        });
        
        // Record the ritual seen
        await writeCache(LOADER_CACHE_KEY, { lastSeen: Date.now() });

        setPercent(100);
        setTask('Sync Complete - Registry Updated.');
        setTimeout(onDone, 800);

      } catch (err) {
        console.error('[SyncScreen] Ritual failed:', err);
        stopFactRotation();
        setErrorMsg('Scouting sync failed. Check connection or API status.');
        setPhase('error');
      }
    }

    runRitual();
  }, [onDone]);

  if (phase === 'error') {
    return (
      <div className="sync-screen sync-screen--error">
        <h1 className="sync-screen__title">Sync Interrupted</h1>
        <p className="sync-screen__fact">{errorMsg}</p>
        <button className="sync-screen__retry-btn" onClick={() => window.location.reload()}>
          RETRY SCOUTING
        </button>
      </div>
    );
  }

  return (
    <div className="sync-screen" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
      <div className="sync-screen__header-ghost">
        <div className="sync-screen__header-logo">CRICKET SCOUTER</div>
        <div className="sync-screen__header-nav">
          <span>Database</span>
          <span>Players</span>
          <span>Analysis</span>
          <span>Teams</span>
        </div>
      </div>

      <div className="sync-screen__coord">
        SYS // L-09<br/>EST. 1984
      </div>

      <div className="sync-screen__watermark" aria-hidden="true">
        DATA INTEGRITY UNIT
      </div>

      <div className="sync-screen__card">
        <div className="sync-screen__silhouette">
          <svg className="sync-screen__silhouette-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.243 2 7 4.243 7 7C7 9.757 9.243 12 12 12C14.757 12 17 9.757 17 7C17 4.243 14.757 2 12 2ZM12 14C8.686 14 2 15.657 2 19V22H22V19C22 15.657 15.314 14 12 14Z" />
          </svg>
          <div className="sync-screen__data-stream-container">
            <div className="data-point">010110</div>
            <div className="data-point delay-75">FF023A</div>
            <div className="data-point delay-150">AVG:54.2</div>
            <div className="data-point delay-300">SR:142</div>
            <div className="data-point delay-500">60K_RECORDS</div>
            <div className="data-point delay-700">COORD_X7</div>
          </div>
        </div>

        <div className="sync-screen__status">
          <div className="sync-screen__meta">
            <div className="sync-screen__meta-row">
              <span className="sync-screen__meta-label">Status</span>
              <span className="sync-screen__meta-value">ENCRYPTED STREAM</span>
            </div>
            <div className="sync-screen__meta-row">
              <span className="sync-screen__meta-label">Target Array</span>
              <span className="sync-screen__meta-value sync-screen__meta-value--dim">Global_Registry_V2.4</span>
            </div>
            <div className="sync-screen__meta-row">
              <span className="sync-screen__meta-label">Source Provider</span>
              <span className="sync-screen__meta-value sync-screen__meta-value--dim">
                <span className="sync-screen__status-dot"></span>
                SportMonks API v2.0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="sync-screen__main-status">
        <h1 className="sync-screen__title">
          SYNCHRONIZING GLOBAL PLAYER DATABASE (60,000+ RECORDS)...
        </h1>
        <div className="sync-screen__handshake">
          <span className="sync-screen__pulse-dot"></span>
          {task}
          <span className="sync-screen__pulse-dot"></span>
        </div>
      </div>

      <div className="sync-screen__fact-box">
        <p className="sync-screen__fact-label">Scouter Insight // {currentFact.toString().padStart(3, '0')}</p>
        <p className="sync-screen__fact-text">"{CRICKET_FACTS[currentFact]}"</p>
      </div>

      <div className="sync-screen__foot-progress">
        <div className="sync-screen__progress-header">
          <div className="sync-screen__task">
            <span className="sync-screen__task-label">Current Task</span>
            <span className="sync-screen__task-value">Synchronizing Global Player Registry...</span>
          </div>
          <div className="sync-screen__percent-container">
            <span className="sync-screen__percent">{percent}%</span>
            <span className="sync-screen__task-label">Complete</span>
          </div>
        </div>
        <div className="sync-screen__progress">
          <div 
            className="sync-screen__progress-bar" 
            style={{ width: `${percent}%` }}
          >
            <div className="sync-screen__progress-glow"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncScreen;
