// User API Debugger Utility
// This utility helps debug user search API issues

import { getApiBaseURL } from '../config/api';

/**
 * Test all available user API endpoints and log results
 */
export const testUserAPIs = async () => {
  const apiBaseURL = getApiBaseURL();
  console.log('🔍 Starting comprehensive user API test...');
  console.log('📡 API Base URL:', apiBaseURL);
  
  const endpoints = [
    {
      name: 'Users Search All (*)',
      url: `${apiBaseURL}/users/search/?q=*&page=1&page_size=500`,
      description: 'Get all users with wildcard search'
    },
    {
      name: 'Users Search All (pages 1-5)',
      url: `${apiBaseURL}/users/search/?q=*&page_size=200`,
      description: 'Get all users across multiple pages',
      multiPage: true
    },
    {
      name: 'Users Direct',
      url: `${apiBaseURL}/users/?page=1&page_size=500`,
      description: 'Direct users endpoint'
    },
    {
      name: 'Employees',
      url: `${apiBaseURL}/employees/`,
      description: 'Employees endpoint'
    },
    {
      name: 'Users Search by Letter',
      url: `${apiBaseURL}/users/search/?q=a&page=1&page_size=100`,
      description: 'Search users starting with "a"'
    }
  ];

  let allFoundUsers = new Set();
  
  for (const endpoint of endpoints) {
    console.log(`\n🧪 Testing: ${endpoint.name}`);
    console.log(`🔗 URL: ${endpoint.url}`);
    
    try {
      let users = [];
      
      if (endpoint.multiPage) {
        // Test multiple pages
        for (let page = 1; page <= 5; page++) {
          const pageUrl = `${endpoint.url}&page=${page}`;
          console.log(`   📄 Fetching page ${page}: ${pageUrl}`);
          
          const response = await fetch(pageUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Page ${page} Response:`, data);
            
            let pageUsers = [];
            if (data.status === 'success' && data.data && data.data.users) {
              pageUsers = data.data.users;
            } else if (data.results && Array.isArray(data.results)) {
              pageUsers = data.results;
            } else if (Array.isArray(data)) {
              pageUsers = data;
            }
            
            console.log(`   📊 Page ${page}: Found ${pageUsers.length} users`);
            users = users.concat(pageUsers);
            
            // If we got less than page size, we're done
            if (pageUsers.length < 200) {
              console.log(`   🏁 Page ${page} had ${pageUsers.length} users (less than 200), stopping pagination`);
              break;
            }
          } else {
            console.log(`   ❌ Page ${page} failed with status:`, response.status);
            break;
          }
        }
      } else {
        // Single request
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📊 Response status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📄 Raw response:`, data);
          
          // Parse different response formats
          if (data.status === 'success' && data.data && data.data.users) {
            users = data.data.users;
          } else if (data.results && Array.isArray(data.results)) {
            users = data.results;
          } else if (Array.isArray(data)) {
            users = data;
          } else if (data.users && Array.isArray(data.users)) {
            users = data.users;
          }
        }
      }
      
      console.log(`✅ ${endpoint.name}: Found ${users.length} users`);
      
      if (users.length > 0) {
        console.log(`👥 Sample users:`, users.slice(0, 5).map(u => ({
          id: u.id,
          email: u.email,
          display_name: u.display_name,
          name: u.name
        })));
        
        // Add to master list
        users.forEach(user => {
          if (user.email) {
            allFoundUsers.add(user.email);
          }
        });
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.name} error:`, error.message);
    }
  }
  
  console.log(`\n🎯 SUMMARY:`);
  console.log(`📊 Total unique users found: ${allFoundUsers.size}`);
  console.log(`📋 All user emails:`, Array.from(allFoundUsers).sort());
  
  // Check for specific missing users
  const missingUsers = [
    'gulaysencer95@gmail.com',
    'metinagacdelen@gmail.com', 
    'haseebcodejourney@gmail.com',
    'mohsinabbass688630@gmail.com',
    'nawaz@dxdglobal.com',
    'shahlar1design@gmail.com',
    'tugbacalik84@gmail.com'
  ];
  
  console.log(`\n🔍 Checking for specific users:`);
  missingUsers.forEach(email => {
    const found = allFoundUsers.has(email);
    console.log(`${found ? '✅' : '❌'} ${email}: ${found ? 'FOUND' : 'NOT FOUND'}`);
  });
  
  return Array.from(allFoundUsers);
};

/**
 * Simple function to call from browser console
 */
window.testUserAPIs = testUserAPIs;

export default { testUserAPIs };