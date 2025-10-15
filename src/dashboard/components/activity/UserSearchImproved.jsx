import React, { useState, useEffect } from 'react';

const UserSearchImproved = () => {
  const [query, setQuery] = useState('nawaz');
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState('2025-09-01');
  const [users, setUsers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const url = `http://localhost:8000/api/users/search/?q=${query}&start_date=${startDate}&end_date=${endDate}&limit=${limit}&offset=${offset}`;

    console.log('🔍 Fetching users from:', url);

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log('📊 API Response:', data);

      // Handle the API response format we've been working with
      let usersData = [];
      
      if (data.status === 'success' && data.data && data.data.users) {
        usersData = data.data.users;
      } else if (data.results) {
        // Handle DRF pagination format
        usersData = data.results;
      } else if (Array.isArray(data)) {
        // Handle direct array response
        usersData = data;
      }

      if (usersData && usersData.length > 0) {
        // Filter to only show users with screenshots
        const usersWithScreenshots = usersData.filter(user => 
          user.total_screenshots && user.total_screenshots > 0
        );

        if (offset === 0) {
          // New search - replace users
          setUsers(usersWithScreenshots);
        } else {
          // Load more - append users
          setUsers((prevUsers) => [...prevUsers, ...usersWithScreenshots]);
        }
        
        setOffset((prevOffset) => prevOffset + limit);
        
        // Check if there are more users (adapt to your API's pagination)
        if (data.next !== undefined) {
          setHasMore(data.next !== null);
        } else {
          setHasMore(usersWithScreenshots.length === limit);
        }
      } else {
        if (offset === 0) {
          setUsers([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(`Failed to fetch users: ${error.message}`);
      setHasMore(false);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    setUsers([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
    fetchUsers();
  };

  useEffect(() => {
    handleSearch(); // Load on mount
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>User Search with Screenshots</h2>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={handleSearch}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#fee', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      <div>
        {users.length === 0 && !loading && !error && (
          <p style={{ textAlign: 'center', color: '#666' }}>
            No users with screenshots found for your search criteria.
          </p>
        )}
        
        {users.map((user, index) => (
          <div
            key={user.id || user.email || index}
            style={{
              border: '1px solid #ddd',
              marginBottom: '15px',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '16px', color: '#333' }}>
                  {user.display_name || user.name || user.email}
                </strong>
                <br />
                {user.email && user.display_name && (
                  <>
                    <span style={{ color: '#666', fontSize: '14px' }}>{user.email}</span>
                    <br />
                  </>
                )}
                <small style={{ color: '#888' }}>
                  Joined: {user.date_joined || user.first_activity || 'Unknown'}
                </small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  backgroundColor: '#28a745', 
                  color: 'white', 
                  padding: '4px 8px', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  📷 {user.total_screenshots || 0} screenshots
                </div>
                {user.total_size_mb && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {user.total_size_mb} MB
                  </div>
                )}
              </div>
            </div>
            
            {user.last_activity && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                Last activity: {user.last_activity}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && !loading && users.length > 0 && (
        <button 
          onClick={fetchUsers} 
          style={{ 
            marginTop: '15px', 
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'block',
            margin: '15px auto'
          }}
        >
          Load More Users
        </button>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Loading users...</div>
        </div>
      )}

      {users.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666'
        }}>
          Found {users.length} users with screenshots
        </div>
      )}
    </div>
  );
};

export default UserSearchImproved;