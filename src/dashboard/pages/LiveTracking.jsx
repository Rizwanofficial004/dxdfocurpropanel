import React, { useState } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Container } from '../styles/commonStyles';
import { useLanguage } from '../context/LanguageContext';

const LiveTrackingContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
  transition: background-color 0.3s ease;
`;

const ContentSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const TrackingCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const LeftFilters = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const RightFilters = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const EmployeeName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  font-size: 16px;
  white-space: nowrap;
`;

const FilterDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  min-width: 140px;
  cursor: pointer;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }

  option {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  min-width: 200px;

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.colors.primary};
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch(props.status) {
      case 'online': return '#dcfce7';
      case 'offline': return '#fee2e2';
      case 'idle': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'online': return '#166534';
      case 'offline': return '#dc2626';
      case 'idle': return '#d97706';
      default: return '#374151';
    }
  }};
`;

const ActivityInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, ${props => props.theme.colors.surface} 0%, ${props => props.theme.colors.background} 100%);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .label {
    font-size: 12px;
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 24px;
    color: ${props => props.theme.colors.text.primary};
    font-weight: 700;
    line-height: 1;
  }

  .icon {
    font-size: 20px;
    margin-bottom: 4px;
  }
`;

const ScreenshotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const ScreenshotCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.success});
  }
`;

const ScreenshotImage = styled.div`
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, ${props => props.theme.colors.background} 0%, ${props => props.theme.colors.border} 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  position: relative;
  overflow: hidden;

  &::before {
    content: '📸';
    font-size: 32px;
    margin-bottom: 8px;
  }

  &::after {
    content: 'Screenshot Preview';
    position: absolute;
    bottom: 12px;
    font-size: 12px;
    opacity: 0.7;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TaskName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.4;
  flex: 1;
`;

const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const TaskTime = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '🕐';
    font-size: 12px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;

  &:hover:not(:disabled) {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 16px;
  font-weight: 500;
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const LiveTracking = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const employees = [
    { id: 'all', name: t('allEmployees') },
    { id: 'beyza', name: 'BEYZA DÖNMEZ' },
    { id: 'john', name: 'JOHN SMITH' },
    { id: 'sarah', name: 'SARAH JOHNSON' }
  ];

  const departments = [
    { id: 'all', name: t('allDepartments') },
    { id: 'dev', name: t('development') },
    { id: 'design', name: t('design') },
    { id: 'marketing', name: t('marketing') }
  ];

  const allScreenshots = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    task: `${t('development')} ${t('task')} ${i + 1}`,
    time: `${9 + (i % 8)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'PM'}`,
    screenshot: `Screenshot ${i + 1}`,
    status: i % 3 === 0 ? 'online' : i % 3 === 1 ? 'idle' : 'offline',
    employee: employees[Math.floor(Math.random() * (employees.length - 1)) + 1].name,
    department: departments[Math.floor(Math.random() * (departments.length - 1)) + 1].name
  }));

  // Filter screenshots based on current filters
  const filteredScreenshots = allScreenshots.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employee.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEmployee = selectedEmployee === 'all' || 
      item.employee === employees.find(emp => emp.id === selectedEmployee)?.name;
    
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesEmployee && matchesStatus;
  });

  const totalPages = Math.ceil(filteredScreenshots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScreenshots = filteredScreenshots.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedEmployee, selectedStatus]);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <DashboardLayout headerTitle={t('liveTracking')} headerBreadcrumb={`${t('home')} / ${t('liveTracking')}`}>
      <LiveTrackingContainer>
        <Container>
          <ContentSection>
            <TrackingCard>
              <CardHeader>
                <Title>
                  📍 {t('realTimeActivityStream')}
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>ⓘ</span>
                </Title>
              </CardHeader>

              <ActivityInfo>
                <InfoItem>
                  <div className="icon">👥</div>
                  <div className="label">{t('totalActive')}</div>
                  <div className="value">24</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">🟢</div>
                  <div className="label">{t('online')}</div>
                  <div className="value">18</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">🟡</div>
                  <div className="label">{t('idle')}</div>
                  <div className="value">4</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">🔴</div>
                  <div className="label">{t('offline')}</div>
                  <div className="value">2</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">⏰</div>
                  <div className="label">{t('totalHours')}</div>
                  <div className="value">156.5h</div>
                </InfoItem>
              </ActivityInfo>

              <FilterSection>
                <LeftFilters>
                  <FilterDropdown 
                    value={selectedEmployee} 
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </FilterDropdown>

                  <FilterDropdown 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </FilterDropdown>

                  <FilterDropdown 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">{t('allStatus')}</option>
                    <option value="online">{t('online')}</option>
                    <option value="idle">{t('idle')}</option>
                    <option value="offline">{t('offline')}</option>
                  </FilterDropdown>

                  <FilterDropdown 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="today">{t('today')}</option>
                    <option value="yesterday">{t('yesterday')}</option>
                    <option value="week">{t('thisWeek')}</option>
                    <option value="month">{t('thisMonth')}</option>
                    <option value="custom">{t('customRange')}</option>
                  </FilterDropdown>
                </LeftFilters>

                <RightFilters>
                  <SearchInput
                    placeholder={t('searchEmployeeName')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </RightFilters>
              </FilterSection>

              <ResultsInfo>
                <span>
                  {t('showing')} {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredScreenshots.length)} {t('of')} {filteredScreenshots.length} {t('results')}
                </span>
                <span>{paginatedScreenshots.length} {t('itemsOnThisPage')}</span>
              </ResultsInfo>

              <ScreenshotGrid>
                {paginatedScreenshots.map((item) => (
                  <ScreenshotCard key={item.id}>
                    <ScreenshotImage />
                    <CardContent>
                      <TaskHeader>
                        <TaskName>{item.task}</TaskName>
                        <StatusBadge status={item.status}>
                          {t(item.status)}
                        </StatusBadge>
                      </TaskHeader>
                      <TaskMeta>
                        <TaskTime>{item.time}</TaskTime>
                      </TaskMeta>
                    </CardContent>
                  </ScreenshotCard>
                ))}
              </ScreenshotGrid>

              {totalPages > 1 && (
                <PaginationContainer>
                  <PaginationButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← {t('previous')}
                  </PaginationButton>

                  {generatePageNumbers().map((page, index) => (
                    <PaginationButton
                      key={index}
                      active={page === currentPage}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                    >
                      {page}
                    </PaginationButton>
                  ))}

                  <PaginationButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t('next')} →
                  </PaginationButton>

                  <PaginationInfo>
                    {t('page')} {currentPage} {t('of')} {totalPages}
                  </PaginationInfo>
                </PaginationContainer>
              )}
            </TrackingCard>
          </ContentSection>
        </Container>
      </LiveTrackingContainer>
    </DashboardLayout>
  );
};

export default LiveTracking;
