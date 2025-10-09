import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const EmployeeReport = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('Aug 2024');
  const [selectedDate, setSelectedDate] = useState(27);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/Staff/Details/');
      const data = await response.json();
      
      console.log('📊 Employee Report API Response:', data);
      
      let staffArray = [];
      
      if (data?.data?.staff && Array.isArray(data.data.staff)) {
        staffArray = data.data.staff;
      }

      console.log(`📋 Loaded ${staffArray.length} employees for report`);

      // Transform staff data
      const employees = staffArray.map(staff => ({
        id: staff.staffid || staff.id,
        name: staff.full_name || `${staff.firstname || ''} ${staff.lastname || ''}`.trim(),
        email: staff.email,
        position: staff.job_position || 'N/A',
        status: staff.active === '1' || staff.active === 1 || staff.active === true ? 'Active' : 'Inactive',
        loginStatus: staff.is_logged_in === '1' ? 'Logged In' : 'Logged Out',
      }));

      setEmployeesData(employees);
      if (employees.length > 0) {
        setSelectedEmployee(employees[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      setLoading(false);
    }
  };

  const getCurrentEmployeeIndex = () => {
    return employeesData.findIndex(emp => emp.id === selectedEmployee?.id);
  };

  const handlePrevEmployee = () => {
    const currentIndex = getCurrentEmployeeIndex();
    if (currentIndex > 0) {
      setSelectedEmployee(employeesData[currentIndex - 1]);
    }
  };

  const handleNextEmployee = () => {
    const currentIndex = getCurrentEmployeeIndex();
    if (currentIndex < employeesData.length - 1) {
      setSelectedEmployee(employeesData[currentIndex + 1]);
    }
  };

  const handlePrevMonth = () => {
    // Logic to change month
  };

  const handleNextMonth = () => {
    // Logic to change month
  };

  const handlePrevDate = () => {
    if (selectedDate > 17) {
      setSelectedDate(selectedDate - 1);
    }
  };

  const handleNextDate = () => {
    if (selectedDate < 28) {
      setSelectedDate(selectedDate + 1);
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const calendarDates = [
    { day: 17, label: 'Sat' }, { day: 18, label: 'Sun' }, { day: 19, label: 'Mon' }, 
    { day: 20, label: 'Tue' }, { day: 21, label: 'Wed' }, { day: 22, label: 'Thu' }, 
    { day: 23, label: 'Fri' }, { day: 24, label: 'Sat' }, { day: 25, label: 'Sun' }, 
    { day: 26, label: 'Mon' }, { day: 27, label: 'Tue' }, { day: 28, label: 'Wed' }
  ];

  const hourSlots = [
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', 
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'
  ];

  return (
    <DashboardLayout 
      headerTitle="Employee Report" 
      headerBreadcrumb="Home / Employees / Report"
    >
      <PageWrapper theme={theme}>
        {/* Header */}
        <SectionTitle theme={theme}>EMPLOYEE</SectionTitle>
        <Description theme={theme}>
          You can pick employees from the drop-down list, and also by using the navigation arrow you can select before/next employee to view the report.
        </Description>

        {/* Main Content Grid */}
        <ContentGrid>
          {/* Left Column - Employee Selection and Month */}
          <LeftColumn>
            {/* Employee Selector */}
            <SelectorCard theme={theme}>
              <SelectorHeader theme={theme}>
                EMPLOYEE
                <NavigationArrows>
                  <NavArrow onClick={handlePrevEmployee} disabled={getCurrentEmployeeIndex() === 0}>‹</NavArrow>
                  <NavArrow onClick={handleNextEmployee} disabled={getCurrentEmployeeIndex() === employeesData.length - 1}>›</NavArrow>
                </NavigationArrows>
              </SelectorHeader>
              <DropdownWrapper>
                <DropdownInput 
                  theme={theme}
                  value={selectedEmployee?.name || 'Select Employee'}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  readOnly
                />
                <ClearButton onClick={() => setSelectedEmployee(null)}>×</ClearButton>
                {dropdownOpen && (
                  <DropdownMenu theme={theme}>
                    {employeesData.map(emp => (
                      <DropdownItem 
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setDropdownOpen(false);
                        }}
                        theme={theme}
                      >
                        {emp.name}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                )}
              </DropdownWrapper>
            </SelectorCard>

            {/* Month Selector */}
            <SelectorCard theme={theme} style={{ marginTop: '20px' }}>
              <SelectorHeader theme={theme}>
                MONTH
                <NavigationArrows>
                  <NavArrow onClick={handlePrevMonth}>‹</NavArrow>
                  <NavArrow onClick={handleNextMonth}>›</NavArrow>
                </NavigationArrows>
              </SelectorHeader>
              <MonthInput theme={theme} value={selectedMonth} readOnly />
              <MonthlyTotal theme={theme}>
                70h 48m
                <InfoLabel>Monthly ⓘ</InfoLabel>
              </MonthlyTotal>
            </SelectorCard>
          </LeftColumn>

          {/* Right Column - Hours Info */}
          <HoursCard theme={theme}>
            {/* Logged Time */}
            <HoursRow>
              <TimeSection>
                <TimeLabel theme={theme}>LOGGED TIME</TimeLabel>
                <TimeValue theme={theme}>9h 50m ⓘ</TimeValue>
              </TimeSection>

              {/* Active Hours Section */}
              <HoursSection>
                <HoursSectionTitle theme={theme}>ACTIVE HOURS</HoursSectionTitle>
                <ActiveTimeValue theme={theme}>8h 25m ⓘ</ActiveTimeValue>
                
                <ActivityGrid>
                  <ActivityItem>
                    <ActivityLabel theme={theme}>PRODUCTIVE</ActivityLabel>
                    <ActivityTime theme={theme}>3h 19m</ActivityTime>
                    <ActivityPercentage theme={theme}>ⓘ</ActivityPercentage>
                  </ActivityItem>
                  
                  <ActivityItem>
                    <ActivityLabel theme={theme}>DISTRACTION</ActivityLabel>
                    <ActivityTime theme={theme}>0h 12m</ActivityTime>
                    <ActivityPercentage theme={theme}>ⓘ</ActivityPercentage>
                  </ActivityItem>
                  
                  <ActivityItem>
                    <ActivityLabel theme={theme}>NEUTRAL</ActivityLabel>
                    <ActivityTime theme={theme}>0h 40m</ActivityTime>
                    <ActivityPercentage theme={theme}>ⓘ</ActivityPercentage>
                  </ActivityItem>
                  
                  <ActivityItem>
                    <ActivityLabel theme={theme}>MEETINGS</ActivityLabel>
                    <MeetingsBadge theme={theme}>
                      <ActivityTime theme={theme}>4h 13m</ActivityTime>
                      <Badge>4</Badge>
                    </MeetingsBadge>
                  </ActivityItem>
                </ActivityGrid>
              </HoursSection>

              {/* Passive Hours Section */}
              <HoursSection>
                <HoursSectionTitle theme={theme}>PASSIVE HOURS</HoursSectionTitle>
                <PassiveTimeValue theme={theme}>1h 24m ⓘ</PassiveTimeValue>
                
                <PassiveGrid>
                  <PassiveItem>
                    <ActivityLabel theme={theme}>BREAK</ActivityLabel>
                    <BreakBadge theme={theme}>
                      <ActivityTime theme={theme}>0h 55m</ActivityTime>
                      <Badge color="#ff9800">2</Badge>
                    </BreakBadge>
                    <ActivityPercentage theme={theme}>ⓘ</ActivityPercentage>
                  </PassiveItem>
                  
                  <PassiveItem>
                    <ActivityLabel theme={theme}>IDLE</ActivityLabel>
                    <ActivityTime theme={theme}>0h 29m</ActivityTime>
                    <PassivePercentage theme={theme}>4.92 % ⓘ</PassivePercentage>
                    <Badge color="#9e9e9e">5</Badge>
                  </PassiveItem>
                  
                  <PassiveItem>
                    <ActivityLabel theme={theme}>OFFLINE</ActivityLabel>
                    <ActivityTime theme={theme}>0h 0m</ActivityTime>
                    <ActivityPercentage theme={theme}>ⓘ</ActivityPercentage>
                    <Badge color="#000">0</Badge>
                  </PassiveItem>
                </PassiveGrid>
              </HoursSection>
            </HoursRow>
          </HoursCard>
        </ContentGrid>

        {/* Bottom Section - Calendar and Timeline */}
        <BottomSection>
          {/* Date Selector */}
          <DateCard theme={theme}>
            <DateHeader theme={theme}>
              DATE
              <NavigationArrows>
                <NavArrow onClick={handlePrevDate}>‹</NavArrow>
                <NavArrow onClick={handleNextDate}>›</NavArrow>
              </NavigationArrows>
            </DateHeader>
            <CalendarGrid>
              {calendarDates.map((date, idx) => (
                <CalendarDay 
                  key={idx}
                  selected={date.day === selectedDate}
                  theme={theme}
                  onClick={() => setSelectedDate(date.day)}
                >
                  <DayNumber selected={date.day === selectedDate}>{date.day}</DayNumber>
                  <DayLabel selected={date.day === selectedDate}>{date.label}</DayLabel>
                </CalendarDay>
              ))}
            </CalendarGrid>
          </DateCard>

          {/* Hours Timeline */}
          <TimelineCard theme={theme}>
            <TimelineHeader theme={theme}>
              HOURS
              <ShiftBadge theme={theme}>SHIFT: 11:00 AM - 8:30 PM (GMT +05:30)</ShiftBadge>
            </TimelineHeader>
            <HoursGrid>
              {hourSlots.map((hour, idx) => (
                <HourSlot key={idx} theme={theme}>
                  <HourLabel theme={theme}>{hour}</HourLabel>
                  <TimeBlock theme={theme} />
                </HourSlot>
              ))}
            </HoursGrid>
            <Legend>
              <LegendItem>
                <LegendColor color="#4caf50" />
                <LegendLabel theme={theme}>Online</LegendLabel>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#9e9e9e" />
                <LegendLabel theme={theme}>Idle Time</LegendLabel>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#2196f3" />
                <LegendLabel theme={theme}>Shift time</LegendLabel>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#424242" />
                <LegendLabel theme={theme}>Offline</LegendLabel>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#ff9800" />
                <LegendLabel theme={theme}>Break</LegendLabel>
              </LegendItem>
            </Legend>
          </TimelineCard>
        </BottomSection>
      </PageWrapper>
    </DashboardLayout>
  );
};

// Styled Components
const PageWrapper = styled.div`
  padding: 24px;
  max-width: 100%;
  background: ${props => props.theme.colors.background};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 12px 0;
  text-transform: uppercase;
`;

const Description = styled.p`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 0 24px 0;
  line-height: 1.6;
  
  &::before {
    content: '▸ ';
    color: ${props => props.theme.colors.text.light};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-bottom: 24px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const SelectorCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  border-radius: 8px;
  padding: 20px;
`;

const SelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
  text-transform: uppercase;
`;

const NavigationArrows = styled.div`
  display: flex;
  gap: 8px;
`;

const NavArrow = styled.button`
  width: 24px;
  height: 24px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownInput = styled.input`
  width: 100%;
  padding: 10px 35px 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.light};
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const DropdownItem = styled.div`
  padding: 10px 12px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const MonthInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  margin-bottom: 16px;
  cursor: pointer;
`;

const MonthlyTotal = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const InfoLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

const HoursCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  border-radius: 8px;
  padding: 24px;
`;

const HoursRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: 24px;
`;

const TimeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 24px;
  border-right: 1px solid ${props => props.theme.colors.border};
`;

const TimeLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
`;

const TimeValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const HoursSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HoursSectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  background: ${props => props.theme.mode === 'dark' ? '#1e293b' : '#f1f5f9'};
  padding: 8px 12px;
  border-radius: 4px;
`;

const ActiveTimeValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const PassiveTimeValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const ActivityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActivityLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
`;

const ActivityTime = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const ActivityPercentage = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.light};
`;

const PassiveGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const PassiveItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PassivePercentage = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
`;

const MeetingsBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BreakBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  background: ${props => props.color || '#2196f3'};
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  min-width: 20px;
  text-align: center;
`;

const BottomSection = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 24px;
`;

const DateCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  border-radius: 8px;
  padding: 20px;
  width: 320px;
`;

const DateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
  text-transform: uppercase;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const CalendarDay = styled.div`
  padding: 12px 8px;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? 
    (props.theme.mode === 'dark' ? '#2196f3' : '#2196f3') : 
    (props.theme.mode === 'dark' ? '#1e293b' : '#f8fafc')};
  border: 1px solid ${props => props.selected ? '#2196f3' : props.theme.colors.border};

  &:hover {
    background: ${props => props.selected ? '#2196f3' : props.theme.colors.hover};
  }
`;

const DayNumber = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.selected ? '#ffffff' : props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const DayLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.selected ? '#ffffff' : props.theme.colors.text.secondary};
`;

const TimelineCard = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  border-radius: 8px;
  padding: 20px;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
  text-transform: uppercase;
`;

const ShiftBadge = styled.div`
  background: transparent;
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 6px;
`;

const HoursGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const HourSlot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const HourLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const TimeBlock = styled.div`
  width: 100%;
  height: 40px;
  background: ${props => props.theme.mode === 'dark' ? '#1e293b' : '#f1f5f9'};
  border-radius: 4px;
`;

const Legend = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  background: ${props => props.color};
  border-radius: 3px;
`;

const LegendLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

export default EmployeeReport;
