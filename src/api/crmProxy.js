// CRM API Proxy - Bypasses CORS by making server-side requests
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PROXY_PORT || 8080;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authtoken'],
  credentials: true
}));

app.use(express.json());

// CRM Staff API Proxy Endpoint
app.get('/api/crm/staffs', async (req, res) => {
  console.log('🔄 CRM Proxy: Fetching staff data from CRM API...');
  
  try {
    const crmResponse = await fetch('https://crm.deluxebilisim.com/api/staffs', {
      method: 'GET',
      headers: {
        'authtoken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
      },
      timeout: 30000
    });

    if (!crmResponse.ok) {
      console.error('❌ CRM API Error:', crmResponse.status, crmResponse.statusText);
      return res.status(crmResponse.status).json({
        error: 'CRM API Error',
        status: crmResponse.status,
        message: crmResponse.statusText
      });
    }

    const crmData = await crmResponse.json();
    console.log(`✅ CRM Proxy: Successfully fetched ${Array.isArray(crmData) ? crmData.length : 'unknown'} staff records`);
    
    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, authtoken');
    
    res.json({
      success: true,
      data: crmData,
      count: Array.isArray(crmData) ? crmData.length : 1,
      timestamp: new Date().toISOString(),
      source: 'CRM API via Proxy'
    });

  } catch (error) {
    console.error('❌ CRM Proxy Error:', error);
    res.status(500).json({
      error: 'Proxy Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'CRM Proxy Server',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, authtoken');
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 CRM Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying CRM API requests to bypass CORS`);
  console.log(`🔗 Frontend can now call: http://localhost:${PORT}/api/crm/staffs`);
});

export default app;
