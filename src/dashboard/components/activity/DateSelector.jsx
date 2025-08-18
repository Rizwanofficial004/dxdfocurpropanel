import React, { useRef } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

const DateSelectorContainer = styled.div`
  background: ${props => props.isDarkMode ? '#1f2937' : '#ffffff'};
  border-radius: 12px;
  margin-bottom: 20px;
`;

const ScrollToggle = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 8px;
`;

const ScrollButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: ${props => props.isDarkMode ? '#374151' : '#f8fafc'};
  color: ${props => props.isDarkMode ? '#9ca3af' : '#64748b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;

  &:hover {
    background: ${props => props.isDarkMode ? '#4b5563' : '#e2e8f0'};
    color: ${props => props.isDarkMode ? '#f3f4f6' : '#475569'};
  }

  &:before {
    content: ${props => props.direction === 'left' ? '"‹"' : '"›"'};
    font-size: 20px;
    font-weight: bold;
  }
`;

const ScrollList = styled.ul`
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
  
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ScrollListItem = styled.li`
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  background: ${props => props.isActive ? 
    (props.isDarkMode ? '#3b82f6' : '#3b82f6') : 
    'transparent'};
  
  &:hover {
    background: ${props => props.isActive ? 
      (props.isDarkMode ? '#2563eb' : '#2563eb') : 
      (props.isDarkMode ? '#374151' : '#f1f5f9')};
  }
`;

const DateNumber = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.isActive ? '#ffffff' : (props.isDarkMode ? '#f3f4f6' : '#1e293b')};
  line-height: 1;
  margin-bottom: 4px;
`;

const DateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
`;

const MonthText = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.isActive ? '#ffffff' : (props.isDarkMode ? '#9ca3af' : '#64748b')};
  line-height: 1;
  text-transform: uppercase;
`;

const YearText = styled.div`
  font-size: 10px;
  font-weight: 400;
  color: ${props => props.isActive ? '#ffffff' : (props.isDarkMode ? '#6b7280' : '#94a3b8')};
  line-height: 1;
`;

const DateSelector = ({ isDarkMode, selectedDate, onDateSelect, selectedMonth }) => {
  const scrollContainerRef = useRef(null);
  
  // Generate dates array based on selectedMonth or current month
  const dates = React.useMemo(() => {
    const currentYear = dayjs().year();
    let targetMonth;
    
    if (!selectedMonth || selectedMonth === 'all') {
      // Show last 15 days to next 15 days if no month selected
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
    } else if (selectedMonth === 'current') {
      targetMonth = dayjs().month(); // Current month (0-based)
    } else {
      // Convert month string to number
      const monthMapping = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      targetMonth = monthMapping[selectedMonth];
      if (targetMonth === undefined) {
        targetMonth = dayjs().month(); // Fallback to current month
      }
    }
    
    // Create a date for the first day of the target month
    const startOfMonth = dayjs().year(currentYear).month(targetMonth).startOf('month');
    const daysInMonth = startOfMonth.daysInMonth();
    
    const datesArray = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = startOfMonth.date(day);
      datesArray.push({
        day: date.format('DD'),
        month: date.format('MMM'),
        year: date.format('YYYY'),
        fullDate: date.format('YYYY-MM-DD')
      });
    }
    return datesArray;
  }, [selectedMonth]);

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
      <ScrollToggle>
        <ScrollButton 
          isDarkMode={isDarkMode}
          direction="left"
          onClick={() => handleScroll('left')}
          title="Previous dates"
        />
        
        <ScrollList ref={scrollContainerRef}>
          {dates.map((date, index) => (
            <ScrollListItem
              key={index}
              isDarkMode={isDarkMode}
              isActive={date.fullDate === selectedDate}
              onClick={() => onDateSelect(date.fullDate)}
            >
              <DateNumber 
                isDarkMode={isDarkMode}
                isActive={date.fullDate === selectedDate}
              >
                {date.day}
              </DateNumber>
              <DateWrapper>
                <MonthText 
                  isDarkMode={isDarkMode}
                  isActive={date.fullDate === selectedDate}
                >
                  {date.month}
                </MonthText>
                <YearText 
                  isDarkMode={isDarkMode}
                  isActive={date.fullDate === selectedDate}
                >
                  {date.year}
                </YearText>
              </DateWrapper>
            </ScrollListItem>
          ))}
        </ScrollList>
        
        <ScrollButton
          isDarkMode={isDarkMode}
          direction="right"
          onClick={() => handleScroll('right')}
          title="Next dates"
        />
      </ScrollToggle>
    </DateSelectorContainer>
  );
};

export default DateSelector;
