/**
 * components/detail/TeamHistory.jsx
 *
 * Displays any team associations derivable from the career data.
 * The API's {include=teams} on a player is unconfirmed, so this component
 * works from what it can derive: unique format types as a proxy for activity.
 *
 * If no career data: renders nothing (hidden entirely).
 *
 * @param {object}   props
 * @param {object[]} props.careerGroups - Aggregated career rows from groupCareer().
 * @param {boolean}  [props.isLoading]  - Whether Phase 2 data is still loading.
 */

import React from 'react';
import '../../styles/components/team-history.css';
import '../../styles/components/skeleton.css';

/**
 * TeamHistory component.
 * Shows format types played as a tag list (proxy for career engagement).
 *
 * @param {object}   props
 * @param {object[]} props.careerGroups - From groupCareer().
 * @param {boolean}  [props.isLoading]  - True while career data is loading.
 */
const TeamHistory = ({ teams = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <section className="team-history" aria-busy="true">
        <p className="team-history__title">Teams & Franchises</p>
        <div className="team-history__list">
          {['w-60', 'w-48', 'w-56', 'w-40'].map((wClass, i) => (
            <div
              key={i}
              className={`skeleton-shimmer team-history__skeleton-bar team-history__skeleton-${wClass}`}
            />
          ))}
        </div>
      </section>
    );
  }

  // Deduplicate by name and sort: national teams first, then alphabetical
  const uniqueTeams = Array.from(
    new Map(teams.map((t) => [t.name, t])).values()
  ).sort((a, b) => {
    if (a.national_team && !b.national_team) return -1;
    if (!a.national_team && b.national_team) return 1;
    return a.name.localeCompare(b.name);
  });

  if (uniqueTeams.length === 0) return null;

  return (
    <section className="team-history" aria-label="Teams represented">
      <p className="team-history__title">Teams & Franchises</p>
      <div className="team-history__list">
        {uniqueTeams.map((team) => (
          <div
            key={team.name}
            className={`team-history__tag ${
              team.national_team ? 'team-history__tag--national' : ''
            }`}
          >
            {team.name}
            {team.national_team && (
              <span className="team-history__national-badge" title="National Team">★</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamHistory;
