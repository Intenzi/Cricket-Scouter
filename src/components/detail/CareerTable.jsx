/**
 * components/detail/CareerTable.jsx
 *
 * Career statistics breakdown table — one row per cricket format.
 * Columns: Format, Matches, Innings, NO, Runs, HS, Avg, 100s, 50s, Wkts.
 *
 * Receives pre-aggregated rows from groupCareer() via usePlayerDetail.
 * Hides itself entirely if careerGroups is empty (shows EmptyState variant instead).
 *
 * @param {object}   props
 * @param {object[]} props.careerGroups - Aggregated rows from groupCareer().
 * @param {boolean}  [props.isLoading]  - Show skeleton rows while career data loads.
 */

import React from 'react';
import '../../styles/components/career-table.css';
import '../../styles/components/skeleton.css';

/** Table column definitions */
const COLUMNS = [
  { key: 'type',        label: 'Format',  align: 'left',  tooltip: 'Game format (Test, ODI, T20I)' },
  { key: 'matches',     label: 'M',       align: 'right', tooltip: 'Matches played' },
  { key: 'innings',     label: 'Inn',     align: 'right', tooltip: 'Innings batted' },
  { key: 'not_outs',    label: 'NO',      align: 'right', tooltip: 'Not out innings' },
  { key: 'runs',        label: 'Runs',    align: 'right', tooltip: 'Total runs scored' },
  { key: 'highest',     label: 'HS',      align: 'right', tooltip: 'Highest individual score' },
  { key: 'batting_avg', label: 'Avg',     align: 'right', tooltip: 'Batting average' },
  { key: 'hundreds',    label: '100s',    align: 'right', tooltip: 'Centuries scored' },
  { key: 'fifties',     label: '50s',     align: 'right', tooltip: 'Half-centuries scored' },
  { key: 'wickets',     label: 'Wkts',   align: 'right', tooltip: 'Wickets taken' },
];

/**
 * CareerTable component.
 *
 * @param {object}   props
 * @param {object[]} props.careerGroups - Aggregated career format rows.
 * @param {boolean}  [props.isLoading]  - True while Phase 2 data is loading.
 */
const CareerTable = ({ careerGroups, isLoading = false }) => {
  return (
    <section className="career-section" aria-label="Career statistics breakdown">
      <h2 className="career-section__title">Career Statistics</h2>

      {isLoading ? (
        <div className="career-table-wrap" aria-busy="true">
          <table className="career-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const tooltipId = `tt-${col.key}-skel`;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={`u-text-${col.align}`}
                    >
                      <button
                        type="button"
                        className="career-table__header-btn"
                        aria-describedby={tooltipId}
                      >
                        {col.label}
                      </button>
                      <span
                        id={tooltipId}
                        className="career-table__tooltip"
                        role="tooltip"
                      >
                        {col.tooltip}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }, (_, i) => (
                <tr key={i}>
                  {COLUMNS.map((col) => (
                    <td key={col.key}>
                      <div
                        className={`skeleton-shimmer career-table__skeleton-bar career-table__skeleton-bar--${
                          col.key === 'type' ? 'large' : 'small'
                        } ${col.align === 'right' ? 'u-margin-l-auto' : ''}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : careerGroups.length === 0 ? (
        <p className="career-table__empty-msg">
          Career statistics not on record.
        </p>
      ) : (
        <div className="career-table-wrap">
          <table className="career-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const tooltipId = `tt-${col.key}`;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={`u-text-${col.align}`}
                    >
                      <button
                        type="button"
                        className="career-table__header-btn"
                        aria-describedby={tooltipId}
                      >
                        {col.label}
                      </button>
                      <span
                        id={tooltipId}
                        className="career-table__tooltip"
                        role="tooltip"
                      >
                        {col.tooltip}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {careerGroups.map((row) => (
                <tr key={row.type}>
                  {COLUMNS.map((col) => (
                    <td key={col.key} className={`u-text-${col.align}`}>
                      {col.key === 'type' ? (
                        <span className="career-table__format">{row[col.key]}</span>
                      ) : (
                        row[col.key] ?? '–'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CareerTable;
