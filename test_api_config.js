// Test script to verify API configuration is working with production URL
import { getApiBaseURL, buildApiUrl, API_ENDPOINTS } from './src/config/api.js';

console.log('🧪 Testing API Configuration');
console.log('=' .repeat(50));

// Test environment detection
console.log('🌐 Environment Variables:');
console.log('  VITE_API_URL:', import.meta.env?.VITE_API_URL || 'Not set');
console.log('  NODE_ENV:', import.meta.env?.NODE_ENV || 'Not set');
console.log('  DEV mode:', import.meta.env?.DEV || 'Not set');

// Test API URL generation
console.log('\n🔗 API URL Generation:');
console.log('  Base URL:', getApiBaseURL());
console.log('  Live Tracking URL:', buildApiUrl(API_ENDPOINTS.LIVE_TRACKING.SCREENSHOTS));
console.log('  Logs Search URL:', buildApiUrl(API_ENDPOINTS.LOGS.SEARCH));

// Test hostname detection
console.log('\n🖥️  Hostname Detection:');
console.log('  Current hostname:', window?.location?.hostname || 'Not available (Node.js)');
console.log('  Is localhost?:', 
  window?.location?.hostname === 'localhost' || 
  window?.location?.hostname?.startsWith('127.0.') || 
  'Cannot determine (Node.js)'
);

console.log('\n✅ API Configuration Test Complete');
