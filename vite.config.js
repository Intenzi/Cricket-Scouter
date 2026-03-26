import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env vars from .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api-proxy': {
          target: 'https://cricket.sportmonks.com/api/v2.0',
          changeOrigin: true,
          // In development, the Vite proxy needs to inject the token manually
          // because we removed it from the frontend client.js for security.
          rewrite: (path) => path.replace(/^\/api-proxy/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (!env.SPORTMONKS_TOKEN) {
                console.warn('\n⚠️  [PROXY WARN] SPORTMONKS_TOKEN is missing from your .env file!');
                console.warn('The API proxy will fail with 401 Unauthorized.\n');
              }
              const url = new URL(proxyReq.path, 'https://localhost');
              url.searchParams.set('api_token', env.SPORTMONKS_TOKEN);
              proxyReq.path = url.pathname + url.search;
            });
          },
        },
      },
    },
  };
})
