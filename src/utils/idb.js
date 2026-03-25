/**
 * utils/idb.js
 *
 * Lightweight IndexedDB wrapper (~80 lines) for Cricket Scouter.
 *
 * Provides:
 *   openDB()       — opens / creates the database and object store
 *   readCache(key) — reads a value from the 'cache' store
 *   writeCache(key, value) — writes a value to the 'cache' store
 *   clearCache()   — wipes all entries from the 'cache' store
 *
 * Design decisions:
 *   - DB name: cricket_scouter_v1
 *   - Object store: cache
 *   - QuotaExceededError / IDB unavailable → silent failure, in-memory only
 *   - No external dependencies
 */

/** Database name and version constants. */
const DB_NAME = 'cricket_scouter_v1';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

/**
 * Opens the IndexedDB database, creating the object store on first run.
 *
 * @returns {Promise<IDBDatabase>} Resolves to the opened database instance.
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Reads a cached value by key.
 *
 * @param {string} key - The cache key to look up.
 * @returns {Promise<any|null>} The stored value, or null if not found / IDB unavailable.
 */
export async function readCache(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // IDB unavailable (private browsing, security policy) - degrade silently.
    return null;
  }
}

/**
 * Writes a value to the cache under the given key.
 *
 * @param {string} key   - The cache key.
 * @param {any}    value - JSON-serialisable value to store.
 * @returns {Promise<void>} Resolves when the write completes, or silently if IDB is unavailable.
 */
export async function writeCache(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // QuotaExceededError or IDB unavailable - in-memory only for this session.
    if (import.meta.env.DEV) {
      console.warn('[idb] Write failed (degrading to in-memory):', err?.name);
    }
  }
}

/**
 * Clears all entries from the cache object store.
 * Used to force a fresh bootstrap on the next page load.
 *
 * @returns {Promise<void>}
 */
export async function clearCache() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Silent - nothing to clear if IDB is unavailable.
  }
}
