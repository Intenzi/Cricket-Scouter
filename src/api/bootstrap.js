import { client } from './client';

/**
 * fetchCountries() - GET /countries.
 */
export async function fetchCountries() {
  const result = await client('/countries');
  return result?.data || [];
}

/**
 * fetchTeams() - GET /teams.
 */
export async function fetchTeams() {
  const result = await client('/teams');
  return result?.data || [];
}
