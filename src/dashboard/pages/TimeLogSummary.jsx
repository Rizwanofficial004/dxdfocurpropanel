import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getApiBaseURL } from '../../config/api';
import axios from 'axios';

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FiltersContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.primaryHover || props.theme.colors.primary};
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.secondary};
    border: 1px solid ${props.theme.colors.border};
    
    &:hover {
      background: ${props.theme.colors.background};
      color: ${props.theme.colors.text.primary};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogsContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 1.2fr 1.2fr 0.6fr 2fr 0.8fr;
  gap: 12px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 1.2fr 1.2fr 0.6fr 2fr 0.8fr;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch(props.status) {
      case 'active':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        `;
      case 'completed':
        return `
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        `;
      case 'in-progress':
        return `
          background: rgba(251, 191, 36, 0.1);
          color: #d97706;
        `;
      case 'offline':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        `;
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.border};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const TimeLogSummary = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employee: ''
  });

  // Fetch timesheets from API
  const fetchTimesheets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = `${getApiBaseURL()}/Timesheets/?_t=${Date.now()}`;
      console.log('🔄 Fetching timesheets from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('✅ Timesheets API response:', response.data);
      
      if (response.data && response.data.data) {
        const timesheetsData = response.data.data.timesheets || [];
        setTimesheets(timesheetsData);
        setSummary(response.data.data.summary);
        applyClientSideFilters(timesheetsData);
      }
      
    } catch (err) {
      console.error('❌ Error fetching timesheets:', err);
      setError(`Failed to fetch timesheets: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply client-side filters
  const applyClientSideFilters = (data) => {
    let filtered = [...data];

    // Filter by employee (staff_name or staff_id)
    if (filters.employee) {
      const searchTerm = filters.employee.toLowerCase();
      filtered = filtered.filter(timesheet => 
        timesheet.staff_name?.toLowerCase().includes(searchTerm) ||
        timesheet.staff_id?.toString().includes(searchTerm)
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(timesheet => {
        const timesheetDate = timesheet.date || timesheet.start_time?.split(' ')[0];
        return timesheetDate >= filters.startDate;
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(timesheet => {
        const timesheetDate = timesheet.date || timesheet.start_time?.split(' ')[0];
        return timesheetDate <= filters.endDate;
      });
    }

    setFilteredTimesheets(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    if (timesheets.length > 0) {
      applyClientSideFilters(timesheets);
    } else {
      fetchTimesheets();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employee: ''
    });
    setCurrentPage(1);
    setFilteredTimesheets(timesheets);
  };

  // Format datetime string (already in format: "2020-12-29 16:35:55")
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    // If it's already a formatted string, return as is
    if (typeof dateTimeStr === 'string' && dateTimeStr.includes('-')) {
      return dateTimeStr;
    }
    // If it's a Unix timestamp, convert it
    const date = new Date(parseInt(dateTimeStr) * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Format hours to 2 decimal places
  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return '0.00';
    return parseFloat(hours).toFixed(2);
  };

  // Format hourly rate
  const formatHourlyRate = (rate) => {
    if (rate === null || rate === undefined) return '0.00';
    return parseFloat(rate).toFixed(2);
  };

  // Initial load
  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  // Calculate pagination
  const totalItems = filteredTimesheets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTimesheets = filteredTimesheets.slice(startIndex, endIndex);

  // Calculate summary stats
  const calculateStats = () => {
    const totalHours = filteredTimesheets.reduce((sum, ts) => sum + (parseFloat(ts.hours) || 0), 0);
    const uniqueStaff = new Set(filteredTimesheets.map(ts => ts.staff_id)).size;
    const activeEntries = filteredTimesheets.filter(ts => !ts.end_time).length;
    
    return {
      totalEntries: filteredTimesheets.length,
      totalHours: totalHours.toFixed(2),
      uniqueStaff,
      activeEntries
    };
  };

  const stats = calculateStats();

  return (
    <DashboardLayout>
      <Container>
        <Header>
          <Title>
            📊 {t('timeLogSummary') || 'Time Log Summary'}
          </Title>
        </Header>

        {/* Filters */}
        <FiltersContainer>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Start Date</FilterLabel>
              <FilterInput
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>End Date</FilterLabel>
              <FilterInput
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Employee</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Search employee..."
                value={filters.employee}
                onChange={(e) => handleFilterChange('employee', e.target.value)}
              />
            </FilterGroup>
          </FilterRow>
          
          <ButtonGroup>
            <Button onClick={resetFilters}>
              🔄 Reset
            </Button>
            <Button variant="primary" onClick={applyFilters} disabled={loading}>
              {loading ? '🔍 Searching...' : '🔍 Apply Filters'}
            </Button>
          </ButtonGroup>
        </FiltersContainer>

        {/* Summary Statistics */}
        {!loading && !error && filteredTimesheets.length > 0 && (
          <StatsContainer>
            <StatCard>
              <StatLabel>Total Entries</StatLabel>
              <StatValue>{stats.totalEntries}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Total Hours</StatLabel>
              <StatValue>{stats.totalHours}h</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Unique Staff</StatLabel>
              <StatValue>{stats.uniqueStaff}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Active Sessions</StatLabel>
              <StatValue>{stats.activeEntries}</StatValue>
            </StatCard>
          </StatsContainer>
        )}

        {/* Timesheets Table */}
        <LogsContainer>
          <TableHeader>
            <div>Staff Name</div>
            <div>Date</div>
            <div>Start Time</div>
            <div>End Time</div>
            <div>Hours</div>
            <div>Note</div>
            <div>Hourly Rate</div>
          </TableHeader>
          
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <div>Loading timesheets from API...</div>
            </LoadingContainer>
          ) : error ? (
            <EmptyState>
              <EmptyIcon>⚠️</EmptyIcon>
              <div style={{ color: '#dc2626', fontWeight: 600 }}>{error}</div>
              <Button variant="primary" onClick={fetchTimesheets} style={{ marginTop: '16px' }}>
                Retry
              </Button>
            </EmptyState>
          ) : filteredTimesheets.length > 0 ? (
            <>
              {currentTimesheets.map((timesheet) => (
                <TableRow key={timesheet.id}>
                  <TableCell>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>
                        {timesheet.staff_name || `Staff #${timesheet.staff_id}`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '13px' }}>
                      {timesheet.date || (timesheet.start_time ? timesheet.start_time.split(' ')[0] : 'N/A')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '12px' }}>
                      {formatDateTime(timesheet.start_time)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '12px' }}>
                      {timesheet.end_time ? formatDateTime(timesheet.end_time) : 
                        <StatusBadge status="in-progress">In Progress</StatusBadge>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>
                      {formatHours(timesheet.hours)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '12px', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={timesheet.note || ''}>
                      {timesheet.note || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#10b981' }}>
                      ${formatHourlyRate(timesheet.hourly_rate)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <div>No timesheets found</div>
              <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                Try adjusting your filters or check your API connection
              </div>
            </EmptyState>
          )}
        </LogsContainer>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '20px',
            padding: '16px 20px',
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '14px', color: theme.colors.text.secondary }}>
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} entries
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </Button>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '0 12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default TimeLogSummary;