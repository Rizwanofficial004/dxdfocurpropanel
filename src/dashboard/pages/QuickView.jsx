import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import GoogleSearch from '../../components/search/GoogleSearch';
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

  // Mock employee data matching the design
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
    },
    {
      id: 2,
      status: 'ACTIVE',
      name: 'Nawaz Ahmed',
      team: 'Development',
      loggedTime: '8h 15m',
      activeTime: '7h 45m',
      productive: '6h 30m',
      distraction: '1h 15m',
      neutral: '0h 0m',
      meeting: '1h 30m',
      break: '0h 30m',
      idle: '0h 15m',
      offline: '0h 0m',
      productivityPercentage: 85,
      email: 'nawaz@company.com',
      organization: 'Tech Solutions',
      role: 'Developer',
      first_name: 'Nawaz',
      last_name: 'Ahmed',
      username: 'nawaz.ahmed'
    },
    {
      id: 3,
      status: 'ACTIVE',
      name: 'Test User',
      team: 'QA',
      loggedTime: '6h 30m',
      activeTime: '6h 0m',
      productive: '5h 15m',
      distraction: '0h 45m',
      neutral: '0h 0m',
      meeting: '0h 30m',
      break: '0h 30m',
      idle: '0h 0m',
      offline: '0h 0m',
      productivityPercentage: 88,
      email: 'testuser@example.com',
      organization: 'Test Organization',
      role: 'Tester',
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    }
  ];

  const [employees, setEmployees] = useState(mockEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState(mockEmployees);

  // Handle search result selection
  const handleSearchResultSelect = (user) => {
    console.log('Selected user:', user);
    setSelectedEmployee(user);
    
    // Filter employees based on selected user
    const filtered = employees.filter(employee =>
      employee.id === user.id ||
      employee.name.toLowerCase().includes(user.first_name?.toLowerCase() || '') ||
      employee.email === user.email
    );
    setFilteredEmployees(filtered.length > 0 ? filtered : employees);
    setCurrentPage(1); // Reset to first page
  };

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
                <span>Your user profile has been successfully created.</span>
                <span>
                  You can now download the client app from{' '}
                  <DownloadLink href="https://focusro.com/download">
                    https://focusro.com/download
                  </DownloadLink>{' '}
                  and log in with your password to explore the features.
                </span>
              </NotificationContent>
            </NotificationBanner>

            {/* Header */}
            <QuickViewHeader>
              <HeaderTop>
                <HeaderLeft>
                  <QuickViewTitle>
                    QUICK VIEW
                    <HelpIcon>?</HelpIcon>
                  </QuickViewTitle>
                </HeaderLeft>
                <HeaderControls>
                  <div style={{ width: '300px' }}>
                    <GoogleSearch
                      placeholder="Search employees..."
                      onResultSelect={handleSearchResultSelect}
                      showAdvanced={false}
                      className="quickview-search"
                    />
                  </div>
                  <DateControl>
                    <DateIcon>📅</DateIcon>
                    <span>SELECT DATE</span>
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
                    <TableHeaderCell>STATUS</TableHeaderCell>
                    <TableHeaderCell className="sortable">EMPLOYEE NAME ↑</TableHeaderCell>
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
                <span>Employees per page:</span>
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
                <PageInfo>1 - 1 of 1</PageInfo>
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
