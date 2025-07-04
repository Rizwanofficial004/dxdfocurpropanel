// Announcement Table using MUI DataGrid with Manual Filtering
import * as React from 'react';
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaGripVertical, FaFilter, FaDownload, FaSearch } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const Container = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: bold;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 12px;

  svg {
    cursor: pointer;
    font-size: 18px;
    color: #4b5563;
    transition: color 0.2s ease;

    &:hover {
      color: #6d28d9;
    }
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  input {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
`;

const AnnouncementTable = () => {
  const { t } = useLanguage();
  
  const initialRows = [
    { 
      id: 1, 
      title: t('annualCompanyRetreat') || 'Annual Company Retreat', 
      start: 'Jun 10, 2024', 
      end: 'Jun 15, 2024', 
      desc: t('annualRetreatDesc') || 'A week-long retreat for team building and strategy sessions.' 
    },
    { 
      id: 2, 
      title: t('clientAppreciationEvent') || 'Client Appreciation Event', 
      start: 'Nov 05, 2024', 
      end: 'Nov 05, 2024', 
      desc: t('clientAppreciationDesc') || 'Event to show appreciation for our valued clients.' 
    },
    { 
      id: 3, 
      title: t('employeeTrainingProgram') || 'Employee Training Program', 
      start: 'Sep 05, 2024', 
      end: 'Sep 10, 2024', 
      desc: t('trainingProgramDesc') || 'Intensive training sessions for new employees.' 
    },
    { 
      id: 4, 
      title: t('endOfYearGala') || 'End of Year Gala', 
      start: 'Dec 20, 2024', 
      end: 'Dec 20, 2024', 
      desc: t('yearEndGalaDesc') || 'Celebration event to close out the year.' 
    },
    { 
      id: 5, 
      title: t('healthWellnessFair') || 'Health and Wellness Fair', 
      start: 'Sep 20, 2024', 
      end: 'Sep 20, 2024', 
      desc: t('healthWellnessDesc') || 'An event focused on promoting health and wellness among employees.' 
    },
    { 
      id: 6, 
      title: t('midYearPerformanceReview') || 'Mid-Year Performance Review', 
      start: 'Jul 15, 2024', 
      end: 'Jul 16, 2024', 
      desc: t('performanceReviewDesc') || 'Review of employee performance for the first half of the year.' 
    },
    { 
      id: 7, 
      title: t('productLaunch') || 'Product Launch', 
      start: 'Aug 15, 2024', 
      end: 'Aug 15, 2024', 
      desc: t('productLaunchDesc') || 'Official launch event for the new product line.' 
    },
    { 
      id: 8, 
      title: t('quarterlyBusinessReview') || 'Quarterly Business Review', 
      start: 'Jul 01, 2024', 
      end: 'Jul 02, 2024', 
      desc: t('businessReviewDesc') || 'Review of business performance for the past quarter.' 
    },
    { 
      id: 9, 
      title: t('teamBuildingWorkshop') || 'Team Building Workshop', 
      start: 'Oct 12, 2024', 
      end: 'Oct 13, 2024', 
      desc: t('teamBuildingDesc') || 'Workshop aimed at improving team collaboration and communication skills.' 
    },
  ];

  const [filterText, setFilterText] = useState('');

  const filteredRows = initialRows.filter((row) =>
    row.title.toLowerCase().includes(filterText.toLowerCase()) ||
    row.desc.toLowerCase().includes(filterText.toLowerCase())
  );

  const columns = [
    { field: 'title', headerName: t('title'), flex: 1 },
    { field: 'start', headerName: t('startDate'), flex: 1 },
    { field: 'end', headerName: t('endDate'), flex: 1 },
    { field: 'desc', headerName: t('description'), flex: 2 },
  ];

  return (
    <Container as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <TitleBar>
        <Title>📣 {t('announcement')}</Title>
        <Toolbar>
          <FaGripVertical title={t('density')} />
          <FaFilter title={t('filter')} />
          <FaDownload title={t('export')} />
          <FaSearch title={t('search')} />
        </Toolbar>
      </TitleBar>

      <FilterBar>
        <input
          type="text"
          placeholder={t('searchTitleOrDescription') || 'Search title or description...'}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </FilterBar>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableRowSelectionOnClick
          disableColumnMenu
        />
      </div>
    </Container>
  );
};

export default AnnouncementTable;