const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

// S3 proxy middleware
const s3Proxy = createProxyMiddleware({
  target: 'https://ddsfocustime.s3.eu-north-1.amazonaws.com',
  changeOrigin: true,
  secure: true,
  pathRewrite: {
    '^/s3-images': '', // Remove /s3-images prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('🖼️ Proxying S3 request:', req.url);
    // Remove any auth headers that might cause issues
    proxyReq.removeHeader('authorization');
    proxyReq.removeHeader('cookie');
    // Set required headers for S3
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    proxyReq.setHeader('Accept', 'image/webp,image/*,*/*;q=0.8');
    proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
    proxyReq.setHeader('Cache-Control', 'no-cache');
    proxyReq.setHeader('Pragma', 'no-cache');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('✅ S3 Response:', proxyRes.statusCode, req.url);
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    
    // Cache settings for images
    if (proxyRes.statusCode === 200) {
      proxyRes.headers['Cache-Control'] = 'public, max-age=3600';
    }
  },
  onError: (err, req, res) => {
    console.error('❌ S3 Proxy Error:', err.message);
    res.status(500).json({ 
      error: 'S3 Proxy Error', 
      message: err.message,
      url: req.url 
    });
  }
});

// Apply S3 proxy to all /s3-images routes
app.use('/s3-images', s3Proxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'S3 Proxy Server is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'S3 Proxy Server for DXD Focus Panel',
    endpoints: {
      '/s3-images/*': 'Proxy to S3 bucket',
      '/health': 'Health check'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 S3 Proxy Server running on http://localhost:${PORT}`);
  console.log(`📁 Proxying S3 requests from /s3-images/* to ddsfocustime.s3.eu-north-1.amazonaws.com`);
});

module.exports = app;
