
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { userLogsAPI } from '../../../services/userLogsAPI';
import { getBaseURL } from '../../../config/api';
import LogViewModal from '../../components/LogViewModal';
import { debugS3Url } from '../../../utils/s3Debug';

const ActivityPatternContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
`;

const ContentSection = styled.div`
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const FiltersContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 999;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-height: 44px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
  }

  option {
    padding: 8px;
  }
`;

const DatePicker = styled.input`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-height: 44px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
  }

  &::-webkit-calendar-picker-indicator {
    color: #1a73e8;
    cursor: pointer;
    font-size: 16px;
  }
`;

const ContentArea = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-height: 400px;
  z-index: 999;
  position: relative;
`;

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  height: 100%;
  min-height: 400px;
`;

const NoDataIcon = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const DocumentIcon = styled.div`
  width: 80px;
  height: 100px;
  background: #f5f5f5;
  border-radius: 8px;
  position: relative;
  margin: 0 auto;
  border: 2px solid #e8eaed;

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 20px;
    width: 56px;
    height: 3px;
    background: #dadce0;
    border-radius: 2px;
  }

  &::after {
    content: '';
    position: absolute;
    left: 12px;
    top: 30px;
    width: 40px;
    height: 3px;
    background: #dadce0;
    border-radius: 2px;
    box-shadow: 
      0 10px 0 #dadce0,
      0 20px 0 #dadce0,
      0 30px 0 #dadce0;
  }
`;

const ColorfulBlocks = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 1;
`;

