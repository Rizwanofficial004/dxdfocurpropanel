import React, { useState } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Container } from '../styles/commonStyles';
import { useLanguage } from '../context/LanguageContext';

const QuickViewContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
  transition: background-color 0.3s ease;
`;

const ContentSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const QuickViewCard = styled.div`
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
  margin-bottom: 24px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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

const DatePicker = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 16px 12px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  white-space: nowrap;

  &:first-child {
    padding-left: 20px;
  }

  &:last-child {
    padding-right: 20px;
  }
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const TableCell = styled.td`
  padding: 16px 12px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  border-right: 1px solid ${props => props.theme.colors.border};

  &:first-child {
    padding-left: 20px;
  }

  &:last-child {
    padding-right: 20px;
    border-right: none;
  }
`;

const StatusColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isOnline ? '#10b981' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const StatusText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
`;

const EmployeeColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EmployeeAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const TeamName = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const TimeCell = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const ProgressCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressBar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: conic-gradient(${props => props.theme.colors.primary} ${props => props.percentage * 3.6}deg, ${props => props.theme.colors.border} 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::before {
    content: '';
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${props => props.theme.colors.surface};
    position: absolute;
  }
`;

const ProgressText = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  position: relative;
  z-index: 1;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
`;

const PaginationInfo = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

const ItemsPerPageSelector = styled.select`
  padding: 6px 8px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const QuickView = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('2025-07-04');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const employeeData = [
    {
      id: 1,
      name: 'Ahter Sağlam',
      team: t('teamNA') || 'Team N/A',
      status: t('off') || 'OFF',
      isOnline: false,
      loggedTime: '0h 0m',
      activeTime: '0h 0m',
      productive: 0,
      distraction: '0h 0m',
      neutral: '0h 0m',
      meeting: '0h 0m',
      break: '0h 0m',
      idle: '0h 0m',
      offline: '0h 0m'
    },
    {
      id: 2,
      name: 'Atakan İzzet Kahraman',
      team: t('teamNA') || 'Team N/A',
      status: t('off') || 'OFF',
      isOnline: false,
      loggedTime: '0h 0m',
      activeTime: '0h 0m',
      productive: 0,
      distraction: '0h 0m',
      neutral: '0h 0m',
      meeting: '0h 0m',
      break: '0h 0m',
      idle: '0h 0m',
      offline: '0h 0m'
    },
    {
      id: 3,
      name: 'Bahar Dülger',
      team: t('teamNA') || 'Team N/A',
      status: t('off') || 'OFF',
      isOnline: false,
      loggedTime: '0h 0m',
      activeTime: '0h 0m',
      productive: 0,
      distraction: '0h 0m',
      neutral: '0h 0m',
      meeting: '0h 0m',
      break: '0h 0m',
      idle: '0h 0m',
      offline: '0h 0m'
    },
    {
      id: 4,
      name: 'Begüm Damla Şen',
      team: t('teamNA') || 'Team N/A',
      status: t('off') || 'OFF',
      isOnline: false,
      loggedTime: '0h 0m',
      activeTime: '0h 0m',
      productive: 0,
      distraction: '0h 0m',
      neutral: '0h 0m',
      meeting: '0h 0m',
      break: '0h 0m',
      idle: '0h 0m',
      offline: '0h 0m'
    },
    {
      id: 5,
      name: 'Berna Topal',
      team: t('teamNA') || 'Team N/A',
      status: t('off') || 'OFF',
      isOnline: false,
      loggedTime: '0h 0m',
      activeTime: '0h 0m',
      productive: 0,
      distraction: '0h 0m',
      neutral: '0h 0m',
      meeting: '0h 0m',
      break: '0h 0m',
      idle: '0h 0m',
      offline: '0h 0m'
    },
    {
      id: 6,
      name: 'Beyza Dönmez',
      team: t('teamNA') || 'Team N/A',
      status: t('off') || 'OFF',
      isOnline: false,
      loggedTime: '0h 0m',
      activeTime: '0h 0m',
      productive: 0,
      distraction: '0h 0m',
      neutral: '0h 0m',
      meeting: '0h 0m',
      break: '0h 0m',
      idle: '0h 0m',
      offline: '0h 0m'
    }
  ];

  const filteredEmployees = employeeData.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
    <DashboardLayout headerTitle={t('quickView')} headerBreadcrumb={`${t('home')} / ${t('quickView')}`}>
      <QuickViewContainer>
        <Container>
          <ContentSection>
            <QuickViewCard>
              <CardHeader>
                <HeaderLeft>
                  <Title>
                    {t('quickView').toUpperCase()}
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>ⓘ</span>
                  </Title>
                </HeaderLeft>
                <HeaderRight>
                  <SearchInput
                    placeholder={t('search').toUpperCase()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <DatePicker
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </HeaderRight>
              </CardHeader>

              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>{t('status').toUpperCase()}</TableHeader>
                      <TableHeader>{t('employeeName').toUpperCase()} ↑</TableHeader>
                      <TableHeader>{t('loggedTime').toUpperCase()} ⓘ</TableHeader>
                      <TableHeader>{t('activeTime').toUpperCase()} ⓘ</TableHeader>
                      <TableHeader>{t('productive').toUpperCase()}</TableHeader>
                      <TableHeader>{t('distraction').toUpperCase()}</TableHeader>
                      <TableHeader>{t('neutral').toUpperCase()}</TableHeader>
                      <TableHeader>{t('meeting').toUpperCase()}</TableHeader>
                      <TableHeader>{t('break').toUpperCase()}</TableHeader>
                      <TableHeader>{t('idle').toUpperCase()} ⓘ</TableHeader>
                      <TableHeader>{t('offline').toUpperCase()}</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <StatusColumn>
                            <StatusIcon isOnline={employee.isOnline}>
                              {employee.isOnline ? '●' : '○'}
                            </StatusIcon>
                            <StatusText>{employee.status}</StatusText>
                          </StatusColumn>
                        </TableCell>
                        <TableCell>
                          <EmployeeColumn>
                            <EmployeeAvatar>
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </EmployeeAvatar>
                            <EmployeeInfo>
                              <EmployeeName>{employee.name}</EmployeeName>
                              <TeamName>{employee.team}</TeamName>
                            </EmployeeInfo>
                          </EmployeeColumn>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.loggedTime}</TimeCell>
                        </TableCell>
                        <TableCell>
                          <ProgressCell>
                            <ProgressBar percentage={employee.productive}>
                              <ProgressText>{employee.productive}%</ProgressText>
                            </ProgressBar>
                            <TimeCell>{employee.activeTime}</TimeCell>
                          </ProgressCell>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.activeTime}</TimeCell>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.distraction}</TimeCell>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.neutral}</TimeCell>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.meeting}</TimeCell>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.break}</TimeCell>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.idle}</TimeCell>
                        </TableCell>
                        <TableCell>
                          <TimeCell>{employee.offline}</TimeCell>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>

              <PaginationContainer>
                <PaginationInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>
                      {t('showing')} {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} {t('of')} {filteredEmployees.length} {t('entries')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{t('show')}</span>
                      <ItemsPerPageSelector
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </ItemsPerPageSelector>
                      <span>{t('entries')}</span>
                    </div>
                  </div>
                </PaginationInfo>

                <PaginationControls>
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
                </PaginationControls>
              </PaginationContainer>
            </QuickViewCard>
          </ContentSection>
        </Container>
      </QuickViewContainer>
    </DashboardLayout>
  );
};

export default QuickView;
