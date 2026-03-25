/**
 * components/listing/PlayerGrid.jsx
 *
 * Responsive CSS-grid container for player cards.
 * Shows SkeletonCards when the store is not yet hydrated (rare cold-start).
 * Shows EmptyState when total === 0 after filters.
 * Otherwise renders a PlayerCard per player.
 *
 * @param {object}   props
 * @param {object[]} props.players        - Current page player records.
 * @param {number}   props.total          - Total matching records (all pages).
 * @param {boolean}  props.isEmpty        - True when filter returns no results.
 * @param {boolean}  [props.isLoading]    - True on cold start (show skeletons).
 * @param {Function} props.onClearFilters - Passed to EmptyState CTA.
 */

import React from 'react';
import PlayerCard from './PlayerCard';
import SkeletonCard from './SkeletonCard';
import EmptyState from '../common/EmptyState';
import '../../styles/components/player-grid.css';
import { lookupCountry } from '../../store/players';
import { PER_PAGE } from '../../utils/constants';

/** Number of skeleton cards to show during loading */
const SKELETON_COUNT = PER_PAGE;

/**
 * PlayerGrid component.
 *
 * @param {object}   props
 * @param {object[]} props.players        - Sanitized player records for the current page.
 * @param {number}   props.total          - Total filtered count.
 * @param {boolean}  props.isEmpty        - Whether the filter produced zero results.
 * @param {boolean}  [props.isLoading]    - Shows skeleton cards when true.
 * @param {Function} props.onClearFilters - Callback to clear all active filters.
 */
const PlayerGrid = ({ players, total, isEmpty, isLoading = false, onClearFilters }) => {
  if (isLoading) {
    return (
      <div
        className="player-grid"
        aria-busy="true"
        aria-label="Loading player data"
      >
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        onAction={onClearFilters}
        actionLabel="Clear all filters"
      />
    );
  }

  return (
    <div
      className="player-grid"
      aria-label={`${total} players found`}
    >
      {players.map((player) => {
        const country = lookupCountry(player.country_id);
        return (
          <PlayerCard
            key={player.id}
            player={player}
            country={country}
          />
        );
      })}
    </div>
  );
};

export default PlayerGrid;
