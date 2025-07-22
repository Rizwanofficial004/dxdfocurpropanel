import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { gsap } from 'gsap';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  AttendanceWrapper,
  AttendanceContainer,
  AttendanceHeader,
  AttendanceTitle,
  AttendanceSubtitle,
  StatsGrid,
  StatsCard,
  StatsIcon,
  StatsValue,
  StatsLabel,
  TableSection,
  TableHeader,
  TableTitle,
  TableSubtitle,
  Table3D,
  TableContainer,
  Table,
  TableHead,
  TableHeaderRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
  UserAvatar,
  ActionButton,
  LoadingSpinner,
  NoDataMessage,
  FilterSection,
  FilterInput,
  FilterSelect
} from '../components/attendance/Attendance.styles';

// Generate dummy attendance data
const generateAttendanceData = () => {
  const employees = [
    'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown',
    'Lisa Anderson', 'Tom Wilson', 'Anna Taylor', 'Chris Martin', 'Jessica Lee',
    'Robert Garcia', 'Amy Rodriguez', 'Kevin Miller', 'Rachel Green', 'Daniel White',
    'Sophie Clark', 'James Thompson', 'Maria Lopez', 'Alex Turner', 'Grace Hall'
  ];

  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  const statuses = ['Present', 'Absent', 'Late', 'Early Leave'];

  return employees.map((name, index) => {
    const checkIn = new Date();
    checkIn.setHours(8 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));
    
    const checkOut = new Date(checkIn);
    checkOut.setHours(checkIn.getHours() + 8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const hoursWorked = status === 'Absent' ? 0 : 7 + Math.random() * 2;
    
    return {
      id: index + 1,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      status,
      checkIn: status === 'Absent' ? '--' : checkIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      checkOut: status === 'Absent' ? '--' : checkOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      hoursWorked: status === 'Absent' ? '0h 0m' : `${Math.floor(hoursWorked)}h ${Math.floor((hoursWorked % 1) * 60)}m`,
      overtime: Math.random() > 0.7 ? `${Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 60)}m` : '--',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    };
  });
};

// Animated Counter Component
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    if (countRef.current) {
      gsap.to({ value: 0 }, {
        value: target,
        duration: duration / 1000,
        ease: "power2.out",
        onUpdate: function() {
          setCount(Math.floor(this.targets()[0].value));
        }
      });
    }
  }, [target, duration]);

  return <span ref={countRef}>{count}{suffix}</span>;
};

// 3D Stats Card Component
const Stats3DCard = ({ icon, value, label, color, delay = 0, isDarkMode }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        {
          rotationX: 90,
          rotationY: 45,
          z: -200,
          opacity: 0,
          scale: 0.5
        },
        {
          rotationX: 0,
          rotationY: 0,
          z: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "back.out(1.7)",
          delay: delay / 1000
        }
      );
    }
  }, [delay]);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationX: -8,
        rotationY: 12,
        z: 80,
        scale: 1.05,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationX: 0,
        rotationY: 0,
        z: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out"
      });
    }
  };

  return (
    <StatsCard
      ref={cardRef}
      color={color}
      delay={delay}
      isDarkMode={isDarkMode}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StatsIcon className="stats-icon">{icon}</StatsIcon>
      <StatsValue className="stats-value" color={color}>
        <AnimatedCounter target={parseInt(value)} />
      </StatsValue>
      <StatsLabel className="stats-label" isDarkMode={isDarkMode}>{label}</StatsLabel>
    </StatsCard>
  );
};

