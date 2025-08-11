import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import EmployeeCards from '../components/employees/EmployeeCards';
import styled from 'styled-components';

const EmployeesPageWrapper = styled.div`
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const Employees = () => {
  const { theme } = useTheme();

  return (
    <DashboardLayout headerTitle="Employee Management" headerBreadcrumb="Home / HR / Employees">
      <EmployeesPageWrapper theme={theme}>
        <PageHeader>
          <PageTitle theme={theme}>👥 Employee Management Dashboard - CRM Data</PageTitle>
          <PageSubtitle theme={theme}>
            View and manage all employees from the CRM system with Staff ID, Hourly Rate, and Phone Number
          </PageSubtitle>
        </PageHeader>
        
        {/* Use the EmployeeCards component which will fetch CRM data */}
        <EmployeeCards />
      </EmployeesPageWrapper>
    </DashboardLayout>
  );
};

export default Employees;
