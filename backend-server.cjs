const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8000;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Mock users data with screenshots
const mockUsers = [
  {
    id: 1,
    email: 'haseebcodejourney@gmail.com',
    display_name: 'haseebcodejourney',
    original_name: 'haseebcodejourney_at_gmail.com',
    total_screenshots: 10,
    total_size_mb: 1.52,
    active_days_count: 2,
    status: 'active',
    screenshots: [
      {
        id: 1,
        screenshot_url: 'https://picsum.photos/1920/1080?random=1',
        thumbnail_url: 'https://picsum.photos/400/300?random=1',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        date: '2025-09-10',
        datetime: new Date(Date.now() - 1800000).toISOString(),
        size_mb: 0.8,
        description: 'Working on dashboard layout',
        filename: 'dashboard_work_001.png'
      },
      {
        id: 2,
        screenshot_url: 'https://picsum.photos/1920/1080?random=2',
        thumbnail_url: 'https://picsum.photos/400/300?random=2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        date: '2025-09-10',
        datetime: new Date(Date.now() - 3600000).toISOString(),
        size_mb: 0.72,
        description: 'Code review session',
        filename: 'code_review_002.png'
      },
      {
        id: 7,
        screenshot_url: 'https://picsum.photos/1920/1080?random=7',
        thumbnail_url: 'https://picsum.photos/400/300?random=7',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        date: '2025-09-09',
        datetime: new Date(Date.now() - 5400000).toISOString(),
        size_mb: 0.65,
        description: 'Testing new features',
        filename: 'testing_003.png'
      }
    ]
  },
  {
    id: 2,
    email: 'kiranaiz4@gmail.com',
    display_name: 'kiranaiz4',
    original_name: 'kiranaiz4_at_gmail.com',
    total_screenshots: 53,
    total_size_mb: 7.96,
    active_days_count: 1,
    status: 'inactive',
    screenshots: [
      {
        id: 3,
        screenshot_url: 'https://picsum.photos/1920/1080?random=3',
        thumbnail_url: 'https://picsum.photos/400/300?random=3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        date: '2025-09-09',
        datetime: new Date(Date.now() - 7200000).toISOString(),
        size_mb: 0.95,
        description: 'Database optimization work',
        filename: 'database_opt_001.png'
      },
      {
        id: 8,
        screenshot_url: 'https://picsum.photos/1920/1080?random=8',
        thumbnail_url: 'https://picsum.photos/400/300?random=8',
        timestamp: new Date(Date.now() - 9000000).toISOString(),
        date: '2025-09-08',
        datetime: new Date(Date.now() - 9000000).toISOString(),
        size_mb: 1.1,
        description: 'Backend API development',
        filename: 'backend_api_001.png'
      }
    ]
  },
  {
    id: 3,
    email: 'nawaz@dxdglobal.com',
    display_name: 'nawaz',
    original_name: 'nawaz_at_dxdglobal.com',
    total_screenshots: 475,
    total_size_mb: 88.29,
    active_days_count: 1,
    status: 'inactive',
    screenshots: [
      {
        id: 4,
        screenshot_url: 'https://picsum.photos/1920/1080?random=4',
        thumbnail_url: 'https://picsum.photos/400/300?random=4',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        date: '2025-09-09',
        datetime: new Date(Date.now() - 10800000).toISOString(),
        size_mb: 1.2,
        description: 'Frontend component development',
        filename: 'frontend_comp_001.png'
      },
      {
        id: 5,
        screenshot_url: 'https://picsum.photos/1920/1080?random=5',
        thumbnail_url: 'https://picsum.photos/400/300?random=5',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        date: '2025-09-08',
        datetime: new Date(Date.now() - 14400000).toISOString(),
        size_mb: 0.88,
        description: 'API integration testing',
        filename: 'api_integration_001.png'
      },
      {
        id: 6,
        screenshot_url: 'https://picsum.photos/1920/1080?random=6',
        thumbnail_url: 'https://picsum.photos/400/300?random=6',
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        date: '2025-09-08',
        datetime: new Date(Date.now() - 18000000).toISOString(),
        size_mb: 1.1,
        description: 'UI/UX improvements',
        filename: 'ui_ux_improvements_001.png'
      },
      {
        id: 9,
        screenshot_url: 'https://picsum.photos/1920/1080?random=9',
        thumbnail_url: 'https://picsum.photos/400/300?random=9',
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        date: '2025-09-07',
        datetime: new Date(Date.now() - 21600000).toISOString(),
        size_mb: 0.93,
        description: 'Performance optimization',
        filename: 'performance_opt_001.png'
      }
    ]
  }
];

