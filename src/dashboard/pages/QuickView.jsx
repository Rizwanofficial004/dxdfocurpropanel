import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  QuickViewContainer,
  QuickViewCard,
  NotificationBanner,
  NotificationContent,
  DownloadLink,
  QuickViewHeader,
  HeaderTop,
  HeaderLeft,
  QuickViewTitle,
  HelpIcon,
  HeaderControls,
  SearchContainer,
  SearchInput,
  SearchIcon,
  DateControl,
  DateIcon,
  TableContainer,
  Table,
  TableHeader,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  StatusIndicator,
  EmployeeInfo,
  EmployeeAvatar,
  EmployeeName,
  TeamName,
  TimeCell,
  ProductivityBar,
  ProductivityFill,
  PercentageText,
  PaginationContainer,
  EmployeesPerPage,
  PerPageSelector,
  PaginationRight,
  PageInfo,
  PaginationNav,
  NavButton,
  ResponsiveStyles
} from './QuickView.styles';

const QuickView = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedDate, setSelectedDate] = useState('08/09/2025');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Mock employee data matching the design exactly
  const mockEmployees = [
    {
      id: 1,
      status: 'OFF',
      name: 'LoLL',
      team: 'Team N/A',
      loggedTime: '0h 0m',
      activeTime: '0h 0m',
      productive: '0h 0m',
      distraction: '0h 0m',
      neutral: '0h 0m',
      meeting: '0h 0m',
      break: '0h 0m',
      idle: '0h 0m',
      offline: '0h 0m',
      productivityPercentage: 0,
      email: 'loll@company.com',
      organization: 'Tech Solutions',
      role: 'Employee',
      first_name: 'LoLL',
      last_name: '',
      username: 'loll'
    }
  ];

  const [employees, setEmployees] = useState(mockEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState(mockEmployees);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, employees]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  return (
    <DashboardLayout>
      <ResponsiveStyles>
        <QuickViewContainer>
          <QuickViewCard>
            {/* Notification Banner */}
            <NotificationBanner>
              <NotificationContent>
                <span>{t('profileCreated')}</span>
                <span>
                  {t('downloadClient')}{' '}
                  <DownloadLink href="https://focusro.com/download">
                    https://focusro.com/download
                  </DownloadLink>{' '}
                  {t('loginExplore')}
                </span>
              </NotificationContent>
            </NotificationBanner>

            {/* Header */}
            <QuickViewHeader>
              <HeaderTop>
                <HeaderLeft>
                  <QuickViewTitle>
                    {t('quickView')}
                    <HelpIcon>?</HelpIcon>
                  </QuickViewTitle>
                </HeaderLeft>
                <HeaderControls>
                  <SearchContainer>
                    <SearchIcon>🔍</SearchIcon>
                    <SearchInput
                      type="text"
                      placeholder={t('search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </SearchContainer>
                  <DateControl>
                    <DateIcon>📅</DateIcon>
                    <span>{t('selectDate')}</span>
                  </DateControl>
                  <DateControl>
                    <span>{selectedDate}</span>
                    <DateIcon>📅</DateIcon>
                  </DateControl>
                </HeaderControls>
              </HeaderTop>
            </QuickViewHeader>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableHeaderRow>
                    <TableHeaderCell>{t('status').toUpperCase()}</TableHeaderCell>
                    <TableHeaderCell className="sortable">{t('employee').toUpperCase()} NAME ↑</TableHeaderCell>
                    <TableHeaderCell className="sortable">LOGGED TIME ⓘ</TableHeaderCell>
                    <TableHeaderCell className="sortable">ACTIVE TIME ⓘ</TableHeaderCell>
                    <TableHeaderCell>PRODUCTIVE</TableHeaderCell>
                    <TableHeaderCell>DISTRACTION</TableHeaderCell>
                    <TableHeaderCell>NEUTRAL</TableHeaderCell>
                    <TableHeaderCell>MEETING</TableHeaderCell>
                    <TableHeaderCell>BREAK</TableHeaderCell>
                    <TableHeaderCell className="sortable">IDLE ⓘ</TableHeaderCell>
                    <TableHeaderCell>OFFLINE</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {currentEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <StatusIndicator status={employee.status}>
                          {employee.status}
                        </StatusIndicator>
                      </TableCell>
                      <TableCell>
                        <EmployeeInfo>
                          <EmployeeAvatar>
                            A
                          </EmployeeAvatar>
                          <div>
                            <EmployeeName>{employee.name}</EmployeeName>
                            <TeamName>{employee.team}</TeamName>
                          </div>
                        </EmployeeInfo>
                      </TableCell>
                      <TableCell>
                        <TimeCell>{employee.loggedTime}</TimeCell>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <ProductivityBar>
                            <ProductivityFill percentage={employee.productivityPercentage} />
                          </ProductivityBar>
                          <PercentageText>{employee.productivityPercentage}%</PercentageText>
                        </div>
                        <TimeCell>{employee.activeTime}</TimeCell>
                      </TableCell>
                      <TableCell>
                        <TimeCell>{employee.productive}</TimeCell>
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
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <PaginationContainer>
              <EmployeesPerPage>
                <span>{t('employeesPerPage')}:</span>
                <PerPageSelector
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </PerPageSelector>
              </EmployeesPerPage>
              <PaginationRight>
                <PageInfo>
                  {t('showing')} {startIndex + 1} {t('to')} {Math.min(endIndex, filteredEmployees.length)} {t('of')} {filteredEmployees.length} {t('employees')}
                </PageInfo>
                <PaginationNav>
                  <NavButton
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    ‹
                  </NavButton>
                  <NavButton
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    ›
                  </NavButton>
                </PaginationNav>
              </PaginationRight>
            </PaginationContainer>
          </QuickViewCard>
        </QuickViewContainer>
      </ResponsiveStyles>
    </DashboardLayout>
  );
};

export default QuickView;
