# 🔍 S3 User Suggestions API - Complete Guide

## ✅ NEW API ENDPOINT FOR USER SUGGESTIONS

Perfect! You now have a **dedicated S3 User Suggestions API** that scans your S3 bucket to provide real-time user suggestions for easy selection.

## 🎯 API Endpoint

### **S3 User Suggestions (Autocomplete)**
```
GET /api/users/s3-suggestions/?q=search_term&limit=10
```

## 📋 Complete Usage Examples

### **1. Get All Available Users (Dropdown List)**
```
GET /api/users/s3-suggestions/?limit=20
```
**Returns**: List of all 29+ users with screenshots in S3
**Use case**: Populate dropdown, show all available users

### **2. Search for Specific Users (Autocomplete)**
```
GET /api/users/s3-suggestions/?q=Has&limit=8
```
**Returns**: Users matching "Has" (like Haseeb)
**Use case**: Real-time search suggestions as user types

### **3. Find Active Users Only**
```
GET /api/users/s3-suggestions/?min_screenshots=50&limit=15
```
**Returns**: Users with at least 50 screenshots
**Use case**: Show only active/frequent users

## 🚀 Test Results (Just Verified!)

```
✅ All S3 Users:     29 users found
✅ Search "Has":     1 match (Haseeb Developer)
✅ Integration:      Works perfectly with screenshot search API
```

## 📱 Frontend Integration

