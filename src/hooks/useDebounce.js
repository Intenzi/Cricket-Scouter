/**
 * hooks/useDebounce.js
 *
 * Delays updating a value until `delay` milliseconds have elapsed since the last change.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchInput, 350);
 *
 * - The controlled input updates immediately (responsive UI).
 * - Only `debouncedSearch` drives the URL and store query, so the derive
 *   function is not called on every keystroke.
 * - `forceFlush` ref pattern allows pressing Enter to commit immediately
 *   by bypassing the timeout.
 */

import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of inactivity.
 *
 * @template T
 * @param {T}      value - The value to debounce.
 * @param {number} [delay=350] - Delay in milliseconds.
 * @returns {T} The debounced value.
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debouncedValue;
}
