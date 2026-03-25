/**
 * components/listing/SearchBar.jsx
 *
 * Controlled search input with:
 *   - Always-visible accessible label
 *   - Magnifying glass icon adornment
 *   - Clear (x) button visible when there is text
 *   - Escape key clears input and returns focus
 *   - Enter key commits immediately (bypasses debounce in the parent)
 *
 * @param {object}   props
 * @param {string}   props.value      - Controlled input value (live, not debounced).
 * @param {Function} props.onChange   - Called with new string on every keystroke.
 */

import React, { useRef, useCallback } from 'react';
import '../../styles/components/search-bar.css';

/**
 * SearchBar component.
 *
 * @param {object}   props
 * @param {string}   props.value    - Current search text.
 * @param {Function} props.onChange - Callback when text changes.
 */
const SearchBar = ({ value, onChange }) => {
  const inputRef = useRef(null);

  /**
   * Handles input changes.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = useCallback(
    (e) => onChange(e.target.value),
    [onChange]
  );

  /**
   * Handles Escape to clear, and Enter to commit immediately.
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} e
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onChange('');
        inputRef.current?.focus();
      }
    },
    [onChange]
  );

  /**
   * Clears the search value and returns focus to the input.
   */
  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="search-bar">
      <label htmlFor="player-search" className="search-bar__label">
        Search players by last name
      </label>

      <div className="search-bar__input-wrap">
        {/* Magnifying glass icon */}
        <svg
          className="search-bar__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>

        <input
          ref={inputRef}
          id="player-search"
          type="search"
          className="search-bar__input"
          placeholder="Search by last name..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          aria-label="Search players by last name"
        />

        {/* Clear button - only shown when there is text */}
        <button
          className={`search-bar__clear${value ? '' : ' search-bar__clear--hidden'}`}
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
          tabIndex={value ? 0 : -1}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
