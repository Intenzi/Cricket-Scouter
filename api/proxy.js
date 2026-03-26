/**
 * api/proxy.js
 *
 * Vercel Serverless Function to proxy requests to SportMonks API while hiddenly injecting the API token.
 * This keeps the token secret on the server-side and never exposes it to the browser.
 */

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(200).end();
  }

  // Use protocol + host for URL constructor; req.url is just the path part
  const host = req.headers.host || 'localhost';
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const incomingUrl = new URL(req.url, `${protocol}://${host}`);

  // Base URL for SportMonks v2
  const SPORTMONKS_BASE = 'https://cricket.sportmonks.com/api/v2.0/';

  // Get the target path. In Vercel deployments, we'll pass this via a query param in vercel.json
  // Fallback to stripping the prefix from the URL for local testing/direct calls
  let targetPath = req.query.proxyPath || req.url.replace(/^\/api-proxy\/?/, '');
  
  // Ensure we don't have leading slashes that might cause double-slashes in the final URL
  targetPath = targetPath.replace(/^\//, '');

  const targetUrl = new URL(targetPath, SPORTMONKS_BASE);

  // Inject the server-side only token
  const apiToken = process.env.SPORTMONKS_TOKEN;
  if (!apiToken) {
    return res
      .status(401)
      .json({ error: 'Config Error: SPORTMONKS_TOKEN is missing on the server.' });
  }
  targetUrl.searchParams.set('api_token', apiToken);

  // Preserve existing query params from the client, skipping the internal proxyPath
  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== 'proxyPath') {
      targetUrl.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(targetUrl.toString());
    const data = await response.json();

    // CORS headers just in case
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    res.status(response.status).json(data);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[proxy] Failed to fetch from SportMonks:', error);
    }
    res.status(500).json({ error: 'Failed to fetch from upstream provider.' });
  }
}
