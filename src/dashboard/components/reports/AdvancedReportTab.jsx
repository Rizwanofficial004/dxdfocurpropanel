import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  CircularProgress
} from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

const AdvancedReportTab = ({ theme, employees = [], selectedEmployee, advancedReportData, isLoadingReportData, selectedYear, selectedMonth, months = [] }) => {
  const [reportsPerPage, setReportsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReportData, setGeneratedReportData] = useState(null);

  // Helper function to format minutes to HH:MM:SS
  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '00:00:00';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Helper function to format hours to readable format
  const formatHours = (hours) => {
    if (!hours || hours === 0) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  // Fetch advanced report data - using selectedMonth and selectedYear from parent
  const fetchAdvancedReport = useCallback(async (showAlerts = false) => {
    if (!selectedEmployee?.staff_id) {
      if (showAlerts) {
        alert('Please select an employee first');
      }
      return;
    }

    if (!selectedMonth || !selectedYear) {
      return;
    }

    setIsGenerating(true);
    try {
      // Calculate date range from selected month and year
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex < 0) {
        setIsGenerating(false);
        return;
      }

      const monthStart = dayjs(`${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-01`).startOf('day');
      const monthEnd = monthStart.endOf('month').startOf('day');
      const startDate = monthStart.format('YYYY-MM-DD');
      const endDate = monthEnd.format('YYYY-MM-DD');

      const url = `https://dxdtime.ddsolutions.io/api/advanced-report/?staff_id=${selectedEmployee.staff_id}&start_date=${startDate}&end_date=${endDate}`;

      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Advanced Report Data:', data);
        setGeneratedReportData(data);
      } else {
        const errorText = await response.text();
        console.error('Advanced Report API Error:', response.status, errorText);
        if (showAlerts) {
          alert(`Failed to fetch report: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error fetching advanced report:', error);
      if (showAlerts) {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [selectedEmployee?.staff_id, selectedMonth, selectedYear, months]);

  // Auto-fetch report when month/year or employee changes
  useEffect(() => {
    // Skip if no employee selected
    if (!selectedEmployee?.staff_id) {
      return;
    }

    // Skip if month or year not available
    if (!selectedMonth || !selectedYear) {
      return;
    }

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchAdvancedReport(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedEmployee?.staff_id, selectedMonth, selectedYear, fetchAdvancedReport]);

  // Calculate pagination for report data
  const reportRows = generatedReportData?.data?.rows || [];
  const totalReports = reportRows.length;
  const totalPages = Math.ceil(totalReports / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;
  const paginatedRows = reportRows.slice(startIndex, endIndex);

  return (
    <div style={{
      padding: '30px',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}>
      {/* Loading Indicator */}
      {isGenerating && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <CircularProgress size={40} sx={{ color: theme.colors.primary }} />
          <Typography variant="body1" sx={{ marginLeft: '16px', color: theme.colors.text.primary }}>
            Loading report data...
          </Typography>
        </Box>
      )}

      {/* Advanced Report View Table */}
      <div style={{
        marginTop: '30px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        padding: '20px'
      }}>
        {/* Summary Section - COMMENTED OUT */}
        {/* {reportData?.data?.summary && (
          <Box sx={{
            marginBottom: '24px',
            padding: '16px',
            background: isUsingDummyData ? '#fef3c7' : '#f0f9ff',
            borderRadius: '8px',
            border: `1px solid ${isUsingDummyData ? '#f59e0b' : '#3b82f6'}`
          }}>
            <Typography variant="h6" sx={{
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: theme.colors.text.primary
            }}>
              SUMMARY
            </Typography>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <div>
                <Typography variant="body2" sx={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  Total Days
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.colors.text.primary }}>
                  {reportData.data.summary.total_days || 0}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" sx={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  Total Logged Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.colors.text.primary }}>
                  {formatHours(reportData.data.summary.total_logged_hours || 0)}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" sx={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  Total Idle Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.colors.text.primary }}>
                  {formatHours(reportData.data.summary.total_idle_hours || 0)}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" sx={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  Total Meeting Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.colors.text.primary }}>
                  {formatHours(reportData.data.summary.total_meeting_hours || 0)}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" sx={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  Total Active Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.colors.text.primary }}>
                  {formatHours(reportData.data.summary.total_active_hours || 0)}
                </Typography>
              </div>
              <div>
                <Typography variant="body2" sx={{ color: theme.colors.text.secondary, fontSize: '12px' }}>
                  Total Productive Time
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: theme.colors.text.primary }}>
                  {formatHours(reportData.data.summary.total_productive_hours || 0)}
                </Typography>
              </div>
            </div>
          </Box>
        )} */}

        {/* Report Data Table */}
        {reportRows && reportRows.length > 0 ? (
          <Box sx={{ position: 'relative' }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="subtitle1" sx={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.5px'
              }}>
                📊 EMPLOYEE: {selectedEmployee?.display_name || selectedEmployee?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500
              }}>
                {selectedMonth} {selectedYear}
              </Typography>
            </Box>
            <TableContainer 
              component={Paper}
              className="table-scroll-container"
              sx={{
                maxWidth: '100%',
                overflowX: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white'
              }}
            >
              <Table sx={{ minWidth: 1400 }} size="medium">
                <TableHead>
                  <TableRow sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '& .MuiTableCell-head': {
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'white',
                      whiteSpace: 'nowrap',
                      borderBottom: 'none',
                      padding: '16px 20px',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                    }
                  }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Login Time</TableCell>
                    <TableCell>Logout Time</TableCell>
                    <TableCell>Idle Duration</TableCell>
                    <TableCell>Meetings</TableCell>
                    <TableCell>Meeting Duration</TableCell>
                    <TableCell>Tasks</TableCell>
                    <TableCell>Tasks Durations</TableCell>
                    <TableCell>Productive Time</TableCell>
                    <TableCell>Active Duration</TableCell>
                    <TableCell>Logged Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row, rowIndex) => {
                    const idlePercentage = row.logged_duration_minutes > 0 
                      ? ((row.idle_duration_minutes / row.logged_duration_minutes) * 100).toFixed(2)
                      : '0.00';
                    
                    const isHighIdle = parseFloat(idlePercentage) > 10;
                    
                    // Calculate Productive Time = Active Duration - Idle Duration
                    const activeDurationMinutes = row.active_duration_minutes || 0;
                    const idleDurationMinutes = row.idle_duration_minutes || 0;
                    const productiveTimeMinutes = Math.max(0, activeDurationMinutes - idleDurationMinutes);
                    const productiveTimeHours = productiveTimeMinutes / 60;
                    
                    return (
                      <TableRow
                        key={rowIndex}
                        sx={{
                          backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f0f4ff',
                            transform: 'scale(1.01)',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                            cursor: 'pointer'
                          },
                          '&:last-child td': {
                            borderBottom: 'none'
                          },
                          '& .MuiTableCell-body': {
                            fontSize: '14px',
                            color: theme.colors.text.primary,
                            borderBottom: '1px solid #e5e7eb',
                            padding: '14px 20px',
                            fontWeight: 500,
                            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                          }
                        }}
                      >
                        <TableCell sx={{ 
                          fontWeight: 600,
                          color: '#667eea'
                        }}>
                          {formatDate(row.date)}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#059669',
                          fontWeight: 600
                        }}>
                          {row.login_time || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#dc2626',
                          fontWeight: 600
                        }}>
                          {row.logout_time || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ 
                          color: isHighIdle ? '#dc2626' : '#059669',
                          fontWeight: 600
                        }}>
                          {formatDuration(row.idle_duration_minutes || 0)} 
                          <span style={{ 
                            fontSize: '12px',
                            marginLeft: '4px',
                            opacity: 0.7
                          }}>
                            ({idlePercentage}%)
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: '#dbeafe',
                            color: '#1e40af',
                            fontWeight: 600,
                            fontSize: '12px'
                          }}>
                            {row.meetings || 0}
                          </span>
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#7c3aed',
                          fontWeight: 600
                        }}>
                          {formatDuration(row.meeting_duration_minutes || 0)}
                        </TableCell>
                        <TableCell>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: '#fef3c7',
                            color: '#92400e',
                            fontWeight: 600,
                            fontSize: '12px'
                          }}>
                            {row.tasks || 0}
                          </span>
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#92400e',
                          fontWeight: 600
                        }}>
                          {formatHours(row.tasks_durations_hours || 0)}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#16a34a',
                          fontWeight: 700,
                          fontSize: '15px'
                        }}>
                          {formatHours(productiveTimeHours)}
                        </TableCell>
                        <TableCell sx={{ 
                          color: '#059669',
                          fontWeight: 600
                        }}>
                          {formatHours(row.active_duration_hours || 0)}
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600,
                          color: '#1e40af'
                        }}>
                          {formatHours(row.logged_duration_hours || 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{
            padding: '40px',
            textAlign: 'center',
            color: theme.colors.text.secondary
          }}>
            <Typography variant="body1">
              No data available for the selected period
            </Typography>
          </Box>
        )}

        {/* Pagination Bottom */}
        {totalReports > 0 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              Reports per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={reportsPerPage}
                onChange={(e) => {
                  setReportsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                sx={{
                  fontSize: '14px',
                  height: '32px'
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              {startIndex + 1} - {Math.min(endIndex, totalReports)} of {totalReports}
            </Typography>
            <IconButton
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <KeyboardArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <KeyboardArrowRightIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <KeyboardDoubleArrowRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </div>
    </div>
  );
};

export default AdvancedReportTab;
