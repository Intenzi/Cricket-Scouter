/**
 * components/listing/SortControls.jsx
 *
 * Inline sort controls - a set of sort-key buttons with asc/desc toggle.
 * Active sort key is highlighted; clicking the active key toggles order.
 * Clicking a different key sets it as active with default 'desc' order.
 *
 * @param {string}   props.sort         - Current sort key ('id' | 'firstname' | 'updated_at').
 * @param {string}   props.order        - Current order ('asc' | 'desc').
 * @param {Function} props.onSortChange - Called with (key, order) when a sort button is clicked.
 */

import React from 'react';
import { SORT_OPTIONS } from '../../utils/constants';
import '../../styles/components/sort-controls.css';

/**
 * SortControls component.
 *
 * @param {string}   props.sort         - Active sort key.
 * @param {string}   props.order        - Active sort order.
 * @param {Function} props.onSortChange - Callback when sort changes.
 */
const SortControls = ({ sort, order, onSortChange }) => {
  return (
    <div className="sort-controls" role="group" aria-label="Sort options">
      {/* --- Sort Property --- */}
      <div className="sort-controls__group">
        <span className="sort-controls__label">Sort by:</span>
        <div className="sort-controls__options">
          {SORT_OPTIONS.map(({ value, label }) => {
            const isActive = sort === value;
            return (
              <button
                key={value}
                className={`sort-btn${isActive ? ' sort-btn--active' : ''}`}
                onClick={() => onSortChange(value, order)}
                type="button"
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Sort Order --- */}
      <div className="sort-controls__group">
        <span className="sort-controls__label">Order:</span>
        <div className="sort-controls__options sort-controls__options--order">
          <button
            className={`sort-btn${order === 'asc' ? ' sort-btn--active' : ''}`}
            onClick={() => onSortChange(sort, 'asc')}
            type="button"
            aria-pressed={order === 'asc'}
            aria-label="Sort Ascending"
          >
            ASC ↑
          </button>
          <button
            className={`sort-btn${order === 'desc' ? ' sort-btn--active' : ''}`}
            onClick={() => onSortChange(sort, 'desc')}
            type="button"
            aria-pressed={order === 'desc'}
            aria-label="Sort Descending"
          >
            DESC ↓
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortControls;
