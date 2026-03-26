/* eslint-env node */
/* eslint-disable no-undef */
/**
 * scripts/update-tournaments.js
 * 
 * Run this script with Node.js to fetch all players and determine
 * the unique career tournament types dynamically.
 * 
 * Usage: node scripts/update-tournaments.js
 */

import 'dotenv/config';

const TOKEN = process.env.SPORTMONKS_TOKEN;
const API_URL = `https://cricket.sportmonks.com/api/v2.0/players?api_token=${TOKEN}&include=career`;

async function main() {
  if (!TOKEN) {
    console.error('Error: SPORTMONKS_TOKEN is missing in .env');
    process.exit(1);
  }

  console.log(`Fetching from Sportmonks... This may take a while depending on the payload.`);
  
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API fetch failed with status ${res.status}`);
    
    const data = await res.json();
    const players = data.data || [];
    
    console.log(`Successfully fetched ${players.length} players.`);
    
    const types = new Set();
    players.forEach(p => {
      (p.career || []).forEach(c => {
        if (c.type) types.add(c.type.toUpperCase());
      });
    });
    
    const sortedTypes = Array.from(types).sort();
    
    console.log('\n--- Unique Tournament Types Found ---');
    console.log(sortedTypes);
    console.log('-------------------------------------\n');
    
    console.log('Update `src/utils/constants.js` with the following:');
    sortedTypes.forEach(t => console.log(`  { id: '${t.toLowerCase()}', label: '${t}' },`));
    
  } catch (err) {
    console.error('Failed to parse career types:', err.message);
  }
}

main();
