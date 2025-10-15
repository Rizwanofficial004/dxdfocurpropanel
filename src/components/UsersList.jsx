// Users List Component
// Demonstrates the complete users search API functionality

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Photo as PhotoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import our users API service
import usersAPI from '../services/usersAPI.js';

// Styled components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchContainer = styled(Card)`
  margin-bottom: 20px;
  padding: 20px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  margin: 15px 0;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 15px 0;
`;

const UserCard = styled(Card)`
  margin-bottom: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const UserStats = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  color: #666;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const UsersList = () => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  
  // State for results
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Initialize dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setEndDate(today);
    setStartDate(thirtyDaysAgo);
  }, []);

  // Fetch users function
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        q: searchQuery,
        start_date: startDate,
        end_date: endDate,
        page: page,
        page_size: pageSize,
        include_stats: true
      };

      // Only add status filter if it's not 'all'
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      console.log('🔍 Fetching users with params:', params);
      
      const response = await usersAPI.searchUsers(params);
      
      if (response.status === 'success' && response.data) {
        const userData = response.data.users || [];
        const transformedUsers = userData.map(usersAPI.transformUserData);
        const filteredUsers = usersAPI.filterTestUsers(transformedUsers);
        
        setUsers(filteredUsers);
        setTotalUsers(response.data.total_count || filteredUsers.length);
        setTotalPages(Math.ceil((response.data.total_count || filteredUsers.length) / pageSize));
        setCurrentPage(page);
        
        console.log(`✅ Found ${filteredUsers.length} users`);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(0);
        setError('No users found');
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, startDate, endDate, statusFilter, pageSize]);

  // Fetch user suggestions for autocomplete
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await usersAPI.getUserSuggestions(query, 10);
      
      if (response.success && response.data && response.data.suggestions) {
        const transformedSuggestions = response.data.suggestions.map(usersAPI.transformUserData);
        setSuggestions(transformedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('❌ Error fetching suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Load all users on component mount
  useEffect(() => {
    if (startDate && endDate) {
      fetchUsers(1);
    }
  }, [startDate, endDate, fetchUsers]);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  // Event handlers
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handlePageChange = (event, page) => {
    fetchUsers(page);
  };

  const handleUserSelect = (user) => {
    setSearchQuery(user.display_name);
    setSuggestions([]);
    setCurrentPage(1);
    fetchUsers(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (sizeInMB) => {
    if (!sizeInMB) return '0 MB';
    if (sizeInMB > 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Search API Demo
      </Typography>
      
      {/* Search and Filters */}
      <SearchContainer>
        <Typography variant="h6" gutterBottom>
          Search Users
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              freeSolo
              options={suggestions}
              loading={loadingSuggestions}
              value={searchQuery}
              onInputChange={(event, newValue) => setSearchQuery(newValue || '')}
              onChange={(event, newValue) => {
                if (newValue && typeof newValue === 'object') {
                  handleUserSelect(newValue);
                } else if (typeof newValue === 'string') {
                  setSearchQuery(newValue);
                }
              }}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.display_name || option.email || '';
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.display_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email} • {option.screenshot_count || 0} screenshots
                    </Typography>
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search users by name or email"
                  placeholder="Type to search..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSuggestions && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <FilterContainer>
          <FormControl size="small">
            <InputLabel>Page Size</InputLabel>
            <Select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              label="Page Size"
              style={{ minWidth: 120 }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleClearSearch}
            disabled={loading}
          >
            Clear
          </Button>
        </FilterContainer>

        {/* Stats */}
        <StatsContainer>
          <Chip 
            label={`Total Users: ${totalUsers}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Page: ${currentPage} / ${totalPages}`} 
            color="secondary" 
            variant="outlined" 
          />
          <Chip 
            label={`Showing: ${users.length} users`} 
            color="default" 
            variant="outlined" 
          />
        </StatsContainer>
      </SearchContainer>

      {/* Error Display */}
      {error && (
        <Alert severity="error" style={{ marginBottom: 20 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <LoadingContainer>
          <CircularProgress />
          <Typography variant="body1" style={{ marginLeft: 10 }}>
            Loading users...
          </Typography>
        </LoadingContainer>
      )}

      {/* Users List */}
      {!loading && users.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom>
            Users ({users.length} found)
          </Typography>
          
          {users.map((user, index) => (
            <UserCard key={user.id || index}>
              <CardContent>
                <UserInfo>
                  <PersonIcon color="primary" />
                  <div>
                    <Typography variant="h6" component="div">
                      {user.display_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </div>
                  {user.status && (
                    <Chip 
                      label={user.status} 
                      color={user.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  )}
                </UserInfo>

                <UserStats>
                  <StatItem>
                    <PhotoIcon fontSize="small" />
                    <span>{user.total_screenshots || 0} screenshots</span>
                  </StatItem>
                  
                  <StatItem>
                    <span>📁 {formatFileSize(user.total_size_mb)}</span>
                  </StatItem>
                  
                  <StatItem>
                    <CalendarIcon fontSize="small" />
                    <span>{user.active_days_count || 0} active days</span>
                  </StatItem>
                  
                  {user.staff_id && (
                    <StatItem>
                      <span>ID: {user.staff_id}</span>
                    </StatItem>
                  )}
                </UserStats>

                {/* Additional Details in Accordion */}
                {(user.first_activity || user.last_activity) && (
                  <Accordion style={{ marginTop: 10 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2">View Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {user.first_activity && (
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>First Activity:</strong> {formatDate(user.first_activity)}
                            </Typography>
                          </Grid>
                        )}
                        {user.last_activity && (
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>Last Activity:</strong> {formatDate(user.last_activity)}
                            </Typography>
                          </Grid>
                        )}
                        {user.active_months_count > 0 && (
                          <Grid item xs={6}>
                            <Typography variant="body2">
                              <strong>Active Months:</strong> {user.active_months_count}
                            </Typography>
                          </Grid>
                        )}
                        {user.folders && user.folders.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="body2">
                              <strong>Folders:</strong> {user.folders.join(', ')}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </UserCard>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && users.length === 0 && !error && (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No users found
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Try adjusting your search criteria or date range
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* API Information */}
      <Card style={{ marginTop: 20, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Endpoint Information
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Endpoint:</strong> <code>GET /api/users/search/</code><br />
            <strong>Example URL:</strong> <code>http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&q=nawaz</code><br />
            <strong>Parameters:</strong>
            <ul>
              <li><code>q</code> - Search query (name, email, username)</li>
              <li><code>start_date</code> - Start date filter (YYYY-MM-DD)</li>
              <li><code>end_date</code> - End date filter (YYYY-MM-DD)</li>
              <li><code>page</code> - Page number (default: 1)</li>
              <li><code>page_size</code> - Items per page (default: 50)</li>
              <li><code>status</code> - User status filter (active, inactive, all)</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UsersList;