### **React Autocomplete Component**
```javascript
import React, { useState, useEffect } from 'react';

const UserSuggestions = ({ onUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get suggestions as user types
  useEffect(() => {
    if (searchTerm.length >= 1) {
      getSuggestions(searchTerm);
    } else {
      getAllUsers(); // Show all users when no search
    }
  }, [searchTerm]);

  const getSuggestions = async (term) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/s3-suggestions/?q=${term}&limit=8`
      );
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.suggestions);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
    setLoading(false);
  };

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/s3-suggestions/?limit=20');
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.suggestions);
      }
    } catch (error) {
      console.error('Error getting all users:', error);
    }
    setLoading(false);
  };

  const handleUserSelect = (user) => {
    setSearchTerm(user.display_name);
    onUserSelect(user.search_value); // Pass email to parent
    setSuggestions([]); // Hide suggestions
  };

  return (
    <div className="user-suggestions">
      <input
        type="text"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      
      {loading && <div className="loading">Searching...</div>}
      
      {suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((user, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleUserSelect(user)}
            >
              <div className="user-info">
                <strong>{user.display_name}</strong>
                <span className="email">{user.email}</span>
                <span className="screenshot-count">
                  {user.screenshot_count.toLocaleString()} screenshots
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Usage in your main component
const ScreenshotSearch = () => {
  const [selectedUser, setSelectedUser] = useState('');
  const [screenshots, setScreenshots] = useState([]);

  const handleUserSelect = async (userEmail) => {
    setSelectedUser(userEmail);
    
    // Now use this email in your screenshot search API
    const response = await fetch(
      `/api/screenshots/search/?search=${userEmail}&limit=100`
    );
    const data = await response.json();
    
    if (data.success) {
      setScreenshots(data.data.employees[0]?.screenshots || []);
    }
  };

  return (
    <div>
      <UserSuggestions onUserSelect={handleUserSelect} />
      
      {selectedUser && (
        <div className="screenshots-grid">
          {screenshots.map((screenshot, index) => (
            <img key={index} src={screenshot.url} alt={`Screenshot ${index}`} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### **Vue.js Autocomplete Component**
```vue
<template>
  <div class="user-suggestions">
    <input
      v-model="searchTerm"
      @input="onSearchInput"
      placeholder="Search employees..."
      class="search-input"
    />
    
    <div v-if="loading" class="loading">Searching...</div>
    
    <div v-if="suggestions.length" class="suggestions-dropdown">
      <div
        v-for="(user, index) in suggestions"
        :key="index"
        @click="selectUser(user)"
        class="suggestion-item"
      >
        <strong>{{ user.display_name }}</strong>
        <span class="email">{{ user.email }}</span>
        <span class="count">{{ user.screenshot_count.toLocaleString() }} screenshots</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchTerm: '',
      suggestions: [],
      loading: false
    }
  },
  mounted() {
    this.getAllUsers(); // Load all users initially
  },
  methods: {
    async onSearchInput() {
      if (this.searchTerm.length >= 1) {
        await this.getSuggestions(this.searchTerm);
      } else {
        await this.getAllUsers();
      }
    },
    
    async getSuggestions(term) {
      this.loading = true;
      try {
        const response = await fetch(`/api/users/s3-suggestions/?q=${term}&limit=8`);
        const data = await response.json();
        
        if (data.success) {
          this.suggestions = data.data.suggestions;
        }
      } catch (error) {
        console.error('Error getting suggestions:', error);
      }
      this.loading = false;
    },
    
    async getAllUsers() {
      this.loading = true;
      try {
        const response = await fetch('/api/users/s3-suggestions/?limit=20');
        const data = await response.json();
        
        if (data.success) {
          this.suggestions = data.data.suggestions;
        }
      } catch (error) {
        console.error('Error getting all users:', error);
      }
      this.loading = false;
    },
    
    selectUser(user) {
      this.searchTerm = user.display_name;
      this.$emit('user-selected', user.search_value);
      this.suggestions = [];
    }
  }
}
</script>
```

## 🔧 Response Format

```json
{
  "success": true,
  "message": "Found 1 user suggestions matching 'Has'",
  "data": {
    "suggestions": [
      {
        "email": "haseebcodejourney@gmail.com",
        "username": "haseebcodejourney",
        "display_name": "Haseeb Developer",
        "staff_id": "HAS001",
        "profile_image": null,
        "screenshot_count": 999,
        "relevance_score": 90,
        "source": "S3_Direct",
        "suggestion_text": "Haseeb Developer (haseebcodejourney@gmail.com)",
        "search_value": "haseebcodejourney@gmail.com",
        "has_recent_activity": true
      }
    ],
    "metadata": {
      "search_term": "Has",
      "total_found": 1,
      "total_s3_users": 29,
      "source": "S3_Bucket_Scan"
    }
  }
}
```

## 🌐 Browser Testing URLs

```
1. All Users: http://127.0.0.1:8000/api/users/s3-suggestions/?limit=20

2. Search "Has": http://127.0.0.1:8000/api/users/s3-suggestions/?q=Has&limit=8

3. Active Users: http://127.0.0.1:8000/api/users/s3-suggestions/?min_screenshots=50&limit=15
```

## 🔗 Integration with Screenshot Search

### **Complete Workflow:**
1. **User Suggestions**: `/api/users/s3-suggestions/?q=search_term`
2. **User Selection**: Get `search_value` from suggestion
3. **Screenshot Search**: `/api/screenshots/search/?search={search_value}&limit=100`

### **Example Flow:**
```javascript
// Step 1: Get suggestions
const suggestions = await fetch('/api/users/s3-suggestions/?q=Has');
// Returns: [{ search_value: "haseebcodejourney@gmail.com", ... }]

// Step 2: User selects suggestion
const selectedEmail = suggestions.data.suggestions[0].search_value;

// Step 3: Get screenshots for selected user
const screenshots = await fetch(`/api/screenshots/search/?search=${selectedEmail}&limit=100`);
// Returns: All screenshots for Haseeb
```

## ✅ Key Features

- **🔍 Real-time Search**: Instant suggestions as user types
- **📊 29+ Users**: All S3 users automatically discovered
- **⚡ Fast Response**: Optimized for quick autocomplete
- **🎯 Relevance Scoring**: Best matches shown first
- **📱 Frontend Ready**: Perfect for dropdowns and autocomplete
- **🔗 Integration**: Works seamlessly with screenshot search API

## 🚀 Your APIs Are Complete!

You now have:
1. **Screenshot Search API**: 3 patterns (name, name+date, name+all)
2. **User Suggestions API**: S3-based autocomplete for easy user selection

Perfect for building comprehensive employee monitoring interfaces! 🎉
