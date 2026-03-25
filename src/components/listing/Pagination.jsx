/**
 * components/listing/Pagination.jsx
 *
 * Client-side pagination controls.
 * Desktop: full page button row with ellipsis (standard 7-slot pattern).
 * Mobile: simplified prev/next + "Page N of M" text.
 *
 * @param {object}   props
 * @param {number}   props.currentPage  - Current 1-indexed page number.
 * @param {number}   props.totalPages   - Total number of pages.
 * @param {Function} props.onPageChange - Called with the new page number.
 */

import React from 'react';
import '../../styles/components/pagination.css';

/** Maximum visible page slots (including ellipses, not counting prev/next) */
const MAX_SLOTS = 7;

/**
 * Generates the sequence of page numbers and 'ellipsis' tokens to render.
 *
 * @param {number} current - Current page (1-indexed).
 * @param {number} total   - Total number of pages.
 * @returns {(number|'ellipsis')[]}
 */
function buildPages(current, total) {
  if (total <= MAX_SLOTS) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const nearStart = current <= 4;
  const nearEnd   = current >= total - 3;

  if (nearStart) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(total);
  } else if (nearEnd) {
    pages.push(1);
    pages.push('ellipsis');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('ellipsis');
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push('ellipsis');
    pages.push(total);
  }

  return pages;
}

/**
 * Pagination component.
 *
 * @param {object}   props
 * @param {number}   props.currentPage  - Active page (1-indexed).
 * @param {number}   props.totalPages   - Total pages count.
 * @param {Function} props.onPageChange - Callback for page selection.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = buildPages(currentPage, totalPages);

  /**
   * @param {number} page
   */
  const go = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className="pagination"
      aria-label="Player directory pagination"
    >
      {/* First */}
      <button
        className="pagination__btn pagination__btn--nav pagination__btn--skip"
        onClick={() => go(1)}
        disabled={currentPage === 1}
        aria-disabled={currentPage === 1}
        aria-label="Go to first page"
        type="button"
      >
        «
      </button>

      {/* Previous */}
      <button
        className="pagination__btn pagination__btn--nav"
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        aria-disabled={currentPage === 1}
        aria-label="Go to previous page"
        type="button"
      >
        ‹
      </button>

      {/* Page number buttons - Hidden on small mobile in CSS, but let's make them more adaptive here */}
      <div className="pagination__pages">
        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={page}
              className="pagination__btn pagination__btn--page"
              onClick={() => go(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}${page === currentPage ? ', current page' : ''}`}
              type="button"
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Mobile page info - visible only on narrow viewports via CSS */}
      <span className="pagination__mobile-info" aria-live="polite" aria-atomic="true">
        {currentPage} / {totalPages}
      </span>

      {/* Next */}
      <button
        className="pagination__btn pagination__btn--nav"
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-disabled={currentPage === totalPages}
        aria-label="Go to next page"
        type="button"
      >
        ›
      </button>

      {/* Last */}
      <button
        className="pagination__btn pagination__btn--nav pagination__btn--skip"
        onClick={() => go(totalPages)}
        disabled={currentPage === totalPages}
        aria-disabled={currentPage === totalPages}
        aria-label="Go to last page"
        type="button"
      >
        »
      </button>
    </nav>
  );
};

export default Pagination;
