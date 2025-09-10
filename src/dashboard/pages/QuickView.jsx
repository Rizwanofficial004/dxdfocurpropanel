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

  // Simplified employee data with just name and numeric value
  const mockEmployees = [
    {
      id: 1,
      name: 'LoLL',
      value: 0
    },
    {
      id: 2,
      name: 'John Smith',
      value: 0
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      value: 0
    },
    {
      id: 4,
      name: 'Mike Wilson',
      value: 0
    },
    {
      id: 5,
      name: 'Emma Davis',
      value: 0
    }
  ];

  const [employees, setEmployees] = useState(mockEmployees);
  const [filteredEmployees, setFilteredEmployees] = useState(mockEmployees);

  // Handle input value change for each employee
  const handleValueChange = (employeeId, newValue) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === employeeId ? { ...emp, value: newValue } : emp
    );
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees);
  };

  // Handle apply action for each employee
  const handleApply = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    alert(`Applied value ${employee.value} for ${employee.name}`);
    // Add your apply logic here
  };

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    Set Timer
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
                    <TableHeaderCell>{t('employee').toUpperCase()} NAME</TableHeaderCell>
                    <TableHeaderCell>VALUE</TableHeaderCell>
                    <TableHeaderCell>ACTION</TableHeaderCell>
                  </TableHeaderRow>
                </TableHeader>
                <TableBody>
                  {currentEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <EmployeeInfo>
                          <EmployeeAvatar>
                            {employee.name.charAt(0)}
                          </EmployeeAvatar>
                          <div>
                            <EmployeeName>{employee.name}</EmployeeName>
                          </div>
                        </EmployeeInfo>
                      </TableCell>
                      <TableCell>
                        <input
                          type="number"
                          value={employee.value}
                          onChange={(e) => handleValueChange(employee.id, e.target.value)}
                          style={{
                            width: '100px',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                          placeholder="Enter value"
                        />
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleApply(employee.id, employee.value)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Apply
                        </button>
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
