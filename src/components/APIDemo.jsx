// API Demo Page
// Simple page to demonstrate and test the users search API

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  Box,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';

// Import our users API service
import usersAPI from '../services/usersAPI.js';

const StyledContainer = styled(Container)`
  padding: 20px;
  max-width: 1200px;
`;

const CodeBlock = styled.pre`
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 14px;
  border: 1px solid #ddd;
`;

const ResultContainer = styled(Paper)`
  padding: 15px;
  margin-top: 15px;
  background: #f9f9f9;
  
  overflow-y: auto;
`;

const APIDemo = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Form state
  const [query, setQuery] = useState('nawaz');
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState('2025-09-01');
  const [pageSize, setPageSize] = useState('50');

  // API test scenarios
  const apiTests = [
    {
      title: 'Search Specific User',
      description: 'Search for users matching "nawaz"',
      params: {
        q: 'nawaz',
        start_date: '2025-09-01',
        end_date: '2025-09-01',
        page_size: 50
      }
    },
    {
      title: 'Get All Users',
      description: 'Get all users in date range (empty query)',
      params: {
        q: '',
        start_date: '2025-09-01',
        end_date: '2025-09-01',
        page_size: 100
      }
    },
    {
      title: 'Search by Email Domain',
      description: 'Search users with Gmail addresses',
      params: {
        q: 'gmail.com',
        start_date: '2025-08-01',
        end_date: '2025-09-01',
        page_size: 20
      }
    },
    {
      title: 'Recent Activity',
      description: 'Get users with recent activity (last 7 days)',
      params: {
        q: '',
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        page_size: 50
      }
    }
  ];

  const handleAPICall = async (params = null) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const searchParams = params || {
        q: query,
        start_date: startDate,
        end_date: endDate,
        page_size: parseInt(pageSize)
      };

      console.log('🔍 Making API call with params:', searchParams);
      
      const response = await usersAPI.searchUsers(searchParams);
      
      setResult({
        params: searchParams,
        response: response,
        url: buildAPIUrl(searchParams),
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('❌ API Error:', err);
      setError(err.message || 'API request failed');
    } finally {
      setLoading(false);
    }
  };

  const buildAPIUrl = (params) => {
    const baseUrl = 'http://127.0.0.1:8000/api/users/search/';
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        urlParams.append(key, value);
      }
    });
    
    return `${baseUrl}?${urlParams.toString()}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Search API Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This demo showcases the users search API endpoint. You can test different parameters 
        and see real-time responses from your backend server.
      </Typography>

      {/* API Endpoint Information */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <CodeIcon style={{ marginRight: 8, verticalAlign: 'middle' }} />
            API Endpoint
          </Typography>
          
          <CodeBlock>
GET http://127.0.0.1:8000/api/users/search/
          </CodeBlock>
          
          <Typography variant="subtitle2" gutterBottom style={{ marginTop: 15 }}>
            Query Parameters:
          </Typography>
          <ul>
            <li><code>q</code> - Search query (name, email, username)</li>
            <li><code>start_date</code> - Start date filter (YYYY-MM-DD format)</li>
            <li><code>end_date</code> - End date filter (YYYY-MM-DD format)</li>
            <li><code>page</code> - Page number (default: 1)</li>
            <li><code>page_size</code> - Items per page (default: 50)</li>
            <li><code>status</code> - User status filter (active, inactive, all)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Custom API Test */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Custom API Test
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Search Query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                fullWidth
                placeholder="Enter name, email, or username"
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                type="number"
                label="Page Size"
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                fullWidth
                inputProps={{ min: 1, max: 500 }}
              />
            </Grid>
          </Grid>

          <Box mt={2}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
              onClick={() => handleAPICall()}
              disabled={loading}
              size="large"
            >
              {loading ? 'Testing API...' : 'Test API'}
            </Button>
          </Box>

          {/* Generated URL */}
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Generated URL:
            </Typography>
            <CodeBlock>
              {buildAPIUrl({
                q: query,
                start_date: startDate,
                end_date: endDate,
                page_size: pageSize
              })}
              <Button
                size="small"
                onClick={() => copyToClipboard(buildAPIUrl({
                  q: query,
                  start_date: startDate,
                  end_date: endDate,
                  page_size: pageSize
                }))}
                style={{ marginLeft: 10 }}
              >
                <CopyIcon fontSize="small" />
              </Button>
            </CodeBlock>
          </Box>
        </CardContent>
      </Card>

      {/* Pre-defined Tests */}
      <Card style={{ marginBottom: 20 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Tests
          </Typography>
          
          <Grid container spacing={2}>
            {apiTests.map((test, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {test.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {test.description}
                    </Typography>
                    
                    <CodeBlock style={{ fontSize: '12px', marginBottom: 10 }}>
                      {formatJSON(test.params)}
                    </CodeBlock>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAPICall(test.params)}
                      disabled={loading}
                      fullWidth
                    >
                      Run Test
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" style={{ marginBottom: 20 }}>
          <strong>API Error:</strong> {error}
        </Alert>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              API Response
            </Typography>
            
            <Box mb={2}>
              <Chip 
                label={`Status: ${result.response.status || 'Unknown'}`}
                color={result.response.status === 'success' ? 'success' : 'error'}
                style={{ marginRight: 10 }}
              />
              
              {result.response.data && (
                <Chip 
                  label={`Users Found: ${result.response.data.users?.length || 0}`}
                  color="primary"
                  style={{ marginRight: 10 }}
                />
              )}
              
              <Chip 
                label={`Total: ${result.response.data?.total_count || 0}`}
                color="secondary"
              />
            </Box>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Request Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" gutterBottom>URL:</Typography>
                <CodeBlock>{result.url}</CodeBlock>
                
                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 15 }}>
                  Parameters:
                </Typography>
                <CodeBlock>{formatJSON(result.params)}</CodeBlock>
                
                <Typography variant="subtitle2" gutterBottom style={{ marginTop: 15 }}>
                  Timestamp:
                </Typography>
                <CodeBlock>{result.timestamp}</CodeBlock>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Full Response JSON</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ResultContainer>
                  <CodeBlock>{formatJSON(result.response)}</CodeBlock>
                </ResultContainer>
              </AccordionDetails>
            </Accordion>

            {/* Users Summary */}
            {result.response.data?.users && result.response.data.users.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Users Summary ({result.response.data.users.length} users)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {result.response.data.users.slice(0, 10).map((user, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card variant="outlined" style={{ padding: 10 }}>
                          <Typography variant="body2">
                            <strong>{user.display_name || user.email}</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email} • {user.total_screenshots || 0} screenshots
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                    {result.response.data.users.length > 10 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" style={{ textAlign: 'center' }}>
                          ... and {result.response.data.users.length - 10} more users
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card style={{ marginTop: 20, backgroundColor: '#f0f7ff' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Implementation Examples
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>JavaScript/React Usage</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CodeBlock>{`
// Import the users API service
import usersAPI from './services/usersAPI.js';

