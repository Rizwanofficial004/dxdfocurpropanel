import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['dxdtime.ddsolutions.io', 'localhost', '127.0.0.1']
  },
  server: {
    host: true,
    allowedHosts: ['dxdtime.ddsolutions.io', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'https://dxdtime.ddsolutions.io',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/crm-api': {
        target: 'https://crm.deluxebilisim.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/crm-api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('CRM proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying CRM Request:', req.url);
            // Add the auth token to all CRM requests
            proxyReq.setHeader('authtoken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o');
            proxyReq.setHeader('User-Agent', 'DDS-Focus-Time-Dashboard/1.0');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('CRM Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/users_screenshots': {
        target: 'https://ddsfocustime.s3.eu-north-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          console.log('📸 Rewriting users_screenshots path:', path);
          return path; // Keep the full path as-is
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Users screenshots proxy error:', err.message, 'for URL:', req.url);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Image not found');
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🖼️ Proxying Users Screenshots:', req.url);
            // Clean headers for S3 compatibility
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('authorization');
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Users Screenshots Response:', proxyRes.statusCode, req.url);
            // Add CORS headers
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET';
            proxyRes.headers['Cache-Control'] = 'public, max-age=31536000';
          });
        },
      },
      '/s3-proxy': {
        target: 'https://ddsfocustime.s3.eu-north-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/s3-proxy\//, '/'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('S3 proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying S3 Request:', req.url);
            // Remove problematic headers
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('x-forwarded-for');
            proxyReq.removeHeader('x-forwarded-host');
            proxyReq.removeHeader('x-forwarded-proto');
            // Set appropriate headers for S3
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('S3 Response:', proxyRes.statusCode, req.url);
            // Add CORS headers to the response
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = '*';
          });
        },
      },
    }
  }
})
