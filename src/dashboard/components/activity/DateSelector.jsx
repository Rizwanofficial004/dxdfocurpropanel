import React, { useRef } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f3f4f6' : '#1f2937'};
  white-space: nowrap;
`;

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const DateSelectorContainer = styled.div`
  margin: 16px 0;
  background: ${props => props.isDarkMode ? '#1f2937' : '#ffffff'};
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const ScrollContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ScrollButton = styled.button`
  border: none;
  background: ${props => props.isDarkMode ? '#374151' : '#f3f4f6'};
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isDarkMode ? '#4b5563' : '#e5e7eb'};
  }
`;

const DatesContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 8px;
  padding: 4px;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const DateItem = styled.div`
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.isActive ? 
    (props.isDarkMode ? '#3b82f6' : '#60a5fa') : 
    'transparent'};
  color: ${props => props.isActive ? 
    '#ffffff' : 
    (props.isDarkMode ? '#9ca3af' : '#6b7280')};
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isActive ? 
      (props.isDarkMode ? '#3b82f6' : '#60a5fa') : 
      (props.isDarkMode ? '#374151' : '#f3f4f6')};
  }
`;

const DateNumber = styled.span`
  font-size: 18px;
  font-weight: 600;
`;

const DateText = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

const DateSelector = ({ isDarkMode, selectedDate, onDateSelect }) => {
  const scrollContainerRef = useRef(null);
  
  // Generate dates array (from 15 days ago to 15 days ahead)
  const dates = React.useMemo(() => {
    const today = dayjs();
    const datesArray = [];
    for (let i = -15; i <= 15; i++) {
      const date = today.add(i, 'day');
      datesArray.push({
        day: date.format('DD'),
        month: date.format('MMM'),
        year: date.format('YYYY'),
        fullDate: date.format('YYYY-MM-DD')
      });
    }
    return datesArray;
  }, []);

  // Handle scroll buttons
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <DateSelectorContainer isDarkMode={isDarkMode}>
      <Header>
        <Title isDarkMode={isDarkMode}>Please add date range</Title>
        <RangeContainer>
          {/* Date range picker will go here */}
        </RangeContainer>
      </Header>
      <ScrollContainer>
        <ScrollButton 
          isDarkMode={isDarkMode}
          onClick={() => handleScroll('left')}
          title="Scroll left"
        >
          ←
        </ScrollButton>
        
        <DatesContainer ref={scrollContainerRef}>
          {dates.map((date, index) => (
            <DateItem
              key={index}
              isDarkMode={isDarkMode}
              isActive={date.fullDate === selectedDate}
              onClick={() => onDateSelect(date.fullDate)}
            >
              <DateNumber>{date.day}</DateNumber>
              <DateText>
                <div>{date.month}</div>
                <div>{date.year}</div>
              </DateText>
            </DateItem>
          ))}
        </DatesContainer>
        
        <ScrollButton
          isDarkMode={isDarkMode}
          onClick={() => handleScroll('right')}
          title="Scroll right"
        >
          →
        </ScrollButton>
      </ScrollContainer>
    </DateSelectorContainer>
  );
};

export default DateSelector;
