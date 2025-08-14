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
      '/s3-proxy': {
        target: 'https://ddsfocustime.s3.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/s3-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('S3 proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying S3 Request:', req.url);
            proxyReq.setHeader('origin', 'https://ddsfocustime.s3.amazonaws.com');
          });
        },
      }
    }
  }
})