// Mock CRM comprehensive data
const mockCrmData = {
  stats: {
    totalCustomers: 1250,
    activeCustomers: 890,
    newCustomers: 42,
    totalRevenue: 145600,
    avgOrderValue: 89.50,
    conversionRate: 3.2,
    customerSatisfaction: 4.7,
    totalOrders: 1628
  },
  recentActivities: [
    {
      id: 1,
      type: 'new_customer',
      customer_name: 'John Smith',
      action: 'Customer registered',
      timestamp: new Date().toISOString(),
      value: null
    },
    {
      id: 2,
      type: 'order',
      customer_name: 'Sarah Johnson',
      action: 'Placed order #ORD-1234',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      value: 125.99
    },
    {
      id: 3,
      type: 'support',
      customer_name: 'Mike Wilson',
      action: 'Support ticket created',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      value: null
    },
    {
      id: 4,
      type: 'order',
      customer_name: 'Emma Davis',
      action: 'Placed order #ORD-1235',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      value: 89.50
    },
    {
      id: 5,
      type: 'new_customer',
      customer_name: 'David Brown',
      action: 'Customer registered',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      value: null
    }
  ],
  topCustomers: [
    {
      id: 1,
      name: 'Alice Cooper',
      email: 'alice.cooper@email.com',
      total_orders: 15,
      total_spent: 2340.50,
      last_order: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob.smith@email.com',
      total_orders: 12,
      total_spent: 1890.25,
      last_order: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 3,
      name: 'Carol Johnson',
      email: 'carol.j@email.com',
      total_orders: 10,
      total_spent: 1650.75,
      last_order: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 4,
      name: 'Daniel Wilson',
      email: 'daniel.w@email.com',
      total_orders: 8,
      total_spent: 1234.00,
      last_order: new Date(Date.now() - 345600000).toISOString()
    }
  ],
  salesChart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12000, 15000, 18000, 14000, 22000, 25000],
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2
      }
    ]
  },
  customerGrowth: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Customers',
        data: [45, 52, 61, 48, 67, 73],
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      }
    ]
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'DDS CRM Mock Backend'
  });
});

// CRM comprehensive data endpoint
app.get('/api/dashboard/crm-comprehensive/', (req, res) => {
  console.log('Serving CRM comprehensive data');
  res.json(mockCrmData);
});

// Authentication endpoints (basic mock)
app.post('/api/auth/login/', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);
  
  // Simple mock authentication
  if (username && password) {
    res.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        username: username,
        name: username === 'admin' ? 'Admin User' : 'Test User',
        email: `${username}@dds.com`,
        role: username === 'admin' ? 'Administrator' : 'User'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Username and password required'
    });
  }
});

// User profile endpoint
app.get('/api/user/profile/', (req, res) => {
  res.json({
    id: 1,
    username: 'admin',
    name: 'Admin User',
    email: 'admin@dds.com',
    role: 'Administrator'
  });
});

