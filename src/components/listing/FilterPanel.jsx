/**
 * components/listing/FilterPanel.jsx
 */

import React, { useState } from 'react';
import SearchBar from './SearchBar';
import { POSITION_OPTIONS, TOURNAMENT_OPTIONS } from '../../utils/constants';
import '../../styles/components/filter-panel.css';

const FilterPanel = ({
  search,
  onSearchChange,
  country,
  onCountryChange,
  position,
  onPositionChange,
  tournament,
  onTournamentChange,
  onClearAll,
  countryOptions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'country', 'position', 'tournament'

  const hasActiveFilter = search || country || position || tournament;

  const handleTournamentToggle = (type) => {
    onTournamentChange(tournament === type ? '' : type);
  };

  const handleCountryChange = (countryName, checked) => {
    const currentCountries = country ? country.split(',').filter(Boolean) : [];
    let next;
    
    if (checked) {
      next = currentCountries.includes(countryName) ? currentCountries : [...currentCountries, countryName];
    } else {
      next = currentCountries.filter(name => name !== countryName);
    }
    
    onCountryChange(next.join(','));
  };

  const handlePositionToggle = (positionId) => {
    onPositionChange(position === String(positionId) ? '' : String(positionId));
  };

  const toggleTab = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <>
      <button 
        className="filter-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined">
          {isOpen ? 'close' : 'tune'}
        </span>
        {isOpen ? 'Close Filters' : 'Filters'}
        {hasActiveFilter && <span className="filter-dot"></span>}
      </button>

      <aside className={`filter-panel ${isOpen ? 'is-open' : ''}`} aria-label="Player filters">
        <div className="filter-panel__header">
          <h2 className="font-tungsten filter-panel__title">Filters</h2>
          {hasActiveFilter && (
            <button className="filter-clear-btn-text" onClick={onClearAll} type="button">
              Clear All
            </button>
          )}
        </div>
        
        <SearchBar value={search} onChange={onSearchChange} />

        <div className="filter-group">
          <button 
            className={`filter-dropdown-trigger ${activeTab === 'country' ? 'is-active' : ''}`}
            onClick={() => toggleTab('country')}
          >
            <span className="filter-section__legend">Country</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
          <fieldset className={`filter-section ${activeTab === 'country' ? 'is-expanded' : ''}`}>
            <div className="country-filter" role="group" aria-label="Filter by country">
              {countryOptions.length === 0 && (
                <span className="country-filter__loading">Loading countries…</span>
              )}
              {countryOptions.map(({ countryId, name, playerCount }) => {
                const currentSelected = country ? country.split(',').filter(Boolean) : [];
                const inputId = `country-${countryId}`;
                const isChecked = currentSelected.includes(name);
                return (
                  <label key={countryId} className="country-filter__item" htmlFor={inputId}>
                    <input
                      id={inputId}
                      className="country-filter__checkbox"
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCountryChange(name, e.target.checked)}
                    />
                    <span className="country-filter__label">{name}</span>
                    <span className="country-filter__count">{playerCount.toLocaleString()}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="filter-group">
          <button 
            className={`filter-dropdown-trigger ${activeTab === 'position' ? 'is-active' : ''}`}
            onClick={() => toggleTab('position')}
          >
            <span className="filter-section__legend">Position</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
          <div className={`filter-section ${activeTab === 'position' ? 'is-expanded' : ''}`} role="group" aria-label="Filter by position">
            <div className="position-filter">
              {POSITION_OPTIONS.map(({ id, label }) => {
                const isActive = position === String(id);
                return (
                  <button
                    key={id}
                    className="position-pill"
                    onClick={() => handlePositionToggle(id)}
                    type="button"
                    aria-pressed={isActive}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="filter-group">
          <button 
            className={`filter-dropdown-trigger ${activeTab === 'tournament' ? 'is-active' : ''}`}
            onClick={() => toggleTab('tournament')}
          >
            <span className="filter-section__legend">Tournament Format</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
          <div className={`filter-section ${activeTab === 'tournament' ? 'is-expanded' : ''}`} role="group" aria-label="Filter by tournament format">
            <div className="position-filter">
              {TOURNAMENT_OPTIONS.map(({ id, label }) => {
                const isActive = tournament === id;
                return (
                  <button
                    key={id}
                    className="position-pill"
                    onClick={() => handleTournamentToggle(id)}
                    type="button"
                    aria-pressed={isActive}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {hasActiveFilter && (
          <button className="filter-clear-btn" onClick={onClearAll} type="button">
            Clear all filters
          </button>
        )}

        {isOpen && (
          <button 
            className="filter-show-results-btn" 
            onClick={() => setIsOpen(false)}
            type="button"
          >
            Show Results
          </button>
        )}
      </aside>
    </>
  );
};

export default FilterPanel;
