/**
 * hooks/usePlayerSlice.js
 */

import { useMemo } from 'react';
import { useUrlState } from './useUrlState';
import { useDebounce } from './useDebounce';
import { deriveSlice, lookupCountry } from '../store/players';
import { PER_PAGE } from '../utils/constants';

const SCHEMA = {
  search:   '',
  country:  '',
  position: '',
  tournament: '',
  sort:     'id',
  order:    'asc',
  page:     '1',
};

export function usePlayerSlice() {
  const { state, setParam, setParams, resetAll } = useUrlState(SCHEMA);
  const debouncedSearch = useDebounce(state.search, 350);

  const countryIds = useMemo(() => {
    if (!state.country) return undefined;
    return state.country
      .split(',')
      .map(name => lookupCountry(name.trim()))
      .filter(Boolean)
      .map(c => c.id)
      .join(',');
  }, [state.country]);

  const { players, total, isEmpty } = useMemo(
    () =>
      deriveSlice({
        search:         debouncedSearch,
        countryId:      countryIds,
        positionId:     state.position   || undefined,
        tournamentType: state.tournament || undefined,
        sort:           state.sort,
        order:          state.order,
        page:           Number(state.page) || 1,
        perPage:        PER_PAGE,
      }),
    [debouncedSearch, countryIds, state.position, state.tournament, state.sort, state.order, state.page]
  );

  return {
    players,
    total,
    isEmpty,
    urlState: state,
    setParam,
    setParams,
    resetAll,
  };
}
