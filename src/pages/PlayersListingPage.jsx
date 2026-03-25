/**
 * pages/PlayersListingPage.jsx
 */

import React, { useEffect, useMemo } from 'react';
import FilterPanel from '../components/listing/FilterPanel';
import SortControls from '../components/listing/SortControls';
import FilterPill from '../components/listing/FilterPill';
import PlayerGrid from '../components/listing/PlayerGrid';
import Pagination from '../components/listing/Pagination';
import { usePlayerSlice } from '../hooks/usePlayerSlice';
import { getCountryOptions } from '../store/players';
import { POSITION_MAP, PER_PAGE } from '../utils/constants';

const PlayersListingPage = () => {
  const {
    players,
    total,
    isEmpty,
    urlState,
    setParam,
    setParams,
    resetAll,
  } = usePlayerSlice();

  useEffect(() => {
    document.title = 'Players — Cricket Scouter';
  }, []);

  const countryOptions = useMemo(() => getCountryOptions(), []);

  const totalPages  = Math.ceil(total / PER_PAGE);
  const currentPage = Number(urlState.page) || 1;

  const activePills = [];

  if (urlState.search) {
    activePills.push({
      key: 'search',
      label: `SEARCH: ${urlState.search.toUpperCase()}`,
      remove: () => setParam('search', ''),
    });
  }

  if (urlState.country) {
    const names = urlState.country.split(',').filter(Boolean);
    names.forEach((name) => {
      activePills.push({
        key: `country-${name}`,
        label: `REGION: ${name.toUpperCase()}`,
        remove: () => {
          const next = names.filter(n => n !== name).join(',');
          setParam('country', next);
        },
      });
    });
  }

  if (urlState.position) {
    const posName = POSITION_MAP[Number(urlState.position)] || `Position ${urlState.position}`;
    activePills.push({
      key: 'position',
      label: `ROLE: ${posName.toUpperCase()}`,
      remove: () => setParam('position', ''),
    });
  }

  if (urlState.tournament) {
    activePills.push({
      key: 'tournament',
      label: `FORMAT: ${urlState.tournament.toUpperCase()}`,
      remove: () => setParam('tournament', ''),
    });
  }

  return (
    <div className="listing-layout">
      <FilterPanel
        search={urlState.search}
        onSearchChange={(v) => setParam('search', v)}
        country={urlState.country}
        onCountryChange={(v) => setParam('country', v)}
        position={urlState.position}
        onPositionChange={(v) => setParam('position', v)}
        tournament={urlState.tournament}
        onTournamentChange={(v) => setParam('tournament', v)}
        onClearAll={resetAll}
        countryOptions={countryOptions}
      />

      <div className="directory-content">
        <div className="directory-header">
          <h1 className="directory-header__title font-tungsten">Scouting Directory</h1>
          <div className="directory-header__count">
            DISPLAYING {players.length.toLocaleString()} OF {total.toLocaleString()} GLOBAL RECORDS
          </div>
        </div>

        <SortControls
          sort={urlState.sort}
          order={urlState.order}
          onSortChange={(key, ord) => setParams({ sort: key, order: ord })}
        />

        {activePills.length > 0 && (
          <div className="filter-pill-row">
            {activePills.map((pill) => (
              <FilterPill
                key={pill.key}
                label={pill.label}
                onRemove={pill.remove}
              />
            ))}
          </div>
        )}

        <PlayerGrid
          players={players}
          total={total}
          isEmpty={isEmpty}
          onClearFilters={resetAll}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setParam('page', String(p))}
        />
      </div>
    </div>
  );
};

export default PlayersListingPage;
