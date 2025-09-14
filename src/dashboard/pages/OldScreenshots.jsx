import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';

const OldScreenshots = () => {
  const themeContext = useTheme();
  const { isDarkMode = false, theme = {} } = themeContext || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Top 6 users with their screenshot counts for August 2025
  const topUsers = [
    { value: '', label: 'Select a user to view screenshots', searchName: '', count: 0, displayEmail: '' },
    { value: 'ilahe@dxdglobal.com', label: 'ilahe@dxdglobal.com (9,999 screenshots)', searchName: 'ilahe_at_dxdglobal.com', count: 9999, displayEmail: 'ilahe@dxdglobal.com' },
    { value: 'gulsummelisa.23@gmail.com', label: 'gulsummelisa.23@gmail.com (7,383 screenshots)', searchName: 'gulsummelisa.23_at_gmail.com', count: 7383, displayEmail: 'gulsummelisa.23@gmail.com' },
    { value: 'begumdamlasen@gmail.com', label: 'begumdamlasen@gmail.com (4,705 screenshots)', searchName: 'begumdamlasen_at_gmail.com', count: 4705, displayEmail: 'begumdamlasen@gmail.com' },
    { value: 'cagla.shr@gmail.com', label: 'cagla.shr@gmail.com (4,082 screenshots)', searchName: 'cagla.shr_at_gmail.com', count: 4082, displayEmail: 'cagla.shr@gmail.com' },
    { value: 'atakankahraman35@outlook.com', label: 'atakankahraman35@outlook.com (3,680 screenshots)', searchName: 'atakankahraman35_at_outlook.com', count: 3680, displayEmail: 'atakankahraman35@outlook.com' },
    { value: 'kadircagtas@gmail.com', label: 'kadircagtas@gmail.com (1,734 screenshots)', searchName: 'kadircagtas_at_gmail.com', count: 1734, displayEmail: 'kadircagtas@gmail.com' }
  ];

  const fetchUserScreenshots = async (searchName, page = 1) => {
    if (!searchName) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use proxy to avoid CORS issues
      const baseUrl = '/api/users/screenshots/';
      const params = new URLSearchParams({
        q: searchName,
        page: page,
        page_size: 12 // Show 12 screenshots per page
      });
      
      const fullUrl = `${baseUrl}?${params}`;
      console.log('🔍 Fetching screenshots via proxy:', fullUrl);
      console.log('📊 Search parameters:', { searchName, page, pageSize: 12 });
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      if (data.status === 'success' && data.data) {
        const screenshots = Array.isArray(data.data.screenshots) ? data.data.screenshots : [];
        const totalCount = data.data.total_count || 0;
        const totalPages = Math.ceil(totalCount / 12);
        
        console.log(`📸 Found ${totalCount} total screenshots, showing page ${page} of ${totalPages}`);
        console.log(`🖼️ Screenshots on this page: ${screenshots.length}`);
        
        setScreenshots(screenshots);
        setTotalCount(totalCount);
        setTotalPages(totalPages);
        setCurrentPage(page);
      } else {
        console.log('❌ Invalid API response structure:', data);
        setScreenshots([]);
        setTotalCount(0);
        setTotalPages(0);
      }
      
    } catch (err) {
      console.error(`❌ Error fetching screenshots:`, err);
      setError(`Failed to load screenshots: ${err.message}`);
      setScreenshots([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (event) => {
    const userEmail = event.target.value;
    setSelectedUser(userEmail);
    
    if (userEmail) {
      const user = topUsers.find(u => u.value === userEmail);
      if (user && user.searchName) {
        setCurrentPage(1);
        fetchUserScreenshots(user.searchName, 1);
      }
    } else {
      setScreenshots([]);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalCount(0);
    }
  };

  const handlePageChange = (page) => {
    if (selectedUser) {
      const user = topUsers.find(u => u.value === selectedUser);
      if (user && user.searchName) {
        fetchUserScreenshots(user.searchName, page);
      }
    }
  };

  const getInitials = (email) => {
    if (!email) return '';
    const parts = email.split('@')[0];
    return parts.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const testAllUsers = async () => {
    console.log('🧪 Testing all 6 users via proxy...');
    
    for (const user of topUsers.slice(1)) { // Skip the first empty option
      console.log(`\n🔍 Testing user: ${user.displayEmail} (${user.searchName})`);
      
      try {
        // Use proxy to avoid CORS issues
        const baseUrl = '/api/users/screenshots/';
        const params = new URLSearchParams({
          q: user.searchName,
          page: 1,
          page_size: 5 // Just get a few for testing
        });
        
        const response = await fetch(`${baseUrl}?${params}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          console.log(`✅ ${user.displayEmail}: ${data.data.total_count} screenshots found`);
        } else {
          console.log(`❌ ${user.displayEmail}: No data returned`, data);
        }
      } catch (err) {
        console.log(`❌ ${user.displayEmail}: Error - ${err.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ User testing completed! Check console for results.');
  };

  return (
    <DashboardLayout>
      <div style={{ 
        padding: '24px', 
        background: isDarkMode ? theme.colors?.background || '#1a1d29' : '#f8fafc', 
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#1e293b',
            margin: '0 0 8px 0'
          }}>
            Top Users Screenshots (August 2025)
          </h1>
          <p style={{ 
            color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#64748b', 
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            Select a user to view their activity stream
          </p>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '24px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Year Dropdown */}
          <select style={{
            padding: '8px 12px',
            border: `1px solid ${isDarkMode ? theme.colors?.border || '#374151' : '#d1d5db'}`,
            borderRadius: '6px',
            background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
            fontSize: '14px',
            color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151',
            minWidth: '80px'
          }}>
            <option>2025</option>
          </select>

          {/* Month Dropdown */}
          <select style={{
            padding: '8px 12px',
            border: `1px solid ${isDarkMode ? theme.colors?.border || '#374151' : '#d1d5db'}`,
            borderRadius: '6px',
            background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
            fontSize: '14px',
            color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151',
            minWidth: '80px'
          }}>
            <option>AUG</option>
          </select>

          {/* User Dropdown */}
          <select 
            value={selectedUser}
            onChange={handleUserChange}
            style={{
              padding: '8px 12px',
              border: `1px solid ${isDarkMode ? theme.colors?.border || '#374151' : '#d1d5db'}`,
              borderRadius: '6px',
              background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
              fontSize: '14px',
              color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151',
              minWidth: '300px',
              flex: 1
            }}
          >
            {topUsers.map((user, index) => (
              <option key={index} value={user.value}>
                {user.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Left Side - User Info (when user selected) */}
          {selectedUser && (
            <div style={{ width: '280px' }}>
              <div style={{
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`,
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getAvatarColor(selectedUser),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    {getInitials(selectedUser)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#1f2937' }}>
                      {selectedUser.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '12px', color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>
                      {selectedUser}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '12px', 
                  color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280',
                  textAlign: 'center',
                  padding: '12px 0'
                }}>
                  Found {totalCount} screenshot(s) for August 2025
                  <br />
                  {selectedUser && 'Select to view their activity stream'}
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Screenshots Grid */}
          <div style={{ flex: 1 }}>
            
            {/* Error State */}
            {error && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#ef4444' : '#fecaca'}`,
                color: '#dc2626'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3>Error Loading Screenshots</h3>
                <p>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <h3 style={{ color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151' }}>Loading Screenshots...</h3>
                <p style={{ color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>Fetching August 2025 data</p>
              </div>
            )}

            {/* Screenshots Grid */}
            {!loading && !error && screenshots.length > 0 && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {screenshots.map((screenshot, index) => (
                    <div
                      key={screenshot.full_key || index}
                      style={{
                        background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                        borderRadius: '8px',
                        border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        ':hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                      onClick={() => screenshot.screenshot_url && window.open(screenshot.screenshot_url, '_blank')}
                    >
                      <div style={{
                        height: '150px',
                        background: screenshot.screenshot_url 
                          ? `url(${screenshot.screenshot_url}) center/cover`
                          : (isDarkMode ? '#4b5563' : '#f3f4f6'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {!screenshot.screenshot_url && (
                          <div style={{ fontSize: '24px', color: '#9ca3af' }}>📷</div>
                        )}
                      </div>
                      <div style={{ padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280', marginBottom: '4px' }}>
                          {screenshot.datetime}
                        </div>
                        <div style={{ fontSize: '11px', color: isDarkMode ? theme.colors?.text?.light || '#6b7280' : '#9ca3af' }}>
                          {screenshot.size_mb}MB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '24px'
                  }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: currentPage <= 1 ? (isDarkMode ? '#374151' : '#f9fafb') : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                        color: currentPage <= 1 ? (isDarkMode ? '#6b7280' : '#9ca3af') : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#d1d5db'}`,
                            borderRadius: '6px',
                            background: currentPage === pageNum ? '#3b82f6' : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                            color: currentPage === pageNum ? 'white' : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                            cursor: 'pointer',
                            fontSize: '14px',
                            minWidth: '40px'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: currentPage >= totalPages ? (isDarkMode ? '#374151' : '#f9fafb') : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                        color: currentPage >= totalPages ? (isDarkMode ? '#6b7280' : '#9ca3af') : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && screenshots.length === 0 && selectedUser && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <h3 style={{ color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151' }}>No Screenshots Found</h3>
                <p style={{ color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>No screenshots available for this user in August 2025</p>
              </div>
            )}

            {/* Default State */}
            {!selectedUser && (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`
              }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>👥</div>
                <h3 style={{ color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151', marginBottom: '8px' }}>Select a User</h3>
                <p style={{ color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>Choose a user from the dropdown to view their August 2025 screenshots</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OldScreenshots;
