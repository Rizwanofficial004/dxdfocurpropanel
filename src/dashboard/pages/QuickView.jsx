import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Notification Banner
const NotificationBanner = styled.div`
  background: #e3f2fd;
  padding: 16px 32px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  color: #1976d2;
  font-size: 14px;
`;

// Main Page Wrapper
const EmployeesPageWrapper = styled.div`
  background: #f8fafc;
  min-height: 100vh;
`;

// Header Section
const PageHeader = styled.div`
  background: #ffffff;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

// Controls Section
const ControlsSection = styled.div`
  background: #ffffff;
  padding: 16px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const StatusDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

// Table Styles
const TableContainer = styled.div`
  background: #ffffff;
  margin: 0 32px 32px 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  text-transform: uppercase;
  white-space: nowrap;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  color: #1f2937;
  font-size: 14px;
  vertical-align: middle;
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled.div`
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 2px;
`;

const TeamName = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #dcfce7;
  color: #166534;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #2563eb;
  }
`;

const BlueCircle = styled.div`
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  margin: 0 auto;
`;

// Pagination
const PaginationContainer = styled.div`
  background: #ffffff;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  margin: 0 32px;
  border-radius: 0 0 8px 8px;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ItemsPerPageSelector = styled.select`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: ${props => props.active ? '#3b82f6' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#374151'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickView = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sample employee data matching the screenshot
  const [employeesData] = useState([]);

  // Filter employees based on search query and status
  const filteredEmployees = employeesData.filter(employee =>
    (employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     employee.designation.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'All' || employee.status === statusFilter)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  return (
    <DashboardLayout headerTitle="Employee Management" headerBreadcrumb="Home / HR / Employees">
      <EmployeesPageWrapper>
        {/* Notification Banner */}
        <NotificationBanner>
          Your user profile has been successfully created.<br />
          You can now download the client app from <a href="https://focusro.com/download" style={{color: '#1976d2'}}>https://focusro.com/download</a> and log in with your password to explore the features.
        </NotificationBanner>

        {/* Page Header */}
        <PageHeader>
          <PageTitle>EMPLOYEES</PageTitle>
          <AddButton>
            <span>+</span>
            NEW EMPLOYEE
          </AddButton>
        </PageHeader>

        {/* Table */}
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader>NAME ↑</TableHeader>
                <TableHeader>STATUS</TableHeader>
                <TableHeader>TIMER</TableHeader>
                <TableHeader>BUTTION</TableHeader>
               
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <EmployeeInfo>
                      <EmployeeName>{employee.name}</EmployeeName>
                      <TeamName>{employee.team}</TeamName>
                    </EmployeeInfo>
                  </TableCell>
                  <TableCell>
                    <StatusBadge>{employee.status}</StatusBadge>
                  </TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell style={{textAlign: 'center'}}>{employee.screensToday}</TableCell>
                  <TableCell>{employee.lastLogin}</TableCell>
                  <TableCell style={{textAlign: 'center'}}>
                    <BlueCircle />
                  </TableCell>
                  <TableCell style={{textAlign: 'center'}}>{employee.dashboardAccess}</TableCell>
                  <TableCell>
                    <ActionButton>👁 VIEW REPORT</ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <PaginationContainer>
          <PaginationInfo>
            <span>Employees per page:</span>
            <ItemsPerPageSelector
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </ItemsPerPageSelector>
            <span>1 – 1 of 1</span>
          </PaginationInfo>
          
          <PaginationButtons>
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ←
            </PaginationButton>
            
            <PaginationButton active={true}>
              1
            </PaginationButton>
            
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              →
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      </EmployeesPageWrapper>
    </DashboardLayout>
  );
};

export default QuickView;
