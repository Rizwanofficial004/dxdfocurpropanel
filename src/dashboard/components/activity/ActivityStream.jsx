import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  DateNav,
  EmployeeTab,
  DateTab,
  ArrowButton,
  ContentContainer,
  SearchContainer,
  SearchInput,
  EmptyStateContainer,
  EmptyIcon,
  EmptyText,
  SelectContainer,
  Select
} from './ActivityStream.styles.jsx';

// Helper functions
const getMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'short' }).toUpperCase();
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear + i);
};

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: getMonthName(i + 1)
}));

// Main component
const ActivityStream = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [activeDate, setActiveDate] = useState('05');
  const [searchValue, setSearchValue] = useState('LOLL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get the last 4 days of the selected month
  const dates = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const startDay = Math.max(1, daysInMonth - 3);
    
    return Array.from(
      { length: daysInMonth - startDay + 1 },
      (_, i) => {
        const day = (startDay + i).toString().padStart(2, '0');
        return {
          date: day,
          month: getMonthName(selectedMonth),
          year: selectedYear.toString(),
          active: day === activeDate
        };
      }
    );
  }, [selectedYear, selectedMonth, activeDate]);

  // Handle year and month changes
  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    setActiveDate(null); // Reset active date when year changes
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    setActiveDate(null); // Reset active date when month changes
  };

  if (isLoading) {
    return null;
  }

  return (
    <Container>
      <Title>
        Real Time Activity Stream
        <span style={{ color: '#9ca3af', fontSize: '15px', marginTop: '1px' }}>ⓘ</span>
      </Title>

      <SelectContainer>
        <Select value={selectedYear} onChange={handleYearChange}>
          {generateYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
        <Select value={selectedMonth} onChange={handleMonthChange}>
          {MONTHS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </SelectContainer>

      <DateNav>
        <EmployeeTab>LOLL</EmployeeTab>
        <ArrowButton type="button" onClick={() => {
          const newDate = new Date(selectedYear, selectedMonth - 1, 1);
          newDate.setMonth(newDate.getMonth() - 1);
          setSelectedMonth(newDate.getMonth() + 1);
          setSelectedYear(newDate.getFullYear());
        }}>←</ArrowButton>
        {dates.map(({ date, month, year, active }) => (
          <DateTab 
            key={date} 
            active={active}
            onClick={() => setActiveDate(date)}
          >
            <span className="date">{date}</span>
            <span className="month">{month}</span>
          </DateTab>
        ))}
        <ArrowButton type="button" onClick={() => {
          const newDate = new Date(selectedYear, selectedMonth - 1, 1);
          newDate.setMonth(newDate.getMonth() + 1);
          setSelectedMonth(newDate.getMonth() + 1);
          setSelectedYear(newDate.getFullYear());
        }}>→</ArrowButton>
      </DateNav>

      <ContentContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </SearchContainer>
        
        <EmptyStateContainer>
          <EmptyIcon src="/images/no-data-illustration.svg" alt="No data" />
          <EmptyText>
            No data, Please select different employee or date
          </EmptyText>
        </EmptyStateContainer>
      </ContentContainer>
    </Container>
  );
};

export default ActivityStream;
