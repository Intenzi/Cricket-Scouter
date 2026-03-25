/**
 * pages/NotFoundPage.jsx
 *
 * Dedicated 404 page for invalid routes or players not found.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/empty-error.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-state not-found-page" role="alert">
      <div className="not-found-code font-tungsten">404</div>
      <h1 className="error-state__title">Scouting Record Missing</h1>
      <p className="error-state__copy">
        The player profile you are looking for doesn't exist in our global registry. 
        It may have been archived or the link might be broken.
      </p>

      <button 
        className="error-state__action" 
        onClick={() => navigate('/players')} 
        type="button"
      >
        ← Back to Scouting Directory
      </button>

      <div className="not-found-decoration">
        {/* Abstract scouting-themed decoration */}
        <span className="material-symbols-outlined">person_off</span>
      </div>
    </div>
  );
};

export default NotFoundPage;
