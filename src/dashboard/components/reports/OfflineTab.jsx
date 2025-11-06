import React from 'react';
import styled from 'styled-components';

// Reuse Idle components for Offline (same structure)
const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const OfflineTableSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const OfflineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const OfflineTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
`;

const OfflineTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const OfflineTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const OfflineHeaderRow = styled.tr``;

const OfflineHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  font-size: 14px;
`;

const OfflineTableBody = styled.tbody``;

const OfflineRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
  
  &:last-child .total-row {
    font-weight: bold;
    background: ${props => props.theme.colors.background};
  }
`;

const OfflineCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  
  &.total-row {
    font-weight: bold;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const OfflineChartSection = styled.div`
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

const OfflineTab = ({ theme }) => {
  // Sample offline data
  const offlineData = [
    { start: '10:59 AM', stop: '11:11 AM', duration: '0h 12m' },
    { start: '11:25 AM', stop: '11:29 AM', duration: '0h 4m' },
    { start: '4:26 PM', stop: '4:31 PM', duration: '0h 5m' },
    { start: '5:08 PM', stop: '5:13 PM', duration: '0h 5m' },
    { start: '6:39 PM', stop: '6:42 PM', duration: '0h 3m' }
  ];

  return (
    <OfflineContainer>
      {/* OFFLINE Table Section */}
      <OfflineTableSection theme={theme}>
        <OfflineHeader theme={theme}>
          <OfflineTitle theme={theme}>OFFLINE</OfflineTitle>
        </OfflineHeader>
        <OfflineTable>
          <OfflineTableHeader theme={theme}>
            <OfflineHeaderRow>
              <OfflineHeaderCell theme={theme}>START</OfflineHeaderCell>
              <OfflineHeaderCell theme={theme}>STOP</OfflineHeaderCell>
              <OfflineHeaderCell theme={theme}>DURATION</OfflineHeaderCell>
            </OfflineHeaderRow>
          </OfflineTableHeader>
          <OfflineTableBody>
            {offlineData.map((offline, index) => (
              <OfflineRow key={index}>
                <OfflineCell theme={theme}>{offline.start}</OfflineCell>
                <OfflineCell theme={theme}>{offline.stop}</OfflineCell>
                <OfflineCell theme={theme}>{offline.duration}</OfflineCell>
              </OfflineRow>
            ))}
            <OfflineRow>
              <OfflineCell theme={theme} className="total-row">Total duration</OfflineCell>
              <OfflineCell theme={theme} className="total-row"></OfflineCell>
              <OfflineCell theme={theme} className="total-row">0h 29m</OfflineCell>
            </OfflineRow>
          </OfflineTableBody>
        </OfflineTable>
      </OfflineTableSection>

      {/* OFFLINE Chart Section */}
      <OfflineChartSection theme={theme}>
        <OfflineHeader theme={theme}>
          <OfflineTitle theme={theme}>OFFLINE CHART</OfflineTitle>
        </OfflineHeader>
        <PieChartWrapper>
          <PieChart theme={theme} />
          <ChartLegend>
            <LegendItem theme={theme}>
              <LegendColor color="#3b82f6" />
              <LegendText>Logged Hours 9h 50m</LegendText>
            </LegendItem>
            <LegendItem theme={theme}>
              <LegendColor color="#e5e7eb" />
              <LegendText>Offline Hours 0h 29m</LegendText>
            </LegendItem>
          </ChartLegend>
        </PieChartWrapper>
      </OfflineChartSection>
    </OfflineContainer>
  );
};

export default OfflineTab;