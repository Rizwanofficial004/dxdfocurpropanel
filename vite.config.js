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
      // Specific proxy for Staff/Details to production server
      '/api/Staff/Details': {
        target: 'https://dxdtime.ddsolutions.io',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Staff Details API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('👥 Staff Details Request to production API:', req.method, req.url);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('👥 Staff Details Response from production API:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Specific proxy for users endpoint to production
      '/api/users': {
        target: 'https://dxdtime.ddsolutions.io',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Users API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('👥 Users Request to production API:', req.method, req.url);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('👥 Users Response from production API:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Specific proxy for employees endpoint to production
      '/api/employees': {
        target: 'https://dxdtime.ddsolutions.io',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Employees API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('👥 Employees Request to production API:', req.method, req.url);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('👥 Employees Response from production API:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Specific proxy for Timesheets to local server (with fresh data)
      '/api/Timesheets': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Timesheets API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📊 Timesheets Request to local API:', req.method, req.url);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Cache-Control', 'no-cache');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📊 Timesheets Response from local API:', proxyRes.statusCode, req.url);
            // Prevent caching of timesheets data
            proxyRes.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
            proxyRes.headers['pragma'] = 'no-cache';
            proxyRes.headers['expires'] = '0';
          });
        },
      },
      // Specific proxy for live-tracking to local server (with fresh data)
      '/api/live-tracking': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Live Tracking API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📸 Live Tracking Request to local API:', req.method, req.url);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Cache-Control', 'no-cache');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📸 Live Tracking Response from local API:', proxyRes.statusCode, req.url);
            // Prevent caching of live tracking data
            proxyRes.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
            proxyRes.headers['pragma'] = 'no-cache';
            proxyRes.headers['expires'] = '0';
          });
        },
      },
      // Specific proxy for screenshots to local server
      '/api/users/screenshots': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Screenshots API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📸 Screenshots Request to local API:', req.method, req.url);
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📸 Screenshots Response from local API:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Default proxy for all other API calls to production server
      '/api': {
        target: 'https://dxdtime.ddsolutions.io',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📡 Sending Request to API:', req.method, req.url);
            // Minimal headers - let the API handle CORS
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Received Response from API:', proxyRes.statusCode, req.url);
            // Let the API's CORS headers pass through unchanged
          });
        },
      },
      '/s3-proxy': {
        target: 'https://ddsfocustime.s3.eu-north-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/s3-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ S3 proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📡 Proxying S3 Request:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ S3 Response:', proxyRes.statusCode, req.url);
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
          // Keep the full path but remove the leading slash
          const newPath = path.startsWith('/') ? path.substring(1) : path;
          console.log('📸 Rewriting path:', path, '→', newPath);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Users screenshots proxy error:', err.message, 'for URL:', req.url);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Image not found');
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🖼️ Proxying Users Screenshots:', req.url);
            // Remove all potentially problematic headers
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            proxyReq.removeHeader('authorization');
            proxyReq.removeHeader('x-forwarded-for');
            proxyReq.removeHeader('x-forwarded-host');
            proxyReq.removeHeader('x-forwarded-proto');
            proxyReq.removeHeader('host');
            proxyReq.removeHeader('connection');
            proxyReq.removeHeader('upgrade-insecure-requests');
            
            // Set headers to mimic a direct browser request
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
            proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
            proxyReq.setHeader('Cache-Control', 'no-cache');
            proxyReq.setHeader('Pragma', 'no-cache');
            proxyReq.setHeader('Sec-Fetch-Dest', 'image');
            proxyReq.setHeader('Sec-Fetch-Mode', 'no-cors');
            proxyReq.setHeader('Sec-Fetch-Site', 'cross-site');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ Users Screenshots Response:', proxyRes.statusCode, req.url);
            
            // Handle different response codes
            if (proxyRes.statusCode === 200) {
              console.log('🎉 Successfully loaded image:', req.url);
            } else if (proxyRes.statusCode === 403) {
              console.log('❌ S3 Access Denied for:', req.url);
            } else if (proxyRes.statusCode === 404) {
              console.log('❌ Image not found:', req.url);
            }
            
            // Add comprehensive CORS headers
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = '*';
            proxyRes.headers['Access-Control-Expose-Headers'] = '*';
            proxyRes.headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
            
            // Set caching headers for images
            if (proxyRes.statusCode === 200) {
              proxyRes.headers['Cache-Control'] = 'public, max-age=86400'; // 24 hours
            }
          });
        },
      },
    }
  }
})
