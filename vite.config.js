import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Proxy requests from /auth-api to your VITE_AUTH_API_BASE
        '/auth-api': {
          target: env.VITE_AUTH_API_BASE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/auth-api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`[Vite Proxy] /auth-api: Forwarding request from ${req.url} to ${options.target}${proxyReq.path}`);
            });
            proxy.on('error', (err, req, res) => {
              console.error('[Vite Proxy] /auth-api Error:', err);
            });
          }
        },
        // Proxy requests from /data-api to your VITE_DATA_API_BASE
        '/data-api': {
          target: env.VITE_DATA_API_BASE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/data-api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`[Vite Proxy] /data-api: Forwarding request from ${req.url} to ${options.target}${proxyReq.path}`);
            });
            proxy.on('error', (err, req, res) => {
              console.error('[Vite Proxy] /data-api Error:', err);
            });
          }
        },
        // Proxy requests from /report-api to your VITE_REPORT_API_BASE
        '/report-api': {
          target: env.VITE_REPORT_API_BASE,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/report-api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log(`[Vite Proxy] /report-api: Forwarding request from ${req.url} to ${options.target}${proxyReq.path}`);
            });
            proxy.on('error', (err, req, res) => {
              console.error('[Vite Proxy] /report-api Error:', err);
            });
          }
        },
      },
    },
  }
})
