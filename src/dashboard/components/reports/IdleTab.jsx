import React from 'react';
import styled from 'styled-components';

// Styled components for Idle tab
const IdleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const IdleTableSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const IdleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const IdleTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
`;

const IdleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const IdleTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const IdleHeaderRow = styled.tr``;

const IdleHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  font-size: 14px;
`;

const IdleTableBody = styled.tbody``;

const IdleRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
  
  &:last-child .total-row {
    font-weight: bold;
    background: ${props => props.theme.colors.background};
  }
`;

const IdleCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  
  &.total-row {
    font-weight: bold;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const IdleChartSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const PieChartWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
  justify-content: center;
  margin-top: 20px;
`;

const PieChart = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0deg 320deg,
    #e5e7eb 320deg 360deg
  );
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
  }
`;

const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: ${props => props.color};
`;

const LegendText = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

const IdleTab = ({ 
  theme, 
  idleTimeData, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months 
}) => {
  // Sample data as fallback
  const idleData = [
    { start: '10:59 AM', stop: '11:11 AM', duration: '0h 12m' },
    { start: '11:25 AM', stop: '11:29 AM', duration: '0h 4m' },
    { start: '4:26 PM', stop: '4:31 PM', duration: '0h 5m' },
    { start: '5:08 PM', stop: '5:13 PM', duration: '0h 5m' },
    { start: '6:39 PM', stop: '6:42 PM', duration: '0h 3m' }
  ];

  return (
    <IdleContainer>
      {/* IDLE Table Section */}
      <IdleTableSection theme={theme}>
        <IdleHeader theme={theme}>
          <IdleTitle theme={theme}>IDLE TIME MONITORING</IdleTitle>
          {idleTimeData && (
            <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
              📊 API Data from: {selectedDate || `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`}
            </div>
          )}
        </IdleHeader>
        
        {/* Idle Time Summary */}
        {idleTimeData && (
          <div style={{ 
            background: theme.colors.card || '#f8f9fa',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
              📊 Idle Time Summary
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {idleTimeData.total_idle_time && (
                <div>
                  <strong>Total Idle Time:</strong><br />
                  <span style={{ color: '#ef4444' }}>{idleTimeData.total_idle_time}</span>
                </div>
              )}
              {idleTimeData.idle_sessions_count && (
                <div>
                  <strong>Idle Sessions:</strong><br />
                  <span style={{ color: '#f59e0b' }}>{idleTimeData.idle_sessions_count}</span>
                </div>
              )}
              {idleTimeData.longest_idle_session && (
                <div>
                  <strong>Longest Session:</strong><br />
                  <span style={{ color: '#dc2626' }}>{idleTimeData.longest_idle_session}</span>
                </div>
              )}
              {idleTimeData.average_idle_duration && (
                <div>
                  <strong>Average Duration:</strong><br />
                  <span style={{ color: '#9333ea' }}>{idleTimeData.average_idle_duration}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <IdleTable>
          <IdleTableHeader theme={theme}>
            <IdleHeaderRow>
              <IdleHeaderCell theme={theme}>START</IdleHeaderCell>
              <IdleHeaderCell theme={theme}>STOP</IdleHeaderCell>
              <IdleHeaderCell theme={theme}>DURATION</IdleHeaderCell>
              <IdleHeaderCell theme={theme}>TYPE</IdleHeaderCell>
            </IdleHeaderRow>
          </IdleTableHeader>
          <IdleTableBody>
            {idleTimeData && idleTimeData.idle_sessions ? (
              idleTimeData.idle_sessions.map((session, index) => (
                <IdleRow key={index}>
                  <IdleCell theme={theme}>{session.start_time || session.start || 'N/A'}</IdleCell>
                  <IdleCell theme={theme}>{session.end_time || session.stop || session.end || 'N/A'}</IdleCell>
                  <IdleCell theme={theme}>{session.duration || 'N/A'}</IdleCell>
                  <IdleCell theme={theme}>{session.type || session.idle_type || 'Idle'}</IdleCell>
                </IdleRow>
              ))
            ) : (
              // Fallback to sample data if no API data
              idleData.map((idle, index) => (
                <IdleRow key={index}>
                  <IdleCell theme={theme}>{idle.start}</IdleCell>
                  <IdleCell theme={theme}>{idle.stop}</IdleCell>
                  <IdleCell theme={theme}>{idle.duration}</IdleCell>
                  <IdleCell theme={theme}>Idle</IdleCell>
                </IdleRow>
              ))
            )}
            <IdleRow>
              <IdleCell theme={theme} className="total-row">Total duration</IdleCell>
              <IdleCell theme={theme} className="total-row"></IdleCell>
              <IdleCell theme={theme} className="total-row">
                {idleTimeData?.total_idle_time || '0h 29m'}
              </IdleCell>
              <IdleCell theme={theme} className="total-row"></IdleCell>
            </IdleRow>
          </IdleTableBody>
        </IdleTable>
      </IdleTableSection>

      {/* IDLE Chart Section */}
      <IdleChartSection theme={theme}>
        <IdleHeader theme={theme}>
          <IdleTitle theme={theme}>IDLE CHART</IdleTitle>
        </IdleHeader>
        <PieChartWrapper>
          <PieChart theme={theme} />
          <ChartLegend>
            <LegendItem theme={theme}>
              <LegendColor color="#3b82f6" />
              <LegendText>Logged Hours 9h 50m</LegendText>
            </LegendItem>
            <LegendItem theme={theme}>
              <LegendColor color="#e5e7eb" />
              <LegendText>Idle Hours {idleTimeData?.total_idle_time || '0h 29m'}</LegendText>
            </LegendItem>
          </ChartLegend>
        </PieChartWrapper>
      </IdleChartSection>
    </IdleContainer>
  );
};

export default IdleTab;