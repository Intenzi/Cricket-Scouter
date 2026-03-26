/**
 * hooks/useUrlState.js
 *
 * Two-way sync between React component state and URLSearchParams.
 * Built on React Router v6's `useSearchParams`.
 *
 * Usage:
 *   const { state, setParam, resetAll } = useUrlState({
 *     search: '',
 *     country: '',
 *     position: '',
 *     sort: 'id',
 *     order: 'desc',
 *     page: '1',
 *   });
 *
 * Design decisions:
 *   - Uses `replace: true` so every keystroke does not push a new history entry.
 *   - Filter keys (search, country, position) automatically reset `page` to '1'
 *     when changed — implemented inside `setParam`.
 *   - A param is deleted from the URL when its value equals the schema default
 *     (keeps the URL clean for sharing).
 */

import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/** Keys that, when changed, should auto-reset pagination. */
const FILTER_KEYS = new Set(['search', 'country', 'position', 'tournament']);

/**
 * Provides URL-persisted state for the players listing page.
 *
 * @param {Record<string, string>} schema - Map of param names to their default values.
 * @returns {{ state: Record<string, string>, setParam: Function, resetAll: Function }}
 */
export function useUrlState(schema) {
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * Reads all schema keys from the current URLSearchParams,
   * falling back to schema defaults for missing params.
   *
   * @type {Record<string, string>}
   */
  const state = Object.fromEntries(
    Object.entries(schema).map(([key, defaultVal]) => [key, searchParams.get(key) ?? defaultVal])
  );

  /**
   * Writes a single param to the URL.
   * - If the new value equals the schema default, the param key is removed.
   * - If the key is a filter key, `page` is always reset to '1'.
   *
   * @param {string} key   - The param key to update.
   * @param {string} value - The new value.
   */
  const setParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          const isDefault = value === schema[key] || value === '' || value === null;
          if (isDefault) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }

          // Auto-reset pagination when a filter changes.
          if (FILTER_KEYS.has(key)) {
            next.delete('page'); // page '1' is the default - omit it from URL
          }

          return next;
        },
        { replace: true }
      );
    },
    [schema, setSearchParams]
  );

  /**
   * Writes multiple params to the URL simultaneously.
   *
   * @param {Record<string, string>} updates - Key-value pairs to update.
   */
  const setParams = useCallback(
    (updates) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          let resetsPage = false;

          Object.entries(updates).forEach(([key, value]) => {
            const isDefault = value === schema[key] || value === '' || value === null;
            if (isDefault) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }

            if (FILTER_KEYS.has(key)) {
              resetsPage = true;
            }
          });

          if (resetsPage) {
            next.delete('page');
          }

          return next;
        },
        { replace: true }
      );
    },
    [schema, setSearchParams]
  );

  /**
   * Clears all params from the URL, resetting to schema defaults.
   * Used by the "Clear All Filters" button.
   */
  const resetAll = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return { state, setParam, setParams, resetAll };
}
