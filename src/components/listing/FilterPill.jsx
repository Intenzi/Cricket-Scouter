/**
 * components/listing/FilterPill.jsx
 *
 * A dismissible active-filter pill.
 * Displayed in the FilterPillRow when search, country, or position filters are active.
 *
 * @param {object}   props
 * @param {string}   props.label    - Display text for the filter value.
 * @param {Function} props.onRemove - Called when the dismiss (×) button is clicked.
 */

import React from 'react';
import '../../styles/components/filter-pill.css';

/**
 * FilterPill component.
 *
 * @param {object}   props
 * @param {string}   props.label    - Human-readable filter display value.
 * @param {Function} props.onRemove - Callback to remove this filter.
 */
const FilterPill = ({ label, onRemove }) => {
  return (
    <div className="filter-pill">
      <span className="filter-pill__label">{label}</span>
      <button
        className="filter-pill__dismiss"
        onClick={onRemove}
        type="button"
        aria-label={`Remove filter: ${label}`}
      >
        ×
      </button>
    </div>
  );
};

export default FilterPill;
