import React from 'react';
import styled from 'styled-components';

// Styled components for Time Log Summary tab
const TimeLogSummaryContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const TimeLogSummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TimeLogSummaryTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
`;

const SubTabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const SubTabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.active ? props.theme.colors.primary + '10' : 'transparent'};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  border: none;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary + '05'};
    color: ${props => props.theme.colors.primary};
  }
`;

const SubTabIcon = styled.span`
  font-size: 16px;
  opacity: ${props => props.active ? 1 : 0.6};
`;

const HelpIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.text.secondary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  margin-left: 4px;
`;

const TimeLogContent = styled.div`
  padding: 20px 0;
`;

const NoteText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  margin: 0 0 20px 0;
  padding: 12px;
  background: ${props => props.theme.colors.warning + '10'};
  border-left: 4px solid ${props => props.theme.colors.warning};
  border-radius: 4px;
`;

// Weekly table components
const WeeklyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const WeeklyTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const WeeklyHeaderRow = styled.tr``;

const WeeklyHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  font-size: 14px;
  position: relative;
`;

const SortIcon = styled.span`
  margin-left: 8px;
  color: ${props => props.theme.colors.primary};
  font-size: 12px;
`;

const WeeklyTableBody = styled.tbody``;

const WeeklyRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const WeeklyCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  vertical-align: top;
`;

const EmployeeNameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WeeklyEmployeeName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const EmployeeTeams = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

const HoursCell = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.success};
  font-size: 14px;
`;

const NotEnoughData = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
  font-size: 13px;
`;

// Pagination components
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 16px 0;
`;

const PaginationLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PaginationSelect = styled.select`
  padding: 6px 8px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: white;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const PaginationInfo = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 4px;
`;

const PaginationArrow = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${props => props.theme.colors.border};
  background: white;
  color: ${props => props.disabled ? props.theme.colors.text.disabled : props.theme.colors.text.primary};
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.hover};
  }
`;

