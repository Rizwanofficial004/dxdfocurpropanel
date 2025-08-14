import styled from 'styled-components';

// Main page wrapper styles
export const EmployeesPageWrapper = styled.div`
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

export const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

export const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

export const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
`;

// Enhanced UI wrapper styles
export const EmployeesWrapper = styled.div`
  padding: 2rem;
  background: ${props => props.isDarkMode ? '#1a202c' : '#f7fafc'};
  min-height: 100vh;
`;

export const EmployeesContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

export const EmployeesHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

export const EmployeesTitle = styled.h1`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

export const EmployeesSubtitle = styled.p`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 1.1rem;
  max-width: 800px;
  margin: 0 auto;
`;

// Stats summary styles
export const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

export const StatCard = styled.div`
  background: ${props => props.isDarkMode ? '#2d3748' : '#ffffff'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.color || '#e2e8f0'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const StatIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

export const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color || '#3182ce'};
  margin-bottom: 0.25rem;
`;

export const StatLabel = styled.div`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Filter section styles
export const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const FilterInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem;
  border: 2px solid ${props => props.isDarkMode ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.isDarkMode ? '#2d3748' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

// Grid and layout styles
export const EmployeesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  
  &::before {
    content: '⟳';
    font-size: 2rem;
    margin-right: 0.5rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 1.1rem;
`;

// Employee card styles
export const EmployeeCard = styled.div`
  background: ${props => props.isDarkMode ? '#2d3748' : '#ffffff'};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid ${props => props.isDarkMode ? '#4a5568' : '#e2e8f0'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  }
`;

export const EmployeeAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  overflow: hidden;
  background: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const EmployeeInfo = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

export const EmployeeName = styled.h3`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const EmployeeTitle = styled.p`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

export const EmployeeEmail = styled.p`
  color: ${props => props.isDarkMode ? '#81c784' : '#2e7d32'};
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

export const EmployeeContact = styled.p`
  color: ${props => props.isDarkMode ? '#90caf9' : '#1976d2'};
  font-size: 0.9rem;
`;

export const EmployeeDetails = styled.div`
  margin-bottom: 1.5rem;
`;

export const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.isDarkMode ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 0.85rem;
  font-weight: 500;
`;

export const DetailValue = styled.span`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 0.85rem;
  font-weight: 600;
`;

// Rating section styles
export const RatingSection = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

export const RatingStars = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

export const Star = styled.span`
  font-size: 1.2rem;
  color: ${props => props.filled ? '#fbbf24' : '#d1d5db'};
`;

export const RatingValue = styled.div`
  color: ${props => props.isDarkMode ? '#a0aec0' : '#4a5568'};
  font-size: 0.9rem;
  font-weight: 500;
`;

// Action buttons styles
export const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

export const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.variant === 'primary') {
      return `
        background: #3182ce;
        color: white;
        &:hover { background: #2c5282; }
      `;
    } else if (props.variant === 'secondary') {
      return `
        background: #38a169;
        color: white;
        &:hover { background: #2f855a; }
      `;
    } else if (props.variant === 'danger') {
      return `
        background: #e53e3e;
        color: white;
        &:hover { background: #c53030; }
      `;
    }
  }}
`;

// AI Insights styles
export const AIInsightsSection = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.isDarkMode ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'};
  border-radius: 8px;
  border-left: 4px solid #4299e1;
`;

export const AIInsightsTitle = styled.h4`
  color: ${props => props.isDarkMode ? '#63b3ed' : '#3182ce'};
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const AIInsightsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const AIInsightItem = styled.li`
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#2d3748'};
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
  
  &:before {
    content: '✨';
    position: absolute;
    left: 0;
    color: #4299e1;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;
