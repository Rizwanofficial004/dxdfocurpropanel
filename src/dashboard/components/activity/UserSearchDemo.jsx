import React from 'react';
import UserSearch from './UserSearch';
import UserSearchImproved from './UserSearchImproved';

const UserSearchDemo = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>User Search API Demo</h1>
      <p>Testing the API endpoint: <code>http://localhost:8000/api/users/search/</code></p>
      
      <div style={{ marginBottom: '40px' }}>
        <h3>Original Component</h3>
        <UserSearch />
      </div>
      
      <hr style={{ margin: '40px 0' }} />
      
      <div>
        <h3>Improved Component (Handles your API format)</h3>
        <UserSearchImproved />
      </div>
    </div>
  );
};

export default UserSearchDemo;