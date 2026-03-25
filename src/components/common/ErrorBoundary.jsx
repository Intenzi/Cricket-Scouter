/**
 * components/common/ErrorBoundary.jsx
 *
 * React class-based error boundary that catches runtime errors in its subtree.
 * Renders <ErrorState type="crash"> on failure, with a reload button.
 *
 * Wraps each page route independently so a crash in one route
 * does not affect the other.
 */

import React from 'react';
import ErrorState from './ErrorState';

/**
 * ErrorBoundary class component.
 * Catches errors from any child component during rendering or in lifecycle methods.
 */
class ErrorBoundary extends React.Component {
  /**
   * @param {object} props
   * @param {React.ReactNode} props.children - Components to protect.
   */
  constructor(props) {
    super(props);
    /** @type {{ hasError: boolean, error: Error|null }} */
    this.state = { hasError: false, error: null };
  }

  /**
   * Derives state from the caught error.
   *
   * @param {Error} error
   * @returns {{ hasError: boolean, error: Error }}
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Logs error info for debugging.
   *
   * @param {Error}  error
   * @param {object} info
   */
  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          type="crash"
          message="Something went wrong rendering this page."
          onAction={() => window.location.reload()}
          actionLabel="Reload page"
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