const ColorBlock = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  
  &:nth-child(1) { background: #ff4444; }
  &:nth-child(2) { background: #ffaa00; }
  &:nth-child(3) { background: #ffee00; }
  &:nth-child(4) { background: #00aa44; }
  &:nth-child(5) { background: #0088cc; }
`;

const NoDataText = styled.p`
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  font-weight: 500;
`;

// New styled components for logs viewer
const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? '#fff' : props.theme.colors.text};
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  margin-right: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const TimeRangeButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? '#fff' : props.theme.colors.text};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
`;

const LogsContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  z-index: 99999 !important;
`;

const LogsHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 100px 150px 120px 180px;
  gap: 16px;
  padding: 16px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 150px 80px 140px;
    gap: 8px;
    font-size: 12px;
  }
`;

const LogItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 100px 150px 120px 180px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  align-items: center;
  transition: background-color 0.2s;
  z-index: 999;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 150px 80px 140px;
    gap: 8px;
    font-size: 12px;
  }
`;

const LogFileName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  word-break: break-word;
`;

const LogUser = styled.div`
  color: #1a73e8;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const LogSize = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const LogDate = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LogType = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => {
    switch (props.type) {
      case 'users_logs': return '#e8f5e8';
      case 'logs': return '#e8f0ff';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'users_logs': return '#2d7d2d';
      case 'logs': return '#1a73e8';
      default: return '#666';
    }
  }};
  font-size: 12px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const DownloadButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 36px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 14px;
    min-width: 32px;
    height: 32px;
  }
`;

const ViewButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 36px;
  margin-right: 8px;

  &:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 14px;
    min-width: 32px;
    height: 32px;
    margin-right: 4px;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  background: #efe;
  color: #3c3;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #cfc;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #5f6368;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ActivityPattern = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // State management
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeRange, setTimeRange] = useState('last_7_days');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logsData, setLogsData] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    loading: false,
    error: null,
    logData: null,
    currentLog: null
  });

  // Time range options
  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' }
  ];

  // Fetch employees list on component mount
  useEffect(() => {
    fetchEmployees();
    fetchLogsData(); // Load initial data
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchLogsData();
  }, [timeRange, selectedEmployee, startDate, endDate]);

  const fetchEmployees = async () => {
    try {
      // Use centralized API configuration
      const endpoint = `${getBaseURL()}/api/users/search/`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.users) {
          setEmployees(data.data.users);
        } else {
          setEmployees([
            { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
            { id: 2, email: 'kiranaiza4@gmail.com', display_name: 'Kiran' },
            { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
          ]);
        }
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Fallback data
      setEmployees([
        { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
        { id: 2, email: 'kiranaiza4@gmail.com', display_name: 'Kiran' },
        { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
      ]);
    }
  };

  const fetchLogsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the API service
      const options = {
        limit: 50,
        sortBy: 'date',
        sortOrder: 'desc'
      };

      // Add time range or custom dates
      if (timeRange && !startDate && !endDate) {
        options.timeRange = timeRange;
      } else if (startDate && endDate) {
        options.startDate = startDate;
        options.endDate = endDate;
      } else {
        options.timeRange = 'last_7_days'; // Default
      }
      
      // Add user filter if selected
      if (selectedEmployee) {
        options.userEmail = selectedEmployee;
      }

      const data = await userLogsAPI.getLogs(options);
      
      setLogsData(data.logs || []);
      setStatistics(data.statistics || {});
      setSuccess(`Found ${data.total_count || 0} log files`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error fetching logs data:', error);
      setError(error.message || 'Failed to fetch logs data');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (sizeInMB) => {
    return userLogsAPI.formatFileSize(sizeInMB);
  };

  const formatDate = (dateString) => {
    const formatted = userLogsAPI.formatDate(dateString);
    return `${formatted.date} ${formatted.time}`;
  };

  const handleDownload = async (log) => {
    try {
      setDownloadingFile(log.file_name);
      setError('');
      
      // Use the provided download_url (signed S3 URL)
      const downloadUrl = log.download_url;
      
      if (!downloadUrl) {
        throw new Error('No download URL available for this file');
      }
      
      console.log('Downloading from URL:', downloadUrl);
      
      // Debug the S3 URL to identify signature issues
      debugS3Url(downloadUrl, log.file_name);
      
      // Check if the URL looks like a valid S3 presigned URL
      if (!downloadUrl.includes('amazonaws.com') && !downloadUrl.includes('s3.')) {
        throw new Error('Invalid S3 URL format received from server');
      }
      
      // Check if URL has required AWS signature parameters
      if (!downloadUrl.includes('AWSAccessKeyId') && !downloadUrl.includes('X-Amz-Algorithm')) {
        console.warn('URL may be missing AWS signature parameters');
      }
      
      // Direct download approach - avoid CORS issues
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = log.file_name || 'download.json';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add error event listener to detect failed downloads
      link.addEventListener('error', (e) => {
        console.error('Download link error:', e);
        setError(`Download failed. The signed URL may be invalid or expired. Please contact your administrator.`);
        setTimeout(() => setError(''), 5000);
      });
      
      // Hide the link and trigger click
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Small delay to ensure DOM manipulation is complete
      setTimeout(() => {
        link.click();
        
        // Clean up after a delay
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 1000);
      }, 100);
      
      setSuccess(`Download initiated for ${log.file_name || 'file'}. If download doesn't start, the signed URL may have expired.`);
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('Download error:', error);
      setError(`Failed to download ${log.file_name || 'file'}: ${error.message}
      
💡 This appears to be an AWS S3 signature issue. The backend needs to:
1. Update AWS SDK to latest version
2. Use AWS Signature Version 4 (AWS4-HMAC-SHA256)  
3. Regenerate presigned URLs with correct signature`);
      setTimeout(() => setError(''), 10000);
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleViewLog = async (log) => {
    try {
      // Open modal and set loading state
      setModalState({
        isOpen: true,
        loading: true,
        error: null,
        logData: null,
        currentLog: log
      });
      
      setError('');
      
      // Use the provided download_url to fetch and view content
      const downloadUrl = log.download_url;
      
      if (!downloadUrl) {
        throw new Error('No download URL available for this file');
      }
      
      console.log('Fetching log content from URL:', downloadUrl);
      
      // Since S3 CORS is blocking fetch requests, we'll show a message
      // suggesting to download the file instead, but still try to fetch
      let content = '';
      let fetchSuccess = false;
      
      try {
        // Simple fetch attempt with no special headers
        const response = await fetch(downloadUrl);
        
        if (response.ok) {
          content = await response.text();
          fetchSuccess = true;
          console.log('Successfully fetched log content');
        } else {
          console.warn('Fetch failed with status:', response.status, response.statusText);
        }
      } catch (fetchError) {
        console.warn('Fetch failed due to CORS/Network:', fetchError.message);
        
        // Provide a more specific error message based on the error type
        let errorMessage = 'Unable to view log content in browser due to S3 CORS restrictions.';
        
        if (fetchError.message.includes('CORS')) {
          errorMessage = 'CORS policy prevents viewing this file directly in the browser.';
        } else if (fetchError.message.includes('network')) {
          errorMessage = 'Network error occurred while trying to fetch the log file.';
        } else if (fetchError.message.includes('Failed to fetch')) {
          errorMessage = 'S3 bucket CORS configuration blocks browser access to this file.';
        }
        
        // Update modal with helpful error and download option
        setModalState({
          isOpen: true,
          loading: false,
          error: `${errorMessage} 

📋 Log File: ${log.file_name}
👤 User: ${log.user_email}
📊 Size: ${formatFileSize(log.file_size_mb)}
📅 Date: ${formatDate(log.last_modified)}

💡 Solution: Use the "Download Instead" button below to save the file to your computer, then open it with any text editor or JSON viewer.`,
          logData: null,
          currentLog: log
        });
        return;
      }
      
      if (!fetchSuccess) {
        // If we get here, the response wasn't ok but didn't throw
        setModalState({
          isOpen: true,
          loading: false,
          error: `Unable to fetch log content (HTTP error). 

📋 Log File: ${log.file_name}
👤 User: ${log.user_email}  
📊 Size: ${formatFileSize(log.file_size_mb)}
📅 Date: ${formatDate(log.last_modified)}

💡 The S3 presigned URL works for downloads but not for browser viewing. Please use "Download Instead" to access the file.`,
          logData: null,
          currentLog: log
        });
        return;
      }
      
      // If we successfully fetched content, format it
      let formattedContent;
      try {
        const jsonContent = JSON.parse(content);
        formattedContent = JSON.stringify(jsonContent, null, 2);
      } catch (parseError) {
        formattedContent = content;
      }
      
      // Update modal with content
      setModalState({
        isOpen: true,
        loading: false,
        error: null,
        logData: {
          fileName: log.file_name,
          content: formattedContent,
          isJson: true,
          fileInfo: {
            size: formatFileSize(log.file_size_mb),
            user: log.user_email,
            date: formatDate(log.last_modified),
            type: log.log_type
          }
        },
        currentLog: log
      });
      
    } catch (error) {
      console.error('View log error:', error);
      
      // Update modal with error state
      setModalState({
        isOpen: true,
        loading: false,
        error: `Unexpected error while trying to view the log file.

📋 Error: ${error.message}
📋 Log File: ${log.file_name}

💡 Please try using the "Download Instead" button to access the file.`,
        logData: null,
        currentLog: log
      });
    }
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      loading: false,
      error: null,
      logData: null,
      currentLog: null
    });
  };

  const handleRetryView = () => {
    if (modalState.currentLog) {
      handleViewLog(modalState.currentLog);
    }
  };

  const handleModalDownload = () => {
    if (modalState.currentLog) {
      handleDownload(modalState.currentLog);
      handleCloseModal(); // Close the modal after initiating download
    }
  };

  const handleCopySuccess = () => {
    setSuccess('Log content copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const renderLogsView = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading logs data...</p>
        </LoadingContainer>
      );
    }

    return (
      <>
        {statistics && Object.keys(statistics).length > 0 && (
          <StatsGrid theme={theme}>
            <StatCard theme={theme}>
              <StatValue theme={theme}>{statistics.total_files || 0}</StatValue>
              <StatLabel theme={theme}>Total Files</StatLabel>
            </StatCard>
            <StatCard theme={theme}>
              <StatValue theme={theme}>{statistics.unique_users || 0}</StatValue>
              <StatLabel theme={theme}>Users</StatLabel>
            </StatCard>
            <StatCard theme={theme}>
              <StatValue theme={theme}>{formatFileSize(statistics.total_size_mb || 0)}</StatValue>
              <StatLabel theme={theme}>Total Size</StatLabel>
            </StatCard>
            <StatCard theme={theme}>
              <StatValue theme={theme}>{statistics.unique_projects || 0}</StatValue>
              <StatLabel theme={theme}>Projects</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        <LogsContainer theme={theme}>
          <LogsHeader theme={theme}>
            <div>File Name</div>
            <div>User</div>
            <div>Size</div>
            <div>Date</div>
            <div>Type</div>
            <div>Actions</div>
          </LogsHeader>
          
          {logsData.length === 0 ? (
            <NoDataContainer>
              <NoDataIcon>
                <DocumentIcon>
                  <ColorfulBlocks>
                    <ColorBlock />
                    <ColorBlock />
                    <ColorBlock />
                    <ColorBlock />
                    <ColorBlock />
                  </ColorfulBlocks>
                </DocumentIcon>
              </NoDataIcon>
              <NoDataText>No logs found for the selected criteria</NoDataText>
            </NoDataContainer>
          ) : (
            logsData.map((log, index) => (
              <LogItem key={index} theme={theme}>
                <LogFileName theme={theme}>{log.file_name}</LogFileName>
                <LogUser>{log.user_email}</LogUser>
                <LogSize theme={theme}>{formatFileSize(log.file_size_mb)}</LogSize>
                <LogDate theme={theme}>{formatDate(log.last_modified)}</LogDate>
                <LogType type={log.log_type}>{log.log_type}</LogType>
                <ButtonsContainer>
                  <ViewButton 
                    onClick={() => handleViewLog(log)}
                    disabled={modalState.loading && modalState.currentLog?.file_name === log.file_name}
                    theme={theme}
                    title={`View ${log.file_name}`}
                  >
                    {modalState.loading && modalState.currentLog?.file_name === log.file_name ? '⏳' : '👁️'}
                  </ViewButton>
                  <DownloadButton 
                    onClick={() => handleDownload(log)}
                    disabled={downloadingFile === log.file_name}
                    theme={theme}
                    title={`Download ${log.file_name}`}
                  >
                    {downloadingFile === log.file_name ? '⏳' : '📥'}
                  </DownloadButton>
                </ButtonsContainer>
              </LogItem>
            ))
          )}
        </LogsContainer>
      </>
    );
  };

  return (
    <DashboardLayout>
      <ActivityPatternContainer theme={theme}>
        <ContentSection theme={theme}>
          <Header>
            <Title theme={theme}>USER LOGS ACTIVITY PATTERN</Title>
          </Header>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <FiltersContainer theme={theme}>
            <FiltersGrid>
              <FilterGroup>
                <FilterLabel theme={theme}>Employee</FilterLabel>
                <FilterSelect
                  theme={theme}
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.email || employee.display_name}>
                      {employee.display_name || employee.email}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel theme={theme}>Start Date</FilterLabel>
                <DatePicker
                  theme={theme}
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setTimeRange(''); // Clear time range when custom dates are used
                  }}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel theme={theme}>End Date</FilterLabel>
                <DatePicker
                  theme={theme}
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setTimeRange(''); // Clear time range when custom dates are used
                  }}
                  min={startDate}
                />
              </FilterGroup>
            </FiltersGrid>

            <div style={{ marginTop: '16px' }}>
              <FilterLabel theme={theme}>Quick Time Ranges</FilterLabel>
              <TimeRangeSelector>
                {timeRangeOptions.map((option) => (
                  <TimeRangeButton
                    key={option.value}
                    theme={theme}
                    active={timeRange === option.value}
                    onClick={() => {
                      setTimeRange(option.value);
                      setStartDate(''); // Clear custom dates when time range is used
                      setEndDate('');
                    }}
                  >
                    {option.label}
                  </TimeRangeButton>
                ))}
              </TimeRangeSelector>
            </div>
          </FiltersContainer>

          <ContentArea theme={theme}>
            {renderLogsView()}
          </ContentArea>
        </ContentSection>
      </ActivityPatternContainer>

      {/* Log View Modal */}
      <LogViewModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        logData={modalState.logData}
        loading={modalState.loading}
        error={modalState.error}
        onRetry={handleRetryView}
        onCopyToClipboard={handleCopySuccess}
        onDownload={handleModalDownload}
      />
    </DashboardLayout>
  );
};

export default ActivityPattern;