// Dashboard employees endpoint
app.get('/api/dashboard/employees/enhanced/', (req, res) => {
  res.json({
    employees: [
      {
        id: 1,
        name: 'John Doe',
        department: 'Sales',
        status: 'active',
        last_activity: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Jane Smith',
        department: 'Marketing',
        status: 'active',
        last_activity: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    total: 2
  });
});

// User search endpoint for ActivityStream
app.get('/api/users/search/', (req, res) => {
  const { q, page = 1, page_size = 50, group_by, month, year, start_date, end_date } = req.query;
  
  console.log('User search request:', { q, page, page_size, group_by, month, year, start_date, end_date });
  
  let filteredUsers = mockUsers;
  
  // Filter by search query if provided
  if (q && q.trim()) {
    const query = q.toLowerCase();
    filteredUsers = mockUsers.filter(user => 
      user.display_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.original_name && user.original_name.toLowerCase().includes(query))
    );
  }
  
  // Filter screenshots by date if date filters are provided
  const usersWithFilteredScreenshots = filteredUsers.map(user => {
    let screenshots = user.screenshots || [];
    
    if (start_date && end_date) {
      screenshots = screenshots.filter(screenshot => {
        const screenshotDate = screenshot.date;
        return screenshotDate >= start_date && screenshotDate <= end_date;
      });
    } else if (month && year) {
      screenshots = screenshots.filter(screenshot => {
        const screenshotDate = screenshot.date;
        return screenshotDate.startsWith(`${year}-${month.padStart(2, '0')}`);
      });
    }
    
    // Group screenshots by date for proper API structure
    const screenshotsByDate = {};
    screenshots.forEach(screenshot => {
      const date = screenshot.date;
      if (!screenshotsByDate[date]) {
        screenshotsByDate[date] = {
          date: date,
          total_screenshots: 0,
          total_size_mb: 0,
          screenshots: []
        };
      }
      screenshotsByDate[date].screenshots.push(screenshot);
      screenshotsByDate[date].total_screenshots++;
      screenshotsByDate[date].total_size_mb += screenshot.size_mb || 0;
    });
    
    // Convert to array format
    const groupedScreenshots = Object.values(screenshotsByDate);
    
    return {
      ...user,
      screenshots: groupedScreenshots,
      total_screenshots: screenshots.length,
      filtered_screenshots_count: screenshots.length,
      activity_data: {
        total_days: groupedScreenshots.length,
        total_screenshots: screenshots.length,
        total_size_mb: screenshots.reduce((sum, s) => sum + (s.size_mb || 0), 0)
      }
    };
  });
  
  // Pagination
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + parseInt(page_size);
  const paginatedUsers = usersWithFilteredScreenshots.slice(startIndex, endIndex);
  
  res.json({
    status: 'success',
    data: {
      users: paginatedUsers,
      pagination: {
        current_page: parseInt(page),
        page_size: parseInt(page_size),
        total_users: usersWithFilteredScreenshots.length,
        total_pages: Math.ceil(usersWithFilteredScreenshots.length / page_size)
      },
      query_info: {
        search_query: q,
        month,
        year,
        start_date,
        end_date
      }
    },
    message: `Found ${usersWithFilteredScreenshots.length} users`
  });
});

// Live tracking screenshots endpoint
app.get('/api/live-tracking/fast-screenshots/', (req, res) => {
  const { user_email, date, page = 1, page_size = 50 } = req.query;
  
  console.log('Screenshots request:', { user_email, date, page, page_size });
  
  // Find user by email
  const user = mockUsers.find(u => 
    u.email === user_email || 
    u.display_name === user_email ||
    u.original_name === user_email
  );
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found',
      data: { screenshots: [] }
    });
  }
  
  let screenshots = user.screenshots || [];
  
  // Filter by date if provided
  if (date) {
    screenshots = screenshots.filter(screenshot => screenshot.date === date);
  }
  
  // Pagination
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + parseInt(page_size);
  const paginatedScreenshots = screenshots.slice(startIndex, endIndex);
  
  res.json({
    status: 'success',
    data: {
      screenshots: paginatedScreenshots,
      user: {
        email: user.email,
        display_name: user.display_name,
        total_screenshots: user.total_screenshots
      },
      pagination: {
        current_page: parseInt(page),
        page_size: parseInt(page_size),
        total_screenshots: screenshots.length,
        total_pages: Math.ceil(screenshots.length / page_size)
      }
    },
    message: `Found ${screenshots.length} screenshots for user ${user.display_name}`
  });
});

// Catch-all for missing endpoints
app.use('/api/*', (req, res) => {
  console.log(`Unhandled API endpoint: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} is not implemented in the mock server`,
    available_endpoints: [
      'GET /api/health',
      'GET /api/dashboard/crm-comprehensive/',
      'POST /api/auth/login/',
      'GET /api/user/profile/',
      'GET /api/dashboard/employees/enhanced/',
      'GET /api/users/search/',
      'GET /api/live-tracking/fast-screenshots/'
    ]
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 DDS CRM Mock Backend Server running on http://127.0.0.1:${PORT}`);
  console.log(`📊 CRM API available at: http://127.0.0.1:${PORT}/api/dashboard/crm-comprehensive/`);
  console.log(`🔍 Health check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`📝 Available endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/dashboard/crm-comprehensive/`);
  console.log(`   - POST /api/auth/login/`);
  console.log(`   - GET  /api/user/profile/`);
  console.log(`   - GET  /api/dashboard/employees/enhanced/`);
  console.log(`   - GET  /api/users/search/ (for ActivityStream)`);
  console.log(`   - GET  /api/live-tracking/fast-screenshots/ (for screenshots)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server gracefully...');
  process.exit(0);
});
