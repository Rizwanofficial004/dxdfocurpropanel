
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

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
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  min-height: 400px;
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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activityData, setActivityData] = useState(null);

  // Fetch employees list on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Try multiple endpoints for employee data
      const endpoints = [
        'https://dxdtime.ddsolutions.io/api/users/search/',
        'http://127.0.0.1:8000/api/users/search/',
        'http://localhost:8000/api/users/search/'
      ];

      let response = null;
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Connected to: ${endpoint}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Failed to fetch from: ${endpoint}`, error);
          continue;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.users) {
          setEmployees(data.data.users);
        } else {
          // Fallback to mock data if API fails
          setEmployees([
            { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
            { id: 2, email: 'kiranaiz4@gmail.com', display_name: 'Kiran' },
            { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
          ]);
        }
      } else {
        // Use mock data
        setEmployees([
          { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
          { id: 2, email: 'kiranaiz4@gmail.com', display_name: 'Kiran' },
          { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
      // Use mock data as fallback
      setEmployees([
        { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
        { id: 2, email: 'kiranaiz4@gmail.com', display_name: 'Kiran' },
        { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    if (!selectedEmployee || !startDate || !endDate) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // TODO: Implement actual activity pattern API call here
      // For now, we'll simulate the "not enough data" state
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Simulate no data response
      setActivityData(null);
      
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch when filters change
  useEffect(() => {
    if (selectedEmployee && startDate && endDate) {
      fetchActivityData();
    }
  }, [selectedEmployee, startDate, endDate]);

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading activity pattern...</p>
        </LoadingContainer>
      );
    }

    if (error) {
      return (
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
          <NoDataText>Error loading data</NoDataText>
        </NoDataContainer>
      );
    }

    if (!selectedEmployee || !startDate || !endDate) {
      return (
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
          <NoDataText>Please select employee and date range</NoDataText>
        </NoDataContainer>
      );
    }

    // Default "not enough data" state
    return (
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
        <NoDataText>Not enough data</NoDataText>
      </NoDataContainer>
    );
  };

  return (
    <DashboardLayout>
      <ActivityPatternContainer theme={theme}>
        <ContentSection theme={theme}>
          <Header>
            <Title theme={theme}>ACTIVITY PATTERN</Title>
          </Header>

          <FiltersContainer theme={theme}>
            <FiltersGrid>
              <FilterGroup>
                <FilterLabel theme={theme}>Employee</FilterLabel>
                <FilterSelect
                  theme={theme}
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select employee...</option>
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
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel theme={theme}>End Date</FilterLabel>
                <DatePicker
                  theme={theme}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate} // Ensure end date is not before start date
                />
              </FilterGroup>
            </FiltersGrid>
          </FiltersContainer>

          <ContentArea theme={theme}>
            {renderContent()}
          </ContentArea>
        </ContentSection>
      </ActivityPatternContainer>
    </DashboardLayout>
  );
};

export default ActivityPattern;
