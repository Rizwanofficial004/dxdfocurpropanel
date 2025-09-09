const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 8001;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Backend API Configuration
const BACKEND_API_BASE = 'http://127.0.0.1:8000';

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test backend connection
    const response = await axios.get(`${BACKEND_API_BASE}/api/health`, { timeout: 3000 });
    res.json({ 
      status: 'OK', 
      message: 'Proxy Server connected to backend',
      backend_status: 'connected',
      backend_api: BACKEND_API_BASE,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      message: 'Proxy Server running (backend disconnected)',
      backend_status: 'disconnected',
      backend_api: BACKEND_API_BASE,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for user search - forwards to real backend
app.get('/api/users/search/', async (req, res) => {
  try {
    console.log(`🔍 Proxying search request to backend:`, req.query);
    
    // Forward request to real backend API
    const backendUrl = `${BACKEND_API_BASE}/api/users/search/`;
    const response = await axios.get(backendUrl, { 
      params: req.query,
      timeout: 30000 
    });

    console.log(`✅ Backend response: ${response.status}`);
    console.log(`📊 Found ${response.data?.data?.users?.length || 0} users`);

    // Forward the response
    res.json(response.data);
  } catch (error) {
    console.error('❌ Backend API error:', error.message);
    
    // Return error response with fallback
    res.status(500).json({
      status: 'error',
      message: `Backend API not available: ${error.message}`,
      backend_api: BACKEND_API_BASE,
      suggestion: 'Make sure your backend server is running on port 8000',
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for user list
app.get('/api/users/list', async (req, res) => {
  try {
    console.log(`📋 Proxying list request to backend:`, req.query);
    
    const backendUrl = `${BACKEND_API_BASE}/api/users/list/`;
    const response = await axios.get(backendUrl, { 
      params: req.query,
      timeout: 10000 
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ Backend list API error:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: `Backend API not available: ${error.message}`,
      backend_api: BACKEND_API_BASE
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend Proxy Server running on port ${PORT}`);
  console.log(`🔗 Forwarding to: ${BACKEND_API_BASE}`);
  console.log(`📊 Endpoints:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/users/search/ - Search users (proxied to backend)`);
  console.log(`   GET /api/users/list - List users (proxied to backend)`);
  console.log(`\n💡 Make sure your backend server is running on port 8000!`);
});
