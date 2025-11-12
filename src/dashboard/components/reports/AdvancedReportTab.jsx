import React, { useState, useEffect, useRef } from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

const AdvancedReportTab = ({ theme, employees = [] }) => {
  const [reportType, setReportType] = useState('TEAMS');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('This month');
  const [selectedMetrics, setSelectedMetrics] = useState({
    'In & Out time': true,
    'Meeting(s)': true,
    'Productive': true,
    'Active duration': true,
    'Idle duration': true,
    'Meeting duration': true,
    'Distraction': true,
    'Logged duration': true,
    'Break': true,
    'Task Count': true,
    'Neutral': true,
    'Work report': true,
    'Breaks duration': true,
    'Task Duration': true,
    'Offline': true
  });
  const [outputOption, setOutputOption] = useState('VIEW REPORT');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(true);
  const [showReportView, setShowReportView] = useState(false);
  const [reportsPerPage, setReportsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTeams, setExpandedTeams] = useState({});
  const dropdownRef = useRef(null);

  // Available teams (you can fetch this from API or use employee departments)
  const availableTeams = [
    'Back Office',
    'Finance',
    'Marketing',
    'Project Development',
    'Promotion',
    'Sales',
    'HR Admin'
  ];

  // Period options
  const periodOptions = [
    'This month',
    'Last month',
    'This week',
    'Last week',
    'Custom range'
  ];

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  const toggleTeamSelection = (team) => {
    setSelectedTeams(prev => {
      if (prev.includes(team)) {
        return prev.filter(t => t !== team);
      } else {
        return [...prev, team];
      }
    });
  };

  // Sample report data structure
  const [reportData, setReportData] = useState([
    {
      teamName: 'Finance',
      employeeCount: 9,
      employees: [
        {
          name: 'Aba',
          data: [
            {
              date: '01-04-2024',
              inTime: '3:06 PM',
              outTime: '8:22 PM',
              idleDuration: '00:05:00',
              idlePercentage: '1.59%',
              break: 2,
              breaksDuration: '00:17:22',
              meetings: 1,
              meetingDuration: '00:00:03',
              tasks: 1,
              taskDuration: '04:57:38',
              productive: '04:00:19',
              distraction: '00:15:59',
              neutral: '00:12:49',
              offline: '00:00:00',
              activeDuration: '04:52:18',
              loggedDuration: '05:15:00'
            },
            {
              date: '18-04-2024',
              inTime: '10:22 AM',
              outTime: '7:27 PM',
              idleDuration: '00:42:00',
              idlePercentage: '7.78%',
              break: 1,
              breaksDuration: '01:11:51',
              meetings: 2,
              meetingDuration: '00:30:07',
              tasks: 0,
              taskDuration: '00:00:00',
              productive: '05:20:19',
              distraction: '00:04:19',
              neutral: '00:23:23',
              offline: '00:00:00',
              activeDuration: '07:06:26',
              loggedDuration: '09:00:00'
            }
          ]
        }
      ]
    },
    { teamName: 'Marketing', employeeCount: 2, employees: [{ name: 'Veronica', data: [] }] },
    { teamName: 'Promotion', employeeCount: 1, employees: [{ name: 'Alita', data: [] }] },
    { teamName: 'Sales', employeeCount: 9, employees: [{ name: 'Aba', data: [] }] },
    { teamName: 'IT Team', employeeCount: 1, employees: [{ name: 'Alita', data: [] }] },
    { teamName: 'Auditing Team', employeeCount: 5, employees: [{ name: 'Adams', data: [] }] },
    { teamName: 'Sales & Marketing', employeeCount: 5, employees: [{ name: 'Adams', data: [] }] }
  ]);

  const handleGenerate = () => {
    console.log('Generating report with:', {
      reportType,
      selectedTeams,
      selectedPeriod,
      selectedMetrics,
      outputOption
    });
    // Add your report generation logic here
    if (outputOption === 'VIEW REPORT' && reportType === 'TEAMS') {
      setShowReportView(true);
    }
  };

  const toggleTeam = (teamName) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamName]: !prev[teamName]
    }));
  };

  const scrollTable = (direction, tableElement) => {
    if (tableElement) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? tableElement.scrollLeft - scrollAmount
        : tableElement.scrollLeft + scrollAmount;
      tableElement.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  const totalReports = reportData.reduce((sum, team) => sum + team.employees.length, 0);
  const totalPages = Math.ceil(totalReports / reportsPerPage);
  const startIndex = (currentPage - 1) * reportsPerPage;
  const endIndex = startIndex + reportsPerPage;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTeamDropdown(false);
      }
    };

    if (showTeamDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTeamDropdown]);

  const getTeamDisplayText = () => {
    if (selectedTeams.length === 0) return 'Select teams...';
    if (selectedTeams.length <= 3) {
      return selectedTeams.join(', ');
    }
    return `${selectedTeams.slice(0, 3).join(', ')}, +${selectedTeams.length - 3} more`;
  };

  // Flatten all metrics into a single array for horizontal layout
  const allMetrics = [
    'In & Out time', 'Meeting(s)', 'Productive', 'Active duration',
    'Idle duration', 'Meeting duration', 'Distraction', 'Logged duration',
    'Break', 'Task Count', 'Neutral', 'Work report',
    'Breaks duration', 'Task Duration', 'Offline'
  ];

  return (
    <div style={{
      padding: '30px',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      borderRadius: '12px',
      border: '2px solid #ef4444',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}>
      {/* All Filters Accordion */}
      <Accordion 
        expanded={accordionExpanded}
        onChange={() => setAccordionExpanded(!accordionExpanded)}
        sx={{
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: '8px !important',
          overflow: 'hidden',
          '&:before': {
            display: 'none'
          },
          '&.Mui-expanded': {
            margin: '0 0 24px 0'
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            padding: '16px 20px',
            minHeight: '56px',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
            },
            '& .MuiAccordionSummary-content': {
              margin: 0,
              alignItems: 'center'
            }
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '16px',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}>
            <span>⚙️</span>
            <span>FILTERS</span>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '24px', background: 'white' }}>
          {/* Report Type Selection */}
          <div style={{ 
            marginBottom: '24px',
            padding: '16px',
            background: '#fafbfc',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: theme.colors.text.primary
            }}>
              REPORT TYPE
            </label>
            <div style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                color: theme.colors.text.primary,
                padding: '8px 16px',
                borderRadius: '6px',
                background: reportType === 'TEAMS' ? '#eff6ff' : 'white',
                border: reportType === 'TEAMS' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="reportType"
                  value="TEAMS"
                  checked={reportType === 'TEAMS'}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6'
                  }}
                />
                TEAMS
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                color: theme.colors.text.primary,
                padding: '8px 16px',
                borderRadius: '6px',
                background: reportType === 'EMPLOYEES' ? '#eff6ff' : 'white',
                border: reportType === 'EMPLOYEES' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                transition: 'all 0.2s'
              }}>
                <input
                  type="radio"
                  name="reportType"
                  value="EMPLOYEES"
                  checked={reportType === 'EMPLOYEES'}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: '#3b82f6'
                  }}
                />
                EMPLOYEES
              </label>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Choose Team Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.text.primary
              }}>
                CHOOSE A TEAM <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div
                onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  color: theme.colors.text.primary,
                  minHeight: '44px',
                  transition: 'all 0.2s',
                  boxShadow: showTeamDropdown ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!showTeamDropdown) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showTeamDropdown) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1
                }}>
                  {getTeamDisplayText()}
                </span>
                <span style={{ 
                  marginLeft: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
                  transition: 'transform 0.2s',
                  transform: showTeamDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>▼</span>
              </div>
              {showTeamDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
                  zIndex: 1000,
                  maxHeight: '240px',
                  overflowY: 'auto'
                }}>
                  {availableTeams.map((team, index) => (
                    <label
                      key={team}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: index < availableTeams.length - 1 ? '1px solid #f3f4f6' : 'none',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team)}
                        onChange={() => toggleTeamSelection(team)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#3b82f6',
                          flexShrink: 0
                        }}
                      />
                      <span style={{ flex: 1 }}>{team}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Select Period Dropdown */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: theme.colors.text.primary
              }}>
                SELECT PERIOD <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: theme.colors.text.primary,
                  minHeight: '44px',
                  transition: 'all 0.2s',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b7280\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '40px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                {periodOptions.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Report Metrics Checkboxes */}
          <div style={{ 
            padding: '20px',
            background: '#fafbfc',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '20px',
              fontSize: '15px',
              fontWeight: '700',
              color: theme.colors.text.primary,
              letterSpacing: '0.3px'
            }}>
              SELECT METRICS
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {allMetrics.map((metric) => (
                <label
                  key={metric}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: theme.colors.text.primary,
                    padding: '10px 16px',
                    borderRadius: '6px',
                    transition: 'all 0.2s',
                    background: selectedMetrics[metric] ? '#eff6ff' : 'white',
                    border: selectedMetrics[metric] ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    fontWeight: selectedMetrics[metric] ? '500' : '400',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedMetrics[metric]) {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedMetrics[metric]) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics[metric] || false}
                    onChange={() => toggleMetric(metric)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#3b82f6',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ lineHeight: '1.4' }}>{metric}</span>
                </label>
              ))}
            </div>
          </div>
        </AccordionDetails>
      </Accordion>

      {/* Output Options and Generate Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Output Options */}
        <div style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            color: theme.colors.text.primary,
            padding: '10px 20px',
            borderRadius: '6px',
            background: outputOption === 'VIEW REPORT' ? '#eff6ff' : 'transparent',
            border: outputOption === 'VIEW REPORT' ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>
            <input
              type="radio"
              name="outputOption"
              value="VIEW REPORT"
              checked={outputOption === 'VIEW REPORT'}
              onChange={(e) => setOutputOption(e.target.value)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#3b82f6'
              }}
            />
            VIEW REPORT
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            color: theme.colors.text.primary,
            padding: '10px 20px',
            borderRadius: '6px',
            background: outputOption === 'DOWNLOAD AS CSV' ? '#eff6ff' : 'transparent',
            border: outputOption === 'DOWNLOAD AS CSV' ? '2px solid #3b82f6' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>
            <input
              type="radio"
              name="outputOption"
              value="DOWNLOAD AS CSV"
              checked={outputOption === 'DOWNLOAD AS CSV'}
              onChange={(e) => setOutputOption(e.target.value)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                accentColor: '#3b82f6'
              }}
            />
            DOWNLOAD AS CSV
          </label>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          style={{
            padding: '14px 40px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          GENERATE
        </button>
      </div>

      {/* Advanced Report View Table */}
      {showReportView && outputOption === 'VIEW REPORT' && reportType === 'TEAMS' && (
        <div style={{
          marginTop: '30px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          padding: '20px'
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <Typography variant="h5" sx={{
              fontWeight: 700,
              color: theme.colors.text.primary,
              fontSize: '20px'
            }}>
              ADVANCED REPORT VIEW
            </Typography>
          </Box>

          {/* Team Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reportData.map((team, teamIndex) => (
              <div key={teamIndex} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                {/* Team Header */}
                <div
                  onClick={() => toggleTeam(team.teamName)}
                  style={{
                    padding: '12px 16px',
                    background: expandedTeams[team.teamName] ? '#f0f9ff' : 'white',
                    borderBottom: expandedTeams[team.teamName] ? '2px solid #3b82f6' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedTeams[team.teamName] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        color: '#3b82f6'
                      }}
                    />
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: theme.colors.text.primary
                    }}>
                      {team.teamName} ({team.employeeCount})
                    </span>
                  </div>
                </div>

                {/* Employee Data */}
                {expandedTeams[team.teamName] && team.employees.map((employee, empIndex) => (
                  <div key={empIndex} style={{
                    padding: '16px',
                    background: '#fafbfc',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <Typography variant="subtitle2" sx={{
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: theme.colors.text.primary
                    }}>
                      EMPLOYEE NAME: {employee.name}
                    </Typography>
                    
                    {employee.data && employee.data.length > 0 ? (
                      <Box sx={{ position: 'relative' }}>
                        {/* MUI Table */}
                        <TableContainer 
                          component={Paper}
                          className="table-scroll-container"
                          sx={{
                            maxWidth: '100%',
                            overflowX: 'auto',
                            boxShadow: 'none',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        >
                          <Table sx={{ minWidth: 1400 }} size="small">
                            <TableHead>
                              <TableRow sx={{ 
                                background: '#f8f9fa',
                                '& .MuiTableCell-head': {
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  color: theme.colors.text.primary,
                                  whiteSpace: 'nowrap',
                                  borderBottom: '2px solid #e5e7eb'
                                }
                              }}>
                                <TableCell>Date</TableCell>
                                <TableCell>In time</TableCell>
                                <TableCell>Out time</TableCell>
                                <TableCell>Idle duration (%)</TableCell>
                                <TableCell>Break</TableCell>
                                <TableCell>Breaks duration</TableCell>
                                <TableCell>Meeting(s)</TableCell>
                                <TableCell>Meeting duration</TableCell>
                                <TableCell>Task(s)</TableCell>
                                <TableCell>Task duration</TableCell>
                                <TableCell>Productive</TableCell>
                                <TableCell>Distraction</TableCell>
                                <TableCell>Neutral</TableCell>
                                <TableCell>Offline</TableCell>
                                <TableCell>Active duration</TableCell>
                                <TableCell>Logged duration</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {employee.data.map((row, rowIndex) => (
                                <TableRow
                                  key={rowIndex}
                                  sx={{
                                    '&:nth-of-type(even)': {
                                      backgroundColor: '#fafbfc'
                                    },
                                    '&:nth-of-type(odd)': {
                                      backgroundColor: 'white'
                                    },
                                    '&:last-child td': {
                                      borderBottom: 'none'
                                    },
                                    '& .MuiTableCell-body': {
                                      fontSize: '13px',
                                      color: theme.colors.text.primary,
                                      borderBottom: '1px solid #f3f4f6'
                                    }
                                  }}
                                >
                                  <TableCell>{row.date}</TableCell>
                                  <TableCell>{row.inTime}</TableCell>
                                  <TableCell>{row.outTime}</TableCell>
                                  <TableCell>{row.idleDuration} ({row.idlePercentage})</TableCell>
                                  <TableCell>{row.break}</TableCell>
                                  <TableCell>{row.breaksDuration}</TableCell>
                                  <TableCell>{row.meetings}</TableCell>
                                  <TableCell>{row.meetingDuration}</TableCell>
                                  <TableCell>{row.tasks}</TableCell>
                                  <TableCell>{row.taskDuration}</TableCell>
                                  <TableCell>{row.productive}</TableCell>
                                  <TableCell>{row.distraction}</TableCell>
                                  <TableCell>{row.neutral}</TableCell>
                                  <TableCell>{row.offline}</TableCell>
                                  <TableCell>{row.activeDuration}</TableCell>
                                  <TableCell>{row.loggedDuration}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ) : (
                      <Box sx={{
                        padding: '20px',
                        textAlign: 'center',
                        color: theme.colors.text.secondary
                      }}>
                        <Typography variant="body2">
                          No data available for this employee
                        </Typography>
                      </Box>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Pagination Bottom */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              Reports per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={reportsPerPage}
                onChange={(e) => {
                  setReportsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                sx={{
                  fontSize: '14px',
                  height: '32px'
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              {startIndex + 1} - {Math.min(endIndex, totalReports)} of {totalReports}
            </Typography>
            <IconButton
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <KeyboardArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <KeyboardArrowRightIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <KeyboardDoubleArrowRightIcon fontSize="small" />
            </IconButton>
          </Box>
        </div>
      )}
    </div>
  );
};

export default AdvancedReportTab;

