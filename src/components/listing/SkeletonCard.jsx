/**
 * components/listing/SkeletonCard.jsx
 *
 * Placeholder card shown in the PlayerGrid during the rare cold-start state
 * where the store is not yet hydrated (IDB miss + fetch pending).
 *
 * Mirrors the PlayerCard layout to prevent layout shift when data arrives.
 */

import React from 'react';
import '../../styles/components/skeleton.css';

/**
 * SkeletonCard component — static shimmer placeholder.
 */
const SkeletonCard = () => {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__image skeleton-shimmer" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__line skeleton-shimmer" />
        <div className="skeleton-card__line skeleton-card__line--short skeleton-shimmer" />
        <div className="skeleton-card__line skeleton-card__line--xshort skeleton-shimmer" />
      </div>
    </div>
  );
};

export default SkeletonCard;
