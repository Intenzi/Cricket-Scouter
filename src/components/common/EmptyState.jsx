/**
 * components/common/EmptyState.jsx
 *
 * Displayed when a search/filter combination returns zero results.
 *
 * @param {object}   props
 * @param {string}   [props.title='No players found']
 * @param {string}   [props.message]
 * @param {string}   [props.actionLabel]
 * @param {Function} [props.onAction]
 */

import React from 'react';
import '../../styles/components/empty-error.css';

/**
 * Empty state component for zero-result filter scenarios.
 *
 * @param {object}   props
 * @param {string}   [props.title]       - Heading text.
 * @param {string}   [props.message]     - Supporting copy.
 * @param {string}   [props.actionLabel] - Label for the optional CTA button.
 * @param {Function} [props.onAction]    - Callback for the CTA button.
 */
const EmptyState = ({
  title = 'No players found',
  message = 'Try adjusting your search or filters to find what you\'re looking for.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state" role="status" aria-live="polite" aria-atomic="true">
      {/* Magnifying glass icon */}
      <svg
        className="empty-state__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
      </svg>

      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__copy">{message}</p>

      {actionLabel && onAction && (
        <button className="empty-state__action" onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
