/**
 * components/listing/PlayerCard.jsx
 *
 * A single player card for the players listing grid.
 * Entire card is an <a> (wrapped in <article>) - no nested interactive elements.
 *
 * Features:
 *   - Greyscale image by default, full colour on hover (CSS)
 *   - onerror fallback: swaps to a local SVG placeholder
 *   - Position badge pill
 *   - Country flag image + name
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/formatters';
import '../../styles/components/player-card.css';

/**
 * PlayerCard component.
 *
 * @param {object}      props
 * @param {object}      props.player       - Sanitized player object.
 * @param {object|null} [props.country]    - Corresponding country object (for flag + name).
 */
const PlayerCard = ({ player, country }) => {
  const [imgError, setImgError] = useState(false);

  const positionName = player.position?.name || 'Unknown';
  const countryName  = country?.name        || 'Unknown';
  const flagUrl      = country?.image_path  || null;
  const altText      = `${player.fullname}, ${positionName}`;
  const countryIdCode = countryName.slice(0, 3).toUpperCase();
  const playerDisplayId = `#${countryIdCode}-${player.id || '???'}`;

  /**
   * Handles broken image paths from the CDN.
   * Sets a local error state that triggers the placeholder fallback.
   */
  const handleImageError = () => setImgError(true);

  // We only show mock stats because we don't have real data to match the mockup exactly
  // yet we still want the "Scouting Vibe". 

  const isPlaceholder = player.image_path?.includes('placeholder');

  return (
    <Link
      to={`/players/${slugify(player.fullname)}-${player.id}`}
      aria-label={`View profile for ${player.fullname}`}
      className="player-card"
    >
      {/* --- Image --- */}
      <div className="player-card__image-wrap">
        {!imgError && player.image_path && !isPlaceholder ? (
          <img
            className="player-card__image"
            src={player.image_path}
            alt={altText}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="player-card__image-placeholder" aria-hidden="true">
            {/* Using absolute path relative to public folder for reliability */}
            <img src="/default-player.png" alt="Default Player" className="player-card__default-img" />
          </div>
        )}
        <div className="player-card__id">{playerDisplayId}</div>
      </div>

      {/* --- Body --- */}
      <div className="player-card__body">
        <h3 className="player-card__name font-tungsten">{player.fullname}</h3>
        
        <div className="player-card__meta">
          <span className="player-card__position font-tungsten">{positionName}</span>
          <div className="player-card__country">
            {flagUrl && (
              <img
                className="player-card__flag"
                src={flagUrl}
                alt={`${countryName} flag`}
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span className="player-card__country-text">{countryName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlayerCard;