// 3D Table Row Component
const Table3DRow = ({ employee, index, isDarkMode, onEdit, onDelete }) => {
  const rowRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (rowRef.current) {
      // Set initial state
      gsap.set(rowRef.current, {
        opacity: 0,
        y: 20,
        rotationX: 10
      });
      
      // Animate to visible state
      gsap.to(rowRef.current, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: index * 0.05, // Reduced delay for faster appearance
        onComplete: () => setIsVisible(true)
      });
    }
    
    // Fallback in case GSAP fails
    const timer = setTimeout(() => {
      if (!isVisible && rowRef.current) {
        rowRef.current.style.opacity = '1';
        setIsVisible(true);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [index, isVisible]);

  const handleMouseEnter = () => {
    if (rowRef.current) {
      gsap.to(rowRef.current, {
        rotationX: -3,
        z: 15,
        scale: 1.02,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (rowRef.current) {
      gsap.to(rowRef.current, {
        rotationX: 0,
        z: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  return (
    <TableRow
      ref={rowRef}
      index={index}
      isDarkMode={isDarkMode}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TableCell isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserAvatar>
            <span>{employee.name.split(' ').map(n => n[0]).join('')}</span>
          </UserAvatar>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '2px' }}>{employee.name}</div>
            <div style={{ fontSize: '12px', opacity: '0.7' }}>{employee.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell isDarkMode={isDarkMode}>{employee.department}</TableCell>
      <TableCell isDarkMode={isDarkMode}>
        <StatusBadge status={employee.status}>{employee.status}</StatusBadge>
      </TableCell>
      <TableCell isDarkMode={isDarkMode}>{employee.checkIn}</TableCell>
      <TableCell isDarkMode={isDarkMode}>{employee.checkOut}</TableCell>
      <TableCell isDarkMode={isDarkMode}>{employee.hoursWorked}</TableCell>
      <TableCell isDarkMode={isDarkMode}>{employee.overtime}</TableCell>
      <TableCell isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton variant="edit" onClick={() => onEdit(employee.id)}>
            ✏️ Edit
          </ActionButton>
          <ActionButton variant="delete" onClick={() => onDelete(employee.id)}>
            🗑️ Delete
          </ActionButton>
        </div>
      </TableCell>
    </TableRow>
  );
};

const Attendance = () => {
  const themeContext = useTheme();
  const { isDarkMode = false, theme = {} } = themeContext || {};
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Generate attendance data on component mount
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const dummyData = generateAttendanceData();
      setAttendanceData(dummyData);
      setLoading(false);
    }, 500); // Reduced from 1000ms to 500ms
  }, []);

  // Calculate statistics
  const stats = {
    totalEmployees: attendanceData.length,
    presentEmployees: attendanceData.filter(emp => emp.status === 'Present').length,
    absentEmployees: attendanceData.filter(emp => emp.status === 'Absent').length,
    lateEmployees: attendanceData.filter(emp => emp.status === 'Late').length
  };

  // Filter data based on search and filters
  const filteredData = attendanceData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'All' || employee.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = ['All', ...new Set(attendanceData.map(emp => emp.department))];
  const statuses = ['All', 'Present', 'Absent', 'Late', 'Early Leave'];

  const handleEdit = (employeeId) => {
    console.log('Edit employee:', employeeId);
    // Implement edit functionality
  };

  const handleDelete = (employeeId) => {
    console.log('Delete employee:', employeeId);
    // Implement delete functionality with confirmation
    if (window.confirm('Are you sure you want to delete this employee record?')) {
      setAttendanceData(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  return (
    <DashboardLayout headerTitle="Employee Attendance" headerBreadcrumb="Home / HR / Attendance">
      <AttendanceWrapper isDarkMode={isDarkMode}>
        <AttendanceContainer>
          {/* Header Section */}
          <AttendanceHeader>
            <AttendanceTitle isDarkMode={isDarkMode}>
              📊 Employee Attendance Dashboard
            </AttendanceTitle>
            <AttendanceSubtitle isDarkMode={isDarkMode}>
              Track and manage employee attendance with real-time insights
            </AttendanceSubtitle>
          </AttendanceHeader>

          {/* Statistics Cards */}
          <StatsGrid>
            <Stats3DCard
              icon="👥"
              value={stats.totalEmployees}
              label="Total Employees"
              color="#3b82f6"
              delay={0}
              isDarkMode={isDarkMode}
            />
            <Stats3DCard
              icon="✅"
              value={stats.presentEmployees}
              label="Present Today"
              color="#10b981"
              delay={200}
              isDarkMode={isDarkMode}
            />
            <Stats3DCard
              icon="❌"
              value={stats.absentEmployees}
              label="Absent Today"
              color="#ef4444"
              delay={400}
              isDarkMode={isDarkMode}
            />
            <Stats3DCard
              icon="⏰"
              value={stats.lateEmployees}
              label="Late Arrivals"
              color="#f59e0b"
              delay={600}
              isDarkMode={isDarkMode}
            />
          </StatsGrid>

          {/* Filters */}
          <FilterSection>
            <FilterInput
              type="text"
              placeholder="🔍 Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isDarkMode={isDarkMode}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              isDarkMode={isDarkMode}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              isDarkMode={isDarkMode}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </FilterSelect>
          </FilterSection>

          {/* Attendance Table */}
          <TableSection isDarkMode={isDarkMode}>
            <TableHeader isDarkMode={isDarkMode}>
              <TableTitle isDarkMode={isDarkMode}>
                📋 Daily Attendance Report
              </TableTitle>
              <TableSubtitle isDarkMode={isDarkMode}>
                Today • {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {filteredData.length} employees
              </TableSubtitle>
            </TableHeader>

            <Table3D>
              <TableContainer isDarkMode={isDarkMode}>
                {loading ? (
                  <LoadingSpinner isDarkMode={isDarkMode} />
                ) : filteredData.length === 0 ? (
                  <NoDataMessage isDarkMode={isDarkMode}>
                    No employees found matching your criteria
                  </NoDataMessage>
                ) : (
                  <Table>
                    <TableHead>
                      <TableHeaderRow>
                        <TableHeaderCell isDarkMode={isDarkMode}>Employee</TableHeaderCell>
                        <TableHeaderCell isDarkMode={isDarkMode}>Department</TableHeaderCell>
                        <TableHeaderCell isDarkMode={isDarkMode}>Status</TableHeaderCell>
                        <TableHeaderCell isDarkMode={isDarkMode}>Check In</TableHeaderCell>
                        <TableHeaderCell isDarkMode={isDarkMode}>Check Out</TableHeaderCell>
                        <TableHeaderCell isDarkMode={isDarkMode}>Hours Worked</TableHeaderCell>
                        <TableHeaderCell isDarkMode={isDarkMode}>Overtime</TableHeaderCell>
                        <TableHeaderCell isDarkMode={isDarkMode}>Actions</TableHeaderCell>
                      </TableHeaderRow>
                    </TableHead>
                    <TableBody>
                      {filteredData.map((employee, index) => (
                        <Table3DRow
                          key={employee.id}
                          employee={employee}
                          index={index}
                          isDarkMode={isDarkMode}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            </Table3D>
          </TableSection>
        </AttendanceContainer>
      </AttendanceWrapper>
    </DashboardLayout>
  );
};

export default Attendance;