// Search for specific users
const searchUsers = async () => {
  try {
    const response = await usersAPI.searchUsers({
      q: 'nawaz',
      start_date: '2025-09-01',
      end_date: '2025-09-01',
      page_size: 50
    });
    
    if (response.status === 'success') {
      const users = response.data.users;
      console.log('Found users:', users);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const response = await usersAPI.getAllUsers({
      start_date: '2025-09-01',
      end_date: '2025-09-01'
    });
    console.log('All users:', response.data.users);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get user suggestions for autocomplete
const getSuggestions = async (query) => {
  try {
    const response = await usersAPI.getUserSuggestions(query, 10);
    console.log('Suggestions:', response.data.suggestions);
  } catch (error) {
    console.error('Error:', error);
  }
};
              `}</CodeBlock>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Direct API Calls (fetch/axios)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CodeBlock>{`
// Using fetch
const searchUsers = async () => {
  const params = new URLSearchParams({
    q: 'nawaz',
    start_date: '2025-09-01',
    end_date: '2025-09-01',
    page_size: 50
  });
  
  const response = await fetch(\`http://127.0.0.1:8000/api/users/search/?\${params}\`);
  const data = await response.json();
  console.log(data);
};

// Using axios
import axios from 'axios';

const searchUsers = async () => {
  const response = await axios.get('http://127.0.0.1:8000/api/users/search/', {
    params: {
      q: 'nawaz',
      start_date: '2025-09-01',
      end_date: '2025-09-01',
      page_size: 50
    }
  });
  console.log(response.data);
};
              `}</CodeBlock>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>cURL Examples</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CodeBlock>{`
# Search for specific user
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&q=nawaz"

# Get all users
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&q="

# Get users with pagination
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&page=1&page_size=20"

# Search by email domain
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&q=gmail.com"
              `}</CodeBlock>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </StyledContainer>
  );
};

export default APIDemo;