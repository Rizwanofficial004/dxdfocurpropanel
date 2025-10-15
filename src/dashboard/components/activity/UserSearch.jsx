import React, { useState, useEffect } from 'react';

const UserSearch = () => {
  const [query, setQuery] = useState('nawaz');
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState('2025-09-01');
  const [users, setUsers] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    const url = `http://localhost:8000/api/users/search/?q=${query}&start_date=${startDate}&end_date=${endDate}&limit=${limit}&offset=${offset}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setUsers((prevUsers) => [...prevUsers, ...data.results]);
        setOffset((prevOffset) => prevOffset + limit);
        setHasMore(data.next !== null); // based on DRF pagination
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }

    setLoading(false);
  };

  const handleSearch = () => {
    setUsers([]);
    setOffset(0);
    setHasMore(true);
    fetchUsers();
  };

  useEffect(() => {
    handleSearch(); // Load on mount
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>User Search</h2>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div>
        {users.length === 0 && !loading && <p>No users found.</p>}
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              border: '1px solid #ccc',
              marginBottom: '10px',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            <strong>{user.name}</strong><br />
            <small>{user.date_joined}</small>
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <button onClick={fetchUsers} style={{ marginTop: '15px' }}>
          Load More
        </button>
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default UserSearch;