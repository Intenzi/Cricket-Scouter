/**
 * components/detail/StatsBanner.jsx
 *
 * Four-tile key stats banner at the top of the player detail right column.
 * Aggregates totals across all career formats.
 *
 * Tiles:
 *   1. Matches (total across all formats)
 *   2. Runs (batters/allrounders) or Wickets (bowlers/keepers)
 *   3. Batting average (recalculated, not averaged)
 *   4. Strike rate (batters) or Economy (bowlers/keepers)
 *
 * Shows skeleton tiles when `isLoading` is true.
 *
 * @param {object}   props
 * @param {object[]} props.careerGroups - Aggregated career rows from groupCareer().
 * @param {boolean}  [props.isLoading]  - Show skeleton tiles while career data loads.
 * @param {string}   props.positionName - Used to adapt tile 2 label.
 */

import React from 'react';
import '../../styles/components/stats-banner.css';

/** Position names that are spinner-bowling-primary */
const BOWLING_POSITIONS = new Set(['Bowler']);

/**
 * StatsBanner component.
 *
 * @param {object}   props
 * @param {object[]} props.careerGroups - From groupCareer().
 * @param {boolean}  [props.isLoading]  - Whether career data is still loading.
 * @param {string}   props.positionName - Used to decide which metric tile 2 shows.
 */
const StatsBanner = ({ careerGroups, isLoading = false, positionName = '' }) => {
  if (isLoading) {
    return (
      <div className="stats-banner" aria-busy="true" aria-label="Loading career statistics">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="stats-tile stats-tile--skeleton">
            <div className="stats-tile__value skeleton-shimmer" />
            <div className="stats-tile__label skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  // Aggregate totals across all format groups
  const totalMatches  = careerGroups.reduce((s, g) => s + (g.matches || 0), 0);
  const totalRuns     = careerGroups.reduce((s, g) => s + (g.runs || 0), 0);
  const totalWickets  = careerGroups.reduce((s, g) => s + (g.wickets || 0), 0);

  // Recalculate batting average across ALL groups combined
  const totalInnings  = careerGroups.reduce((s, g) => s + (g.innings || 0), 0);
  const totalNO       = careerGroups.reduce((s, g) => s + (g.not_outs || 0), 0);
  const dismissals    = totalInnings - totalNO;
  const battingAvg    = dismissals > 0
    ? (totalRuns / dismissals).toFixed(0)
    : totalInnings > 0 ? '∞' : '–';

  const totalBalls    = careerGroups.reduce((s, g) => s + (g.balls_faced || 0), 0);
  const batSR         = totalBalls > 0
    ? ((totalRuns / totalBalls) * 100).toFixed(1)
    : '–';

  const totalOvers    = careerGroups.reduce((s, g) => s + (g.overs || 0), 0);
  const totalConceded = careerGroups.reduce((s, g) => s + (g.runs_conceded || 0), 0);
  const economy       = totalOvers > 0
    ? (totalConceded / totalOvers).toFixed(2)
    : '–';

  // Role detection: Bowlers and All-Rounders (all variant names) see the bowling layout
  const isBowlRole = positionName.includes('Bowler') || positionName.includes('All');

  const tiles = isBowlRole
    ? [
        { value: totalMatches  || '–', label: 'Matches' },
        { value: totalWickets  || '–', label: 'Wickets' },
        { value: battingAvg,           label: 'Bat Avg' },
        { value: economy,              label: 'Economy' },
      ]
    : [
        { value: totalMatches  || '–', label: 'Matches' },
        { value: totalRuns     || '–', label: 'Runs' },
        { value: battingAvg,           label: 'Bat Avg' },
        { value: batSR,                label: 'Bat S/R' },
      ];

  return (
    <div className="stats-banner" aria-label="Career statistics summary">
      {tiles.map((tile) => (
        <div key={tile.label} className="stats-tile">
          <span className="stats-tile__value">{tile.value}</span>
          <span className="stats-tile__label">{tile.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsBanner;
