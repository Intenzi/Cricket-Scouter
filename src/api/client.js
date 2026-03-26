/**
 * api/client.js
 * Basic fetch wrapper for SportMonks v2 with error normalization and retries.
 */

class ApiError extends Error {
  constructor(message, status, retryable = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryable = retryable;
  }
}

const TOKEN = import.meta.env.VITE_SPORTMONKS_TOKEN;
// Use a local proxy in development to bypass CORS, otherwise use the direct URL
const BASE_URL = '/api-proxy';

/**
 * Common fetch helper with token and timeout.
 */
export async function client(endpoint, options = {}, retryCount = 0) {
  // Guard for development
  if (!TOKEN && import.meta.env.DEV) {
    console.error('CRITICAL: VITE_SPORTMONKS_TOKEN is missing in .env');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  // Inject token
  // Use a second argument to ensure it works for relative paths (proxy) or absolute URLs
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  url.searchParams.append('api_token', TOKEN);

  try {
    const response = await fetch(url.toString(), {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Rate Limit 429
    if (response.status === 429) {
      // Could read X-RateLimit-Reset here if needed
      throw new ApiError('Rate limit exceeded', 429, false);
    }

    // Auth 401
    if (response.status === 401) {
      throw new ApiError('Authentication failed', 401, false);
    }

    // Retryable status codes (5xx, 408)
    if ([408, 500, 502, 503, 504].includes(response.status) && retryCount === 0) {
      console.warn(`Transient error ${response.status}. Retrying once...`);
      await new Promise((res) => setTimeout(res, 1000));
      return client(endpoint, options, retryCount + 1);
    }

    if (!response.ok) {
      throw new ApiError(
        `API call failed: ${response.statusText}`,
        response.status,
        retryCount === 0
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out after 60 seconds', 408, true);
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message, 500, true);
  }
}
