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
let isBackendConnected = false;

// Test backend connection
async function testBackendConnection() {
  try {
    const response = await axios.get(`${BACKEND_API_BASE}/api/health`, { timeout: 5000 });
    console.log('✅ Backend API connected successfully');
    isBackendConnected = true;
    return true;
  } catch (error) {
    console.log('⚠️  Backend API not available, using mock data mode');
    console.log(`Backend API expected at: ${BACKEND_API_BASE}`);
    isBackendConnected = false;
    return false;
  }
}

// Test connection on startup
testBackendConnection();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const backendStatus = await testBackendConnection();
  res.json({ 
    status: 'OK', 
    message: 'Screenshots Proxy Server is running',
    backend_connected: backendStatus,
    backend_api: BACKEND_API_BASE,
    timestamp: new Date().toISOString()
  });
});

// Proxy endpoint for user search
app.get('/api/users/search/', async (req, res) => {
  try {
    console.log(`🔍 Proxying user search request:`, req.query);
    
    if (!isBackendConnected) {
      // Fallback to mock data if backend is not available
      return res.json({
        status: 'success',
        message: 'Mock data - Backend API not available',
        data: {
          users: [
            {
              email: "nawaz@dxdglobal.com",
              display_name: "nawaz",
              total_screenshots: 0,
              recent_screenshots: [],
              status: "inactive"
            }
          ],
          total_count: 1
        }
      });
    }

    // Forward request to real backend API
    const backendUrl = `${BACKEND_API_BASE}/api/users/search/`;
    const response = await axios.get(backendUrl, { 
      params: req.query,
      timeout: 10000 
    });

    console.log(`✅ Backend API response status: ${response.status}`);
    console.log(`📊 Found ${response.data?.data?.users?.length || 0} users`);

    res.json(response.data);
  } catch (error) {
    console.error('❌ Error proxying to backend API:', error.message);
    
    // Return error response
    res.status(500).json({
      status: 'error',
      message: `Backend API error: ${error.message}`,
      backend_api: BACKEND_API_BASE,
      timestamp: new Date().toISOString()
    });
  }
});

// Proxy endpoint for user list
app.get('/api/users/list', async (req, res) => {
  try {
    console.log(`📋 Proxying user list request:`, req.query);
    
    if (!isBackendConnected) {
      return res.json({
        status: 'success',
        message: 'Mock data - Backend API not available',
        data: {
          users: [
            { email: "nawaz@dxdglobal.com", display_name: "nawaz" },
            { email: "kiranaiza4@gmail.com", display_name: "kiranaiza4" },
            { email: "haseebcodejourney@gmail.com", display_name: "haseebcodejourney" }
          ]
        }
      });
    }

    // Forward to backend API
    const backendUrl = `${BACKEND_API_BASE}/api/users/list/`;
    const response = await axios.get(backendUrl, { 
      params: req.query,
      timeout: 10000 
    });

    res.json(response.data);
  } catch (error) {
    console.error('❌ Error proxying user list to backend API:', error.message);
    
    res.status(500).json({
      status: 'error',
      message: `Backend API error: ${error.message}`,
      backend_api: BACKEND_API_BASE
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Screenshots Proxy Server running on port ${PORT}`);
  console.log(`🔗 Backend API: ${BACKEND_API_BASE}`);
  console.log(`📊 Endpoints available:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/users/search/ - Search users with screenshots`);
  console.log(`   GET /api/users/list - List all users`);
});