const TimeLogSummaryTab = ({ 
  theme, 
  loggedTimeData, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  activeTimeLogTab,
  setActiveTimeLogTab 
}) => {
  // Sample weekly report data
  const weeklyReportData = [
    { name: 'Aba', teams: 'Sales,Auditing Team,Finance', apr2024: '31h 29m', mar2024: '36h 25m', feb2024: null },
    { name: 'Adams', teams: 'Sales & Marketting,Auditing Team', apr2024: '20h 25m', mar2024: null, feb2024: '0h 3m' },
    { name: 'Alita', teams: 'Promotion,IT Team', apr2024: '0h 12m', mar2024: '8h 9m', feb2024: '0h 5m' },
    { name: 'Diana', teams: 'Auditing Team', apr2024: '13h 43m', mar2024: '8h 52m', feb2024: '0h 24m' },
    { name: 'farina', teams: 'HR Admin,Back Office', apr2024: null, mar2024: null, feb2024: '0h 45m' },
    { name: 'Veronica', teams: 'Marketing,Sales,Auditing Team', apr2024: '4h 5m', mar2024: null, feb2024: null },
    { name: 'Alexei', teams: 'Finance,Auditing Team', apr2024: null, mar2024: null, feb2024: null },
  ];

  return (
    <TimeLogSummaryContainer theme={theme}>
      <TimeLogSummaryHeader theme={theme}>
        <TimeLogSummaryTitle theme={theme}>Time Log Summary</TimeLogSummaryTitle>
        {loggedTimeData && (
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
            📊 API Data from: {selectedDate || `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`}
          </div>
        )}
      </TimeLogSummaryHeader>

      {/* Logged Time Summary */}
      {loggedTimeData && (
        <div style={{ 
          background: theme.colors.card || '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
            ⏰ Logged Time Overview
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {loggedTimeData.total_logged_time && (
              <div>
                <strong>Total Logged Time:</strong><br />
                <span style={{ color: '#10b981' }}>{loggedTimeData.total_logged_time}</span>
              </div>
            )}
            {loggedTimeData.productive_time && (
              <div>
                <strong>Productive Time:</strong><br />
                <span style={{ color: '#3b82f6' }}>{loggedTimeData.productive_time}</span>
              </div>
            )}
            {loggedTimeData.break_time && (
              <div>
                <strong>Break Time:</strong><br />
                <span style={{ color: '#f59e0b' }}>{loggedTimeData.break_time}</span>
              </div>
            )}
            {loggedTimeData.efficiency_score && (
              <div>
                <strong>Efficiency Score:</strong><br />
                <span style={{ color: '#8b5cf6' }}>{loggedTimeData.efficiency_score}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      <SubTabContainer theme={theme}>
        <SubTabButton
          theme={theme}
          active={activeTimeLogTab === 'WEEKLY'}
          onClick={() => setActiveTimeLogTab('WEEKLY')}
        >
          <SubTabIcon active={activeTimeLogTab === 'WEEKLY'}>📊</SubTabIcon>
          Weekly Report
          <HelpIcon theme={theme}>?</HelpIcon>
        </SubTabButton>
        <SubTabButton
          theme={theme}
          active={activeTimeLogTab === 'MONTHLY'}
          onClick={() => setActiveTimeLogTab('MONTHLY')}
        >
          <SubTabIcon active={activeTimeLogTab === 'MONTHLY'}>⏰</SubTabIcon>
          Monthly Reports
          <HelpIcon theme={theme}>?</HelpIcon>
        </SubTabButton>
      </SubTabContainer>
      
      <TimeLogContent theme={theme}>
        {activeTimeLogTab === 'WEEKLY' && (
          <>
            <NoteText theme={theme}>
              Current month calculation does not include today's data.
            </NoteText>
            
            {/* API Data Table for Weekly */}
            {loggedTimeData && loggedTimeData.daily_logs ? (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
                  📅 Daily Time Logs
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    background: 'white',
                    border: '1px solid #e9ecef'
                  }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Start Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>End Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Total Hours</th>
                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e9ecef' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loggedTimeData.daily_logs.map((log, index) => (
                        <tr key={index}>
                          <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f4' }}>
                            {log.date || log.work_date || 'N/A'}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f4' }}>
                            {log.start_time || log.first_activity || 'N/A'}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f4' }}>
                            {log.end_time || log.last_activity || 'N/A'}
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f4' }}>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                              {log.total_hours || log.logged_time || 'N/A'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', borderBottom: '1px solid #f1f3f4' }}>
                            <span style={{ 
                              color: log.status === 'Complete' ? '#10b981' : '#f59e0b',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {log.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: theme.colors.text.secondary,
                border: '2px dashed #e9ecef',
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
                <h4>No Time Log Data Available</h4>
                <p>
                  {selectedEmployee 
                    ? `No time log data found for ${selectedEmployee.display_name || selectedEmployee.email}`
                    : 'Please select an employee to view time log data'
                  }
                </p>
              </div>
            )}
          </>
        )}
        {activeTimeLogTab === 'MONTHLY' && (
          <>
            <WeeklyTable>
              <WeeklyTableHeader theme={theme}>
                <WeeklyHeaderRow>
                  <WeeklyHeaderCell theme={theme}>
                    Name
                    <SortIcon>▲</SortIcon>
                  </WeeklyHeaderCell>
                  <WeeklyHeaderCell theme={theme}>Apr 2024</WeeklyHeaderCell>
                  <WeeklyHeaderCell theme={theme}>Mar 2024</WeeklyHeaderCell>
                  <WeeklyHeaderCell theme={theme}>Feb 2024</WeeklyHeaderCell>
                </WeeklyHeaderRow>
              </WeeklyTableHeader>
              <WeeklyTableBody>
                {weeklyReportData.map((employee, index) => (
                  <WeeklyRow key={index}>
                    <WeeklyCell theme={theme}>
                      <EmployeeNameCell>
                        <WeeklyEmployeeName theme={theme}>{employee.name}</WeeklyEmployeeName>
                        <EmployeeTeams theme={theme}>{employee.teams}</EmployeeTeams>
                      </EmployeeNameCell>
                    </WeeklyCell>
                    <WeeklyCell theme={theme}>
                      {employee.apr2024 ? (
                        <HoursCell theme={theme}>{employee.apr2024}</HoursCell>
                      ) : (
                        <NotEnoughData theme={theme}>Not enough data</NotEnoughData>
                      )}
                    </WeeklyCell>
                    <WeeklyCell theme={theme}>
                      {employee.mar2024 ? (
                        <HoursCell theme={theme}>{employee.mar2024}</HoursCell>
                      ) : (
                        <NotEnoughData theme={theme}>Not enough data</NotEnoughData>
                      )}
                    </WeeklyCell>
                    <WeeklyCell theme={theme}>
                      {employee.feb2024 ? (
                        <HoursCell theme={theme}>{employee.feb2024}</HoursCell>
                      ) : (
                        <NotEnoughData theme={theme}>Not enough data</NotEnoughData>
                      )}
                    </WeeklyCell>
                  </WeeklyRow>
                ))}
              </WeeklyTableBody>
            </WeeklyTable>

            <PaginationContainer theme={theme}>
              <PaginationLeft>
                <span style={{ fontSize: '14px', color: theme.colors.text.secondary }}>
                  Employees per page:
                </span>
                <PaginationSelect theme={theme}>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </PaginationSelect>
                <PaginationInfo theme={theme}>1 - 7 of 7</PaginationInfo>
              </PaginationLeft>
              <PaginationControls>
                <PaginationArrow theme={theme} disabled>«</PaginationArrow>
                <PaginationArrow theme={theme} disabled>‹</PaginationArrow>
                <PaginationArrow theme={theme} disabled>›</PaginationArrow>
                <PaginationArrow theme={theme} disabled>»</PaginationArrow>
              </PaginationControls>
            </PaginationContainer>
          </>
        )}
      </TimeLogContent>
    </TimeLogSummaryContainer>
  );
};

export default TimeLogSummaryTab;