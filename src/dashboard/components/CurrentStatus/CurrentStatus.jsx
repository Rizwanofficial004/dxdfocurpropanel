import React from 'react';
import styled from 'styled-components';

// Styled Components
const CurrentStatusContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: fit-content;
`;

const CurrentStatusTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
  letter-spacing: 0.05em;
`;

const CurrentStatusContent = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;

  @media (max-width: 968px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const StatusListContainer = styled.div`
  flex: 1;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusCount = styled.span`
  font-size: 16px;
  font-weight: 600;
  min-width: 12px;
  color: ${props => props.color};
`;

const StatusLabel = styled.span`
  font-size: 14px;
  color: #374151;
  font-weight: 400;
`;

const StatusArrow = styled.div`
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
`;

const CircularChart = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

const ChartCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChartNumber = styled.span`
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
`;

const CurrentStatus = () => {
  const statusData = [
    { id: 1, label: 'At Work', count: 0, color: '#10b981' },
    { id: 2, label: 'In Meeting', count: 0, color: '#3b82f6' },
    { id: 3, label: 'At Break', count: 0, color: '#f59e0b' },
    { id: 4, label: 'Idle', count: 0, color: '#6b7280' },
    { id: 5, label: 'Off', count: 1, color: '#ef4444' }
  ];

  const totalCount = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <CurrentStatusContainer>
      <CurrentStatusTitle>CURRENT STATUS</CurrentStatusTitle>
      
      <CurrentStatusContent>
        <StatusListContainer>
          <StatusList>
            {statusData.map((item) => (
              <StatusItem key={item.id}>
                <StatusInfo>
                  <StatusCount color={item.color}>
                    {item.count}
                  </StatusCount>
                  <StatusLabel>{item.label}</StatusLabel>
                </StatusInfo>
                <StatusArrow>
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </StatusArrow>
              </StatusItem>
            ))}
          </StatusList>
        </StatusListContainer>
        
        <ChartContainer>
          <CircularChart viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray="314"
              strokeDashoffset="0"
            />
          </CircularChart>
          <ChartCenter>
            <ChartNumber>{totalCount}</ChartNumber>
          </ChartCenter>
        </ChartContainer>
      </CurrentStatusContent>
    </CurrentStatusContainer>
  );
};

export default CurrentStatus;
