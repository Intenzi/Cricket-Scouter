/**
 * components/detail/PlayerHero.jsx
 *
 * Left column of the player detail page.
 * Shows: player image (greyscale → colour on hover), full name, position badge,
 * country flag + name, bio grid, and scout summary.
 *
 * Phase 1 data (instant from store) - no career data needed here.
 */

import React, { useState } from 'react';
import { formatDate, calcAge, formatStyle } from '../../utils/formatters';
import { SCOUT_SUMMARIES } from '../../utils/constants';
import '../../styles/components/player-detail.css';

/**
 * PlayerHero component — left column of the detail page.
 *
 * @param {object}      props
 * @param {object}      props.player   - The player record.
 * @param {object|null} props.country  - Corresponding country for flag/name.
 */
const PlayerHero = ({ player, country }) => {
  const [imgError, setImgError] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const positionName = player.position?.name || 'Unknown';
  const countryName  = country?.name        || 'Unknown';
  const flagUrl      = country?.image_path  || null;
  const age          = calcAge(player.dateofbirth);
  const scoutText    = SCOUT_SUMMARIES[positionName] || SCOUT_SUMMARIES.Unknown;

  const genderLabel = player.gender === 'm' ? 'Male' : player.gender === 'f' ? 'Female' : '–';
  const isPlaceholder = player.image_path?.includes('placeholder');

  const handleShare = () => {
    const shareUrl = window.location.href;
    
    const triggerCopyEffect = () => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    };

    if (navigator.share) {
      navigator.share({
        title: player.fullname,
        text: `Check out ${player.fullname}'s scouting profile on Cricket Scouter!`,
        url: shareUrl,
      })
      .then(triggerCopyEffect)
      .catch((err) => {
        // User cancelling the share sheet is caught here; we shouldn't show "Copied" in that case
        if (err.name !== 'AbortError' && import.meta.env.DEV) {
          console.error('[handleShare] Share failed:', err);
        }
      });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(triggerCopyEffect)
        .catch((err) => {
          if (import.meta.env.DEV) {
            console.error('[handleShare] Clipboard copy failed:', err);
          }
        });
    } else {
      if (import.meta.env.DEV) {
        console.warn('[handleShare] Sharing and Clipboard API are both unavailable.');
      }
    }
  };

  return (
    <div className="player-detail__left">
      {/* --- Player image --- */}
      <div className="player-hero__image-wrap">
        {!imgError && player.image_path && !isPlaceholder ? (
          <img
            className="player-hero__image"
            src={player.image_path}
            alt={`${player.fullname}, ${positionName}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="player-hero__image-placeholder" aria-hidden="true">
            <img src="/default-player.png" alt="Default Player" className="player-hero__default-img" />
          </div>
        )}
      </div>

      {/* --- Name --- */}
      <div className="player-hero__header">
        <h1 className="player-hero__name font-tungsten">{player.fullname}</h1>
        <div className="player-hero__actions">
          <div className="player-hero__share-container">
            <button 
              className="player-hero__action-btn" 
              onClick={handleShare}
              aria-label="Share Profile"
              title="Share Profile"
            >
              <span className="material-symbols-outlined">share</span>
            </button>
            {showCopied && <span className="player-hero__copied-badge">Copied!</span>}
          </div>
        </div>
      </div>

      {/* --- Position + country badges --- */}
      <div className="player-hero__badges">
        <span className="player-hero__position-badge" aria-label={`Position: ${positionName}`}>
          {positionName}
        </span>

        <div className="player-hero__country">
          {flagUrl && (
            <img
              className="player-hero__flag"
              src={flagUrl}
              alt={`${countryName} flag`}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span>{countryName}</span>
        </div>
      </div>

      {/* --- Bio grid --- */}
      <div className="player-bio" aria-label="Player biography">
        <div className="player-bio__item">
          <span className="player-bio__label">Age</span>
          <span className="player-bio__value">{age ?? '–'}</span>
        </div>
        <div className="player-bio__item">
          <span className="player-bio__label">Born</span>
          <span className="player-bio__value">{formatDate(player.dateofbirth)}</span>
        </div>
        <div className="player-bio__item">
          <span className="player-bio__label">Batting</span>
          <span className="player-bio__value">{formatStyle(player.battingstyle)}</span>
        </div>
        <div className="player-bio__item">
          <span className="player-bio__label">Bowling</span>
          <span className="player-bio__value">{formatStyle(player.bowlingstyle)}</span>
        </div>
        <div className="player-bio__item">
          <span className="player-bio__label">Gender</span>
          <span className="player-bio__value">{genderLabel}</span>
        </div>
      </div>

      {/* --- Scout summary --- */}
      <div className="scout-summary" aria-label="Scout report">
        <p className="scout-summary__title">Scout Report</p>
        <p className="scout-summary__text">{scoutText}</p>
      </div>

      {/* --- Last updated footer --- */}
      <div className="player-hero__footer" aria-label="Data integrity information">
        <span className="player-hero__integrity-label">Last Scan:</span>
        <span className="player-hero__integrity-value">{formatDate(player.updated_at)}</span>
      </div>
    </div>
  );
};

export default PlayerHero;
