import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, TextField, Popover, Box } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

const Wrapper = styled.div`
  font-family: 'Segoe UI', sans-serif;
`;

const Container = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
`;

const Username = styled.div`
  font-weight: 600;
  color: #0364ff;
  font-size: 16px;
  white-space: nowrap;
`;

const Arrow = styled.div`
  cursor: pointer;
  font-size: 20px;
  padding: 4px 10px;
  user-select: none;
  color: #374151;
`;

const DateItem = styled.div`
  background: ${props => (props.active ? '#0364ff' : '#f1f5f9')};
  color: ${props => (props.active ? 'white' : '#111827')};
  font-weight: 600;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  min-width: 55px;
  text-align: center;
  cursor: pointer;

  span {
    display: block;
    font-size: 10px;
    font-weight: 400;
    color: ${props => (props.active ? 'white' : '#6b7280')};
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
`;

const Card = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Img = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
`;

const TaskName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 4px;
`;

const TaskTime = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const ViewMore = styled.div`
  margin-top: 24px;
  text-align: center;

  button {
    padding: 8px 24px;
    background: #0364ff;
    border: none;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }
`;

const dates = [
  { day: '22', month: 'JUN', year: '2025' },
  { day: '23', month: 'JUN', year: '2025' },
  { day: '24', month: 'JUN', year: '2025' },
  { day: '25', month: 'JUN', year: '2025' }
];

const dummyData = Array.from({ length: 12 }, (_, i) => ({
  task: `Task ${i + 1}`,
  time: `${9 + i}:00 AM`,
  image: 'https://via.placeholder.com/300x120.png?text=Screenshot'
}));

const ActivityStream = () => {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [dateRange, setDateRange] = useState([dayjs('2024-06-06'), dayjs('2025-01-01')]);

  const handlePrev = () => {
    if (selected > 0) setSelected(selected - 1);
  };

  const handleNext = () => {
    if (selected < dates.length - 1) setSelected(selected + 1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Wrapper>
        <Container>
          <Title>
            Real Time Activity Stream <span style={{ fontSize: '14px', color: '#9ca3af' }}>ⓘ</span>
          </Title>

          <TopBar>
            <Username>BEYZA DÖNMEZ</Username>
            <Arrow onClick={handlePrev}>&lt;</Arrow>
            {dates.map((date, index) => (
              <DateItem key={index} active={index === selected} onClick={() => setSelected(index)}>
                {date.day} <span>{date.month} {date.year}</span>
              </DateItem>
            ))}
            <Arrow onClick={handleNext}>&gt;</Arrow>

            <TextField
              size="small"
              placeholder="Search employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginLeft: 'auto' }}
            />

            <Button
              variant="contained"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              style={{ backgroundColor: '#0364ff', textTransform: 'none', fontWeight: 500 }}
            >
              Filter Date
            </Button>

            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Box p={2}>
                <DateRangePicker
                  value={dateRange}
                  onChange={(newValue) => setDateRange(newValue)}
                  localeText={{ start: 'From', end: 'To' }}
                />
              </Box>
            </Popover>
          </TopBar>

          <CardGrid>
            {dummyData.slice(0, 6).map((item, i) => (
              <Card key={i}>
                <Img src={item.image} alt={item.task} />
                <TaskName>{item.task}</TaskName>
                <TaskTime>{item.time}</TaskTime>
              </Card>
            ))}
          </CardGrid>

          <ViewMore>
            <button>View More</button>
          </ViewMore>
        </Container>
      </Wrapper>
    </LocalizationProvider>
  );
};

export default ActivityStream;
