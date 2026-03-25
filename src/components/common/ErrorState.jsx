/**
 * components/common/ErrorState.jsx
 *
 * Renders an error message appropriate to the error type.
 *
 * Supported types:
 *   'network'    — transient fetch failure, shows "Try again"
 *   'not-found'  — 404, player not in database
 *   'auth'       — 401, invalid API key
 *   'rate-limit' — 429, rate limit exceeded
 *   'crash'      — ErrorBoundary catch, page reload
 *
 * @param {object}   props
 * @param {string}   [props.type='network']
 * @param {string}   [props.message]       - Optional override message.
 * @param {Function} [props.onAction]      - Callback for the action button.
 * @param {string}   [props.actionLabel]   - Optional override label for the button.
 */

import React from 'react';
import '../../styles/components/empty-error.css';

/** @type {Record<string, { title: string, copy: string, action: string }>} */
const ERROR_CONFIGS = {
  network: {
    title: 'Connection failed',
    copy:  'We couldn\'t reach the server. Check your connection and try again.',
    action: 'Try again',
  },
  'not-found': {
    title: 'Player not found',
    copy: 'This player isn\'t in our database — they may have been removed.',
    action: 'Back to directory',
  },
  auth: {
    title: 'Authentication failed',
    copy:  import.meta.env.DEV
      ? 'API key invalid — check your .env file (VITE_SPORTMONKS_TOKEN).'
      : 'Something went wrong. Please reload the page.',
    action: 'Reload page',
  },
  'rate-limit': {
    title: 'Rate limit reached',
    copy:  'Too many requests have been made. Data will refresh automatically shortly.',
    action: null,
  },
  crash: {
    title: 'Unexpected error',
    copy:  'Something went wrong rendering this page.',
    action: 'Reload page',
  },
};

/**
 * Error state component.
 *
 * @param {object}   props
 * @param {string}   [props.type='network'] - Error type key.
 * @param {string}   [props.message]        - Overrides the default copy.
 * @param {Function} [props.onAction]       - Action button callback.
 * @param {string}   [props.actionLabel]    - Overrides the default action label.
 */
const ErrorState = ({ type = 'network', message, onAction, actionLabel }) => {
  const config = ERROR_CONFIGS[type] ?? ERROR_CONFIGS.network;

  return (
    <div className="error-state" role="alert">
      {/* Warning icon */}
      <svg
        className="error-state__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>

      <h2 className="error-state__title">{config.title}</h2>
      <p className="error-state__copy">{message ?? config.copy}</p>

      {(actionLabel ?? config.action) && onAction && (
        <button className="error-state__action" onClick={onAction} type="button">
          {actionLabel ?? config.action}
        </button>
      )}
    </div>
  );
};

export default ErrorState;
