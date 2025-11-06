import React from 'react';
import styled from 'styled-components';

// Styled components for Breaks & Meet tab
const BreaksMeetContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
`;

const BreakMeetSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const BreakMeetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const BreakMeetTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  font-weight: 600;
`;

const InfoIcon = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.theme.colors.info};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const BreakMeetTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const BreakMeetTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const BreakMeetHeaderRow = styled.tr``;

const BreakMeetHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  font-size: 14px;
`;

const BreakMeetTableBody = styled.tbody``;

const BreakMeetRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
  
  &:last-child .total-row {
    font-weight: bold;
    background: ${props => props.theme.colors.background};
  }
`;

const BreakMeetCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  
  &.total-row {
    font-weight: bold;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const DefinedBreakSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const DefinedBreakHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const DefinedBreakTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  font-weight: 600;
`;

const BreaksMeetTab = ({ 
  theme, 
  meetingTimeData, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months 
}) => {
  // Sample data as fallback
  const breakData = [
    { start: '2:24 PM', stop: '3:17 PM', duration: '0h 53m' }
  ];

  const meetingData = [
    { start: '2:03 PM', stop: '2:24 PM', duration: '0h 20m' }
  ];

  const definedBreakData = [
    { start: '11:00 AM', stop: '11:15 AM', duration: '0h 15m' },
    { start: '2:00 PM', stop: '2:30 PM', duration: '0h 30m' },
    { start: '5:30 PM', stop: '5:45 PM', duration: '0h 15m' }
  ];

  return (
    <div>
      {/* API Data Indicator */}
      {meetingTimeData && (
        <div style={{ 
          marginBottom: '20px',
          padding: '12px',
          background: theme.colors.card || '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
            📊 API Data from: {selectedDate || `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`}
          </div>
          {meetingTimeData.total_meeting_time && (
            <div style={{ marginTop: '8px' }}>
              <strong>Total Meeting Time: </strong>
              <span style={{ color: '#3b82f6' }}>{meetingTimeData.total_meeting_time}</span>
            </div>
          )}
        </div>
      )}

      <BreaksMeetContainer>
        {/* Break Section */}
        <BreakMeetSection theme={theme}>
          <BreakMeetHeader theme={theme}>
            <BreakMeetTitle theme={theme}>Break</BreakMeetTitle>
            <InfoIcon theme={theme}>i</InfoIcon>
          </BreakMeetHeader>
          <BreakMeetTable>
            <BreakMeetTableHeader theme={theme}>
              <BreakMeetHeaderRow>
                <BreakMeetHeaderCell theme={theme}>Start</BreakMeetHeaderCell>
                <BreakMeetHeaderCell theme={theme}>Stop</BreakMeetHeaderCell>
                <BreakMeetHeaderCell theme={theme}>Duration</BreakMeetHeaderCell>
              </BreakMeetHeaderRow>
            </BreakMeetTableHeader>
            <BreakMeetTableBody>
              {breakData.map((breakItem, index) => (
                <BreakMeetRow key={index}>
                  <BreakMeetCell theme={theme}>{breakItem.start}</BreakMeetCell>
                  <BreakMeetCell theme={theme}>{breakItem.stop}</BreakMeetCell>
                  <BreakMeetCell theme={theme}>{breakItem.duration}</BreakMeetCell>
                </BreakMeetRow>
              ))}
              <BreakMeetRow>
                <BreakMeetCell theme={theme} className="total-row">Total duration</BreakMeetCell>
                <BreakMeetCell theme={theme} className="total-row"></BreakMeetCell>
                <BreakMeetCell theme={theme} className="total-row">0h 53m</BreakMeetCell>
              </BreakMeetRow>
            </BreakMeetTableBody>
          </BreakMeetTable>
        </BreakMeetSection>

        {/* Meeting Section */}
        <BreakMeetSection theme={theme}>
          <BreakMeetHeader theme={theme}>
            <BreakMeetTitle theme={theme}>Meeting</BreakMeetTitle>
          </BreakMeetHeader>
          <BreakMeetTable>
            <BreakMeetTableHeader theme={theme}>
              <BreakMeetHeaderRow>
                <BreakMeetHeaderCell theme={theme}>Start</BreakMeetHeaderCell>
                <BreakMeetHeaderCell theme={theme}>Stop</BreakMeetHeaderCell>
                <BreakMeetHeaderCell theme={theme}>Duration</BreakMeetHeaderCell>
              </BreakMeetHeaderRow>
            </BreakMeetTableHeader>
            <BreakMeetTableBody>
              {meetingTimeData && meetingTimeData.meetings ? (
                meetingTimeData.meetings.map((meeting, index) => (
                  <BreakMeetRow key={index}>
                    <BreakMeetCell theme={theme}>{meeting.start_time || meeting.start || 'N/A'}</BreakMeetCell>
                    <BreakMeetCell theme={theme}>{meeting.end_time || meeting.stop || meeting.end || 'N/A'}</BreakMeetCell>
                    <BreakMeetCell theme={theme}>{meeting.duration || 'N/A'}</BreakMeetCell>
                  </BreakMeetRow>
                ))
              ) : (
                meetingData.map((meeting, index) => (
                  <BreakMeetRow key={index}>
                    <BreakMeetCell theme={theme}>{meeting.start}</BreakMeetCell>
                    <BreakMeetCell theme={theme}>{meeting.stop}</BreakMeetCell>
                    <BreakMeetCell theme={theme}>{meeting.duration}</BreakMeetCell>
                  </BreakMeetRow>
                ))
              )}
              <BreakMeetRow>
                <BreakMeetCell theme={theme} className="total-row">Total duration</BreakMeetCell>
                <BreakMeetCell theme={theme} className="total-row"></BreakMeetCell>
                <BreakMeetCell theme={theme} className="total-row">
                  {meetingTimeData?.total_meeting_time || '0h 20m'}
                </BreakMeetCell>
              </BreakMeetRow>
            </BreakMeetTableBody>
          </BreakMeetTable>
        </BreakMeetSection>
      </BreaksMeetContainer>

      {/* Defined Break Section */}
      <DefinedBreakSection theme={theme}>
        <DefinedBreakHeader theme={theme}>
          <DefinedBreakTitle theme={theme}>Defined Break</DefinedBreakTitle>
          <InfoIcon theme={theme}>i</InfoIcon>
        </DefinedBreakHeader>
        <BreakMeetTable>
          <BreakMeetTableHeader theme={theme}>
            <BreakMeetHeaderRow>
              <BreakMeetHeaderCell theme={theme}>Start</BreakMeetHeaderCell>
              <BreakMeetHeaderCell theme={theme}>Stop</BreakMeetHeaderCell>
              <BreakMeetHeaderCell theme={theme}>Duration</BreakMeetHeaderCell>
            </BreakMeetHeaderRow>
          </BreakMeetTableHeader>
          <BreakMeetTableBody>
            {definedBreakData.map((definedBreak, index) => (
              <BreakMeetRow key={index}>
                <BreakMeetCell theme={theme}>{definedBreak.start}</BreakMeetCell>
                <BreakMeetCell theme={theme}>{definedBreak.stop}</BreakMeetCell>
                <BreakMeetCell theme={theme}>{definedBreak.duration}</BreakMeetCell>
              </BreakMeetRow>
            ))}
            <BreakMeetRow>
              <BreakMeetCell theme={theme} className="total-row">Total duration</BreakMeetCell>
              <BreakMeetCell theme={theme} className="total-row"></BreakMeetCell>
              <BreakMeetCell theme={theme} className="total-row">1h 0m</BreakMeetCell>
            </BreakMeetRow>
          </BreakMeetTableBody>
        </BreakMeetTable>
      </DefinedBreakSection>
    </div>
  );
};

export default BreaksMeetTab;