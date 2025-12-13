import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Add spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('task-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'task-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

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

const SummaryCard = styled.div`
  background: ${props => props.theme.colors.card || '#f8f9fa'};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
`;

const DaySection = styled.div`
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DayHeader = styled.div`
  padding: 12px 16px;
  background: ${props => props.theme.colors.background};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const DayTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const DayDuration = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 13px;
`;

const DayTasksContainer = styled.div`
  display: ${props => props.expanded ? 'block' : 'none'};
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  border: 2px dashed #e9ecef;
  border-radius: 8px;
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  background: #eff6ff;
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
  const [expandedDays, setExpandedDays] = useState({});
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'daily'

  // Toggle day expansion
  const toggleDay = (date) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  // Format date for display (using user's local timezone)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    // toLocaleDateString automatically uses user's local timezone
    return date.toLocaleDateString(navigator.language || 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get all tasks from all days (for monthly view)
  const getAllTasks = () => {
    if (!taskReportData?.days) return [];

    const allTasks = [];
    taskReportData.days.forEach(day => {
      if (day.tasks && Array.isArray(day.tasks)) {
        day.tasks.forEach(task => {
          allTasks.push({
            ...task,
            date: day.date,
            dayTime: day.time
          });
        });
      }
    });
    return allTasks;
  };

  // Loading state
  if (isLoadingReportData) {
    return (
      <TaskContainer theme={theme}>
        <LoadingState theme={theme}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h4>Loading Task Report Data...</h4>
          <p>Fetching task data for {selectedEmployee?.display_name || selectedEmployee?.email || 'employee'}</p>
        </LoadingState>
      </TaskContainer>
    );
  }

  // No employee selected
  if (!selectedEmployee) {
    return (
      <TaskContainer theme={theme}>
        <EmptyState theme={theme}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h4>Select an Employee</h4>
          <p>Please select an employee from the left panel to view their task report.</p>
        </EmptyState>
      </TaskContainer>
    );
  }

  // No data available
  if (!taskReportData) {
    return (
      <TaskContainer theme={theme}>
        <EmptyState theme={theme}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h4>No Task Data Available</h4>
          <p>No task report data found for {selectedEmployee?.display_name || selectedEmployee?.email}.</p>
        </EmptyState>
      </TaskContainer>
    );
  }

  return (
    <TaskContainer theme={theme}>
      {/* View Mode Toggle */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setViewMode('monthly')}
          style={{
            padding: '8px 16px',
            border: viewMode === 'monthly' ? '2px solid #3b82f6' : '1px solid #e9ecef',
            borderRadius: '6px',
            background: viewMode === 'monthly' ? '#3b82f6' : 'white',
            color: viewMode === 'monthly' ? 'white' : theme.colors.text.primary,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          📊 Monthly Tasks
        </button>
        <button
          onClick={() => setViewMode('daily')}
          style={{
            padding: '8px 16px',
            border: viewMode === 'daily' ? '2px solid #3b82f6' : '1px solid #e9ecef',
            borderRadius: '6px',
            background: viewMode === 'daily' ? '#3b82f6' : 'white',
            color: viewMode === 'daily' ? 'white' : theme.colors.text.primary,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          📅 Daily Breakdown
        </button>
      </div>
      <TaskHeader theme={theme}>
        <TaskTitle theme={theme}>Task Report</TaskTitle>
        {taskReportData && (
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
            📊 {taskReportData.month || `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`}
          </div>
        )}
      </TaskHeader>

      {/* Summary Card */}
      {taskReportData.total_month_time && (
        <SummaryCard theme={theme}>
          <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
            📊 Monthly Summary
          </h4>
          <SummaryGrid theme={theme}>
            <SummaryItem theme={theme}>
              <SummaryLabel theme={theme}>Total Time</SummaryLabel>
              <SummaryValue theme={theme} style={{ color: '#10b981' }}>
                {taskReportData.total_month_time?.formatted || '0h 0m'}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem theme={theme}>
              <SummaryLabel theme={theme}>Working Days</SummaryLabel>
              <SummaryValue theme={theme} style={{ color: '#3b82f6' }}>
                {taskReportData.days?.length || 0} days
              </SummaryValue>
            </SummaryItem>
            <SummaryItem theme={theme}>
              <SummaryLabel theme={theme}>Total Tasks</SummaryLabel>
              <SummaryValue theme={theme} style={{ color: '#8b5cf6' }}>
                {taskReportData.month_tasks?.length || 0} tasks
              </SummaryValue>
            </SummaryItem>
          </SummaryGrid>
        </SummaryCard>
      )}

      {/* Monthly View - All Tasks */}
      {viewMode === 'monthly' && taskReportData.month_tasks && (
        <div>
          <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
            📊 Monthly Tasks Overview
          </h4>
          <TaskTable>
            <TaskTableHeader theme={theme}>
              <TaskHeaderRow>
                <TaskHeaderCell theme={theme}>Task ID</TaskHeaderCell>
                <TaskHeaderCell theme={theme}>Task Name</TaskHeaderCell>
                <TaskHeaderCell theme={theme}>Duration</TaskHeaderCell>
              </TaskHeaderRow>
            </TaskTableHeader>
            <TaskTableBody>
              {taskReportData.month_tasks.map((task, index) => (
                <TaskRow key={task.task_id || index}>
                  <TaskCell theme={theme}>{task.task_id || 'N/A'}</TaskCell>
                  <TaskCell theme={theme}>{task.task_name || 'N/A'}</TaskCell>
                  <TaskCell theme={theme}>{task.time?.formatted || '0h 0m'}</TaskCell>
                </TaskRow>
              ))}
              <TaskRow>
                <TaskCell theme={theme} className="total-row" colSpan="2">Total Duration</TaskCell>
                <TaskCell theme={theme} className="total-row">
                  {taskReportData.total_month_time?.formatted || '0h 0m'}
                </TaskCell>
              </TaskRow>
            </TaskTableBody>
          </TaskTable>
        </div>
      )}

      {/* Daily View - Tasks by Day */}
      {viewMode === 'daily' && taskReportData.days && taskReportData.days.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
            📅 Daily Task Breakdown ({taskReportData.days.length} days)
          </h4>
          {taskReportData.days.map((day, dayIndex) => (
            <DaySection key={day.date || dayIndex} theme={theme}>
              <DayHeader theme={theme} onClick={() => toggleDay(day.date)}>
                <DayTitle theme={theme}>
                  {formatDate(day.date)} - {day.tasks?.length || 0} task(s)
                </DayTitle>
                <DayDuration theme={theme}>
                  {day.time?.formatted || '0h 0m'}
                </DayDuration>
              </DayHeader>
              <DayTasksContainer expanded={expandedDays[day.date]}>
                <TaskTable>
                  <TaskTableHeader theme={theme}>
                    <TaskHeaderRow>
                      <TaskHeaderCell theme={theme}>Task ID</TaskHeaderCell>
                      <TaskHeaderCell theme={theme}>Task Name</TaskHeaderCell>
                      <TaskHeaderCell theme={theme}>Duration</TaskHeaderCell>
                    </TaskHeaderRow>
                  </TaskTableHeader>
                  <TaskTableBody>
                    {day.tasks && day.tasks.length > 0 ? (
                      day.tasks.map((task, taskIndex) => (
                        <TaskRow key={task.task_id || taskIndex}>
                          <TaskCell theme={theme}>{task.task_id || 'N/A'}</TaskCell>
                          <TaskCell theme={theme}>{task.task_name || 'N/A'}</TaskCell>
                          <TaskCell theme={theme}>{task.time?.formatted || '0h 0m'}</TaskCell>
                        </TaskRow>
                      ))
                    ) : (
                      <TaskRow>
                        <TaskCell theme={theme} colSpan="3" style={{ textAlign: 'center', color: theme.colors.text.secondary }}>
                          No tasks for this day
                        </TaskCell>
                      </TaskRow>
                    )}
                    <TaskRow>
                      <TaskCell theme={theme} className="total-row" colSpan="2">Day Total</TaskCell>
                      <TaskCell theme={theme} className="total-row">
                        {day.time?.formatted || '0h 0m'}
                      </TaskCell>
                    </TaskRow>
                  </TaskTableBody>
                </TaskTable>
              </DayTasksContainer>
            </DaySection>
          ))}
        </div>
      )}

      {/* Empty state for daily view */}
      {viewMode === 'daily' && (!taskReportData.days || taskReportData.days.length === 0) && (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <h4>No Daily Data Available</h4>
          <p>No daily task breakdown available for this period.</p>
        </EmptyState>
      )}
    </TaskContainer>
  );
};

export default TaskTab;