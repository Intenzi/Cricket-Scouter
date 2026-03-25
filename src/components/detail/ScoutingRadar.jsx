/**
 * components/detail/ScoutingRadar.jsx
 *
 * Visual "Scouting Radar" (Spider Chart) replacing the previous placeholder.
 * Normalizes career statistics into 5-6 standardized skill dimensions:
 * Experience, Runs/Wickets, Average, Strike Rate, Control.
 */

import React from 'react';
import '../../styles/components/scouting-radar.css';

/**
 * Normalization targets for radar axes.
 * Scores are 0-100 based on these "elite" thresholds.
 */
const TARGETS = {
  matches: 300,
  runs: 10000,
  batAvg: 50,
  batSR: 150,
  wickets: 400,
  economy: 4.5, // Inverted: <4.5 is 100%, 12 is 0%
};

/**
 * ScoutingRadar component.
 *
 * @param {object}   props
 * @param {object[]} props.careerGroups - Aggregated career stats.
 * @param {string}   props.positionName - Player position (Bowler, Batsman, etc.)
 */
const ScoutingRadar = ({ careerGroups = [], positionName = 'Unknown' }) => {
  if (careerGroups.length === 0) return null;

  // Aggregate global totals across all formats
  const totals = careerGroups.reduce((acc, g) => ({
    matches: acc.matches + (g.matches || 0),
    runs: acc.runs + (g.runs || 0),
    wickets: acc.wickets + (g.wickets || 0),
    balls: acc.balls + (g.balls_faced || 0),
    overs: acc.overs + (g.overs || 0),
    runs_conceded: acc.runs_conceded + (g.runs_conceded || 0),
    notOdds: acc.notOdds + (g.not_outs || 0),
    innings: acc.innings + (g.innings || 0),
  }), { matches: 0, runs: 0, wickets: 0, balls: 0, overs: 0, runs_conceded: 0, notOdds: 0, innings: 0 });

  const dismissals = Math.max(1, totals.innings - totals.notOdds);
  const batAvg     = totals.runs / dismissals;
  const batSR      = totals.balls > 0 ? (totals.runs / totals.balls) * 100 : 0;
  const economy    = totals.overs > 0 ? totals.runs_conceded / totals.overs : 0;

  // Calculate scores (0-100)
  const isBowlerRole = positionName.includes('Bowler') || positionName.includes('All');

  const scores = [
    { label: 'EXP', value: Math.min(100, (totals.matches / TARGETS.matches) * 100) },
    {
      label: isBowlerRole ? 'WKT' : 'RUN',
      value: Math.min(100, (isBowlerRole ? totals.wickets / TARGETS.wickets : totals.runs / TARGETS.runs) * 100),
    },
    { label: 'AVG', value: Math.min(100, (batAvg / TARGETS.batAvg) * 100) },
    { label: 'SPD', value: Math.min(100, (batSR / TARGETS.batSR) * 100) }, // Speed/Tempo
    {
      label: 'CTRL',
      value: isBowlerRole
        ? Math.max(0, 100 - (Math.max(0, economy - 4) / 8) * 100) // 4 is 100%, 12 is 0%
        : Math.min(100, (totals.notOdds / (totals.innings || 1)) * 300), // Persistence for batters
    },
  ];

  // SVG Radar generator (R=80 center=130,130)
  const size = 260; // Increased to prevent clipping
  const center = size / 2;
  const radius = 80;
  const angleStep = (Math.PI * 2) / scores.length;

  const getPoints = () => {
    return scores.map((score, i) => {
      const r = (score.value / 100) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Axis definitions for tooltips
  const radarMeta = {
    EXP:  `Experience: Total matches played vs elite benchmark (${TARGETS.matches})`,
    RUN:  `Scoring: Total career runs vs benchmark (${TARGETS.runs})`,
    WKT:  `Wickets: Total wickets taken vs benchmark (${TARGETS.wickets})`,
    AVG:  `Efficiency: Batting/Bowling average quality`,
    SPD:  `Tempo: Scoring rate or bowling impact speed`,
    CTRL: `Control: Economy restraint or innings persistence`,
  };

  // Generate Performance Badges
  const badges = [];

  // Batting Verdicts
  if (batSR > 140 && totals.innings >= 15) {
    if (!isBowlerRole || positionName.includes('All')) {
      badges.push({ id: 'hh', label: 'Hard Hitter', color: '#f2ca50', tip: `Exceptional strike rate (${batSR.toFixed(1)}) over ${totals.innings} innings` });
    } else {
      badges.push({ id: 'tp', label: 'Tailend Power', color: '#f2ca50', tip: `Explosive lower-order hitting (SR ${batSR.toFixed(1)})` });
    }
  }

  if (!isBowlerRole && batAvg > 40 && totals.innings > 20) {
    badges.push({ id: 're', label: 'Anchor', color: '#50a2f2', tip: `High consistency batting (Avg ${batAvg.toFixed(1)})` });
  }

  // Bowling Verdicts
  if (isBowlerRole && economy < 7.5 && totals.overs > 100) {
    badges.push({ id: 'ec', label: 'Econ Specialist', color: '#50f2ca', tip: `Elite run-rate control (Econ ${economy.toFixed(2)})` });
  }

  if (totals.wickets > 150) {
    badges.push({ id: 'wt', label: 'Strike Bowler', color: '#f25050', tip: `Proven wicket-taking record (${totals.wickets} Wkts)` });
  }

  // Experience Verdicts
  if (totals.matches > 100) {
    badges.push({ id: 'vt', label: 'Veteran', color: '#a250f2', tip: `Extensive top-flight experience (${totals.matches} Matches)` });
  }

  return (
    <div className="scouting-radar" aria-label="Scouting performance radar">
      <div className="scouting-radar__chart">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background polygons */}
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <polygon
              key={p}
              points={scores.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + radius * p * Math.cos(angle);
                const y = center + radius * p * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ')}
              className="radar-grid"
            />
          ))}
          {/* Axis lines */}
          {scores.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} className="radar-axis" />;
          })}
          {/* Data polygon */}
          <polygon points={getPoints()} className="radar-data" />
        </svg>

        {/* HTML Labels (for easier tooltips and accessibility) */}
        {scores.map((score, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + (radius + 28) * Math.cos(angle);
          const y = center + (radius + 22) * Math.sin(angle);
          const ttId = `rtt-${i}`;
          return (
            <button
              key={i}
              type="button"
              className="radar-label-wrap"
              style={{
                left: `${(x / size) * 100}%`,
                top: `${(y / size) * 100}%`,
              }}
              aria-describedby={ttId}
            >
              <span className="radar-label">{score.label}</span>
              <span id={ttId} className="scouting-radar__tooltip" role="tooltip">
                {radarMeta[score.label]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="scouting-radar__sidebar">
        <p className="sidebar-title">Scouting Analysis</p>
        <div className="badge-list">
          {badges.length > 0 ? (
            badges.map(b => {
              const ttId = `btt-${b.id}`;
              return (
                <button
                  key={b.id}
                  type="button"
                  className="perform-badge"
                  style={{ '--badge-color': b.color }}
                  aria-describedby={ttId}
                >
                  {b.label}
                  <span id={ttId} className="perform-badge__tooltip" role="tooltip">
                    {b.tip}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="scouting-empty">
              <span className="scouting-empty__text">Evaluating Potential...</span>
              <p className="scouting-empty__sub">Awaiting sufficient elite-level data samples for automated badge assignment.</p>
            </div>
          )}
        </div>
        <p className="sidebar-desc">
          Automated scouting logic derived from career volume and efficiency benchmarks.
        </p>
      </div>
    </div>
  );
};

export default ScoutingRadar;
