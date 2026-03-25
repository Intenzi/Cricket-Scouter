/**
 * pages/PlayerDetailPage.jsx
 *
 * Player detail page - two-phase progressive rendering.
 *
 * Phase 1 (instant, no loading indicator):
 *   Base player data from the in-memory store.
 *   Renders: image, name, badges, bio grid, scout summary.
 *
 * Phase 2 (progressive enrichment):
 *   Career data from GET /players/{id}?include=career via usePlayerDetail.
 *   While loading: skeleton tiles in stats area.
 *   When complete: stats banner, career table, team history.
 *
 * Back navigation uses useNavigate() with a fallback to /players to handle direct landing.
 */

import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerDetail } from '../hooks/usePlayerDetail';
import { lookupCountry } from '../store/players';
import { groupCareer, slugify } from '../utils/formatters';
import PlayerHero from '../components/detail/PlayerHero';
import StatsBanner from '../components/detail/StatsBanner';
import CareerTable from '../components/detail/CareerTable';
import TeamHistory from '../components/detail/TeamHistory';
import ScoutingRadar from '../components/detail/ScoutingRadar';
import ErrorState from '../components/common/ErrorState';
import NotFoundPage from './NotFoundPage';
import '../styles/components/player-detail.css';
import '../styles/components/stats-banner.css';
import '../styles/components/career-table.css';
import '../styles/components/scouting-radar.css';
import '../styles/components/skeleton.css';
import '../styles/components/empty-error.css';

/**
 * PlayerDetailPage component - two-phase progressive rendering.
 */
const PlayerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Extract ID and slug from slug-id format if present
  const [urlSlug, playerId] = id.includes('-') 
    ? [id.substring(0, id.lastIndexOf('-')), id.split('-').pop()]
    : ['', id];

  const { player, careerLoading, error } = usePlayerDetail(playerId);
  const headingRef = useRef(null);

  /**
   * Handle verification: If there's a name slug in the URL, it MUST match the player's name slug.
   * This prevents URLs like /players/fake-name-123 from loading player 123.
   */
  const trueSlug = player?.fullname ? slugify(player.fullname) : '';
  const isInvalidUrl = urlSlug && trueSlug && urlSlug !== trueSlug;

  const handleBack = () => {
    // If identifying direct landing or came from sync, navigate to /players
    if (window.history.length <= 2) {
      navigate('/players');
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (player?.fullname) {
      const title = `${player.fullname} — Cricket Scouter Scouting Profile`;
      document.title = title;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = `View the professional scouting profile of ${player.fullname}. Includes career stats, performance analytics, and regional data from ${player.country || 'Global'} records.`;
      
      // Update OG title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = title;

      // Focus management
      headingRef.current?.focus();
    } else {
      document.title = 'Player — Cricket Scouter';
    }
  }, [player]);

  /** Case 1: URL Mismatch (e.g. wrong-name-123) or real 404 */
  if (isInvalidUrl || (error && error.status === 404)) {
    return <NotFoundPage />;
  }

  /** Case 2: Other errors (network / 401) */
  if (error && !player) {
    const type = error.status === 401 ? 'auth' : 'network';

    return (
      <ErrorState
        type={type}
        onAction={handleBack}
        actionLabel="← Back to directory"
      />
    );
  }

  /** No player in store and still loading (deep-link, store not hydrated) */
  if (!player) {
    return (
      <div className="player-detail" aria-busy="true" aria-label="Loading player profile">
        <div className="player-detail__left">
          <div className="skeleton-shimmer player-detail__skeleton-img" />
        </div>
        <div className="player-detail__right player-detail__right--loading">
          <div className="stats-banner">
            {[1,2,3,4].map(i => (
              <div key={i} className="stats-tile stats-tile--skeleton">
                <div className="stats-tile__value skeleton-shimmer" />
                <div className="stats-tile__label skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const country      = lookupCountry(player.country_id);
  const careerGroups = groupCareer(player.career || []);

  return (
    <>
      {/* Back button - full-width row above both columns */}
      <button
        className="player-detail__back"
        onClick={handleBack}
        type="button"
        aria-label="Back to player directory"
      >
        ← Back to Directory
      </button>

      <div className="player-detail">
        {/* --- Left column: Phase 1 (instant) --- */}
        <PlayerHero player={player} country={country} />

        {/* --- Right column: Phase 2 (progressive) --- */}
        <div className="player-detail__right">
          <StatsBanner
            careerGroups={careerGroups}
            isLoading={careerLoading}
            positionName={player.position?.name || ''}
          />

          <CareerTable
            careerGroups={careerGroups}
            isLoading={careerLoading}
          />

          <TeamHistory
            teams={player.teams || []}
            isLoading={careerLoading}
          />

          <ScoutingRadar
            careerGroups={careerGroups}
            positionName={player.position?.name || 'Unknown'}
          />
        </div>
      </div>
    </>
  );
};

export default PlayerDetailPage;
