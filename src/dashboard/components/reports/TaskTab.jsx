import React from 'react';
import styled from 'styled-components';

// Styled components for Task tab
const TaskContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TaskTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
`;

const TaskTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TaskTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const TaskHeaderRow = styled.tr``;

const TaskHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  font-size: 14px;
`;

const TaskTableBody = styled.tbody``;

const TaskRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
  
  &:last-child .total-row {
    font-weight: bold;
    background: ${props => props.theme.colors.background};
  }
`;

const TaskCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
  
  &.total-row {
    font-weight: bold;
    color: ${props => props.theme.colors.text.primary};
  }
`;

const TaskTab = ({ 
  theme, 
  taskReportData, 
  isLoadingReportData, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  months 
}) => {
  // Sample data as fallback
  const taskData = [
    {
      name: 'BackEnd Work',
      project: 'Software development',
      start: '7:56 PM',
      stop: '8:21 PM',
      duration: '0h 24m'
    },
    {
      name: 'BackEnd Work',
      project: 'Software development',
      start: '4:34 PM',
      stop: '7:32 PM',
      duration: '2h 57m'
    },
    {
      name: 'BackEnd Work',
      project: 'Software development',
      start: '4:21 PM',
      stop: '4:34 PM',
      duration: '0h 13m'
    }
  ];

  const totalDuration = '3h 35m';

  return (
    <TaskContainer theme={theme}>
      <TaskHeader theme={theme}>
        <TaskTitle theme={theme}>Task Report</TaskTitle>
        {taskReportData && (
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
            📊 API Data from: {`${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`}
          </div>
        )}
      </TaskHeader>
      <TaskTable>
        <TaskTableHeader theme={theme}>
          <TaskHeaderRow>
            <TaskHeaderCell theme={theme}>Task Name</TaskHeaderCell>
            <TaskHeaderCell theme={theme}>Project</TaskHeaderCell>
            <TaskHeaderCell theme={theme}>Start Time</TaskHeaderCell>
            <TaskHeaderCell theme={theme}>End Time</TaskHeaderCell>
            <TaskHeaderCell theme={theme}>Duration</TaskHeaderCell>
          </TaskHeaderRow>
        </TaskTableHeader>
        <TaskTableBody>
          {taskReportData && taskReportData.tasks ? (
            taskReportData.tasks.map((task, index) => (
              <TaskRow key={index}>
                <TaskCell theme={theme}>{task.task_name || task.name || 'N/A'}</TaskCell>
                <TaskCell theme={theme}>{task.project || task.project_name || 'N/A'}</TaskCell>
                <TaskCell theme={theme}>{task.start_time || task.start || 'N/A'}</TaskCell>
                <TaskCell theme={theme}>{task.end_time || task.stop || task.end || 'N/A'}</TaskCell>
                <TaskCell theme={theme}>{task.duration || 'N/A'}</TaskCell>
              </TaskRow>
            ))
          ) : (
            // Fallback to sample data if no API data
            taskData.map((task, index) => (
              <TaskRow key={index}>
                <TaskCell theme={theme}>{task.name}</TaskCell>
                <TaskCell theme={theme}>{task.project}</TaskCell>
                <TaskCell theme={theme}>{task.start}</TaskCell>
                <TaskCell theme={theme}>{task.stop}</TaskCell>
                <TaskCell theme={theme}>{task.duration}</TaskCell>
              </TaskRow>
            ))
          )}
          <TaskRow>
            <TaskCell theme={theme} className="total-row">Total Duration</TaskCell>
            <TaskCell theme={theme} className="total-row"></TaskCell>
            <TaskCell theme={theme} className="total-row"></TaskCell>
            <TaskCell theme={theme} className="total-row"></TaskCell>
            <TaskCell theme={theme} className="total-row">
              {taskReportData?.total_duration || totalDuration}
            </TaskCell>
          </TaskRow>
        </TaskTableBody>
      </TaskTable>
    </TaskContainer>
  );
};

export default TaskTab;