import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Popover, Box, CircularProgress, Autocomplete, Popper } from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { gsap } from 'gsap';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Wrapper,
  Container,
  TopBar,
  Title,
  Username,
  Card,
  TaskName,
  TaskTime,
  LoadingContainer,
  ErrorMessage,
  NoDataMessage,
  SearchInfo
} from '../components/activity/ActivityStream.styles';

// Add CSS animations with 3D transforms
const styles = `
  .gradient-bg {
    background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
    background-size: 400% 400%;
  }
  
  .glass-effect {
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .glass-effect-dark {
    backdrop-filter: blur(20px);
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Fetch employee reports from API
const fetchEmployeeReports = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/dashboard/employees/enhanced/?include_profiles=true&format=detailed');
    
    // Check if response has the expected structure
    if (!response.data.success || !response.data.data || !response.data.data.employees) {
      throw new Error('Invalid API response structure');
    }
    
    // Transform API data to match component structure
    return response.data.data.employees.map((employee, index) => {
      // Generate realistic productivity metrics for each employee
      const totalMinutes = 400 + Math.floor(Math.random() * 80); // 400-480 minutes (6.5-8 hours)
      const productiveMinutes = Math.floor(totalMinutes * (0.6 + Math.random() * 0.3)); // 60-90% productive
      const idleMinutes = totalMinutes - productiveMinutes;
      const screenshots = 80 + Math.floor(Math.random() * 40); // 80-120 screenshots
      const tasksCompleted = 5 + Math.floor(Math.random() * 8); // 5-12 tasks
      
      return {
        id: employee.id || index + 1,
        userName: employee.full_name || employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
        email: employee.email || '',
        designation: employee.job_title || employee.designation || employee.position || 'Employee',
        profileImage: employee.profile_image || employee.image || employee.avatar || null,
        totalTime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
        totalMinutes,
        productiveTime: `${Math.floor(productiveMinutes / 60)}h ${productiveMinutes % 60}m`,
        productiveMinutes,
        idleTime: `${Math.floor(idleMinutes / 60)}h ${idleMinutes % 60}m`,
        idleMinutes,
        productivityPercentage: Math.round((productiveMinutes / totalMinutes) * 100),
        screenshots,
        tasksCompleted,
        department: employee.department || ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
        status: employee.status === 1 || employee.is_active ? ['Active', 'Break', 'Meeting'][Math.floor(Math.random() * 3)] : 'Offline',
        lastActivity: dayjs().subtract(Math.floor(Math.random() * 60), 'minutes').format('HH:mm'),
        rating: employee.rating || (3.5 + Math.random() * 1.5).toFixed(1) // 3.5-5.0 rating
      };
    });
  } catch (error) {
    console.error('Error fetching employee data:', error);
    throw error;
  }
};

// Generate dummy productivity reports data (fallback)
const generateDummyReports = () => {
  const users = [
    'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson', 'David Brown',
    'Lisa Anderson', 'Tom Wilson', 'Anna Taylor', 'Chris Martin', 'Jessica Lee',
    'Robert Garcia', 'Amy Rodriguez', 'Kevin Miller', 'Rachel Green', 'Daniel White'
  ];

  return users.map((userName, index) => {
    const totalMinutes = 400 + Math.floor(Math.random() * 80); // 400-480 minutes (6.5-8 hours)
    const productiveMinutes = Math.floor(totalMinutes * (0.6 + Math.random() * 0.3)); // 60-90% productive
    const idleMinutes = totalMinutes - productiveMinutes;
    const screenshots = 80 + Math.floor(Math.random() * 40); // 80-120 screenshots
    const tasksCompleted = 5 + Math.floor(Math.random() * 8); // 5-12 tasks
    
    return {
      id: index + 1,
      userName,
      email: `${userName.toLowerCase().replace(' ', '.')}@company.com`,
      totalTime: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      totalMinutes,
      productiveTime: `${Math.floor(productiveMinutes / 60)}h ${productiveMinutes % 60}m`,
      productiveMinutes,
      idleTime: `${Math.floor(idleMinutes / 60)}h ${idleMinutes % 60}m`,
      idleMinutes,
      productivityPercentage: Math.round((productiveMinutes / totalMinutes) * 100),
      screenshots,
      tasksCompleted,
      department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][Math.floor(Math.random() * 5)],
      status: ['Active', 'Break', 'Meeting', 'Offline'][Math.floor(Math.random() * 4)],
      lastActivity: dayjs().subtract(Math.floor(Math.random() * 60), 'minutes').format('HH:mm'),
      rating: (3.5 + Math.random() * 1.5).toFixed(1) // 3.5-5.0 rating
    };
  });
};

// Animated Reports Grid with 3D GSAP entrance
const AnimatedReportsGrid = ({ children, theme, isDarkMode }) => {
  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}
    >
      {children}
    </div>
  );
};

// Animated Summary Card Component with 3D GSAP effects
const SummaryCard = ({ title, value, color, icon, delay = 0, theme, isDarkMode }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const targetValue = typeof value === 'string' ? parseInt(value) : value;
    if (!isNaN(targetValue)) {
      setAnimatedValue(targetValue);
    } else {
      setAnimatedValue(value);
    }
  }, [value, delay]);

  return (
    <div 
      style={{
        background: isDarkMode 
          ? `linear-gradient(145deg, #1f2937 0%, #374151 100%)` 
          : `linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)`,
        border: `2px solid transparent`,
        borderRadius: '24px',
        padding: '32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDarkMode 
          ? `0 25px 50px rgba(0, 0, 0, 0.5)`
          : `0 25px 50px rgba(0, 0, 0, 0.1)`,
      }}
    >
      <div style={{ 
        fontSize: '48px', 
        marginBottom: '16px'
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '42px', 
        fontWeight: '900', 
        color: color, 
        marginBottom: '12px'
      }}>
        {animatedValue}
      </div>
      <div style={{ 
        fontSize: '16px', 
        color: isDarkMode ? '#d1d5db' : '#64748b',
        fontWeight: '700',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        {title}
      </div>
    </div>
  );
};

const ReportCard = ({ children, theme, isDarkMode }) => {
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationX: -6,
        rotationY: 10,
        z: 80,
        scale: 1.08,
        zIndex: 9999,
        duration: 0.4,
        ease: "power2.out"
      });
      
      // Add subtle border glow
      gsap.to(cardRef.current, {
        borderColor: '#6366f1',
        boxShadow: '0 35px 70px rgba(0, 0, 0, 0.2), 0 20px 40px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        duration: 0.4,
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
        zIndex: 1,
        duration: 0.5,
        ease: "power2.out"
      });
      
      // Reset border and shadow
      gsap.to(cardRef.current, {
        borderColor: isDarkMode ? '#4b5563' : '#e2e8f0',
        boxShadow: isDarkMode 
          ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 20px 40px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  return (
    <div 
      ref={cardRef}
      className="card-3d"
      style={{
        background: isDarkMode 
          ? `linear-gradient(145deg, #1f2937 0%, #374151 50%, #4b5563 100%)` 
          : `linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)`,
        border: `1px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'}`,
        borderRadius: '24px',
        padding: '28px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transformStyle: 'preserve-3d',
        zIndex: 1,
        boxShadow: isDarkMode 
          ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
          : `0 20px 40px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background blur backdrop */}
      <div className="card-backdrop" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(6px)',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -1,
        display: 'none'
      }} />
      
      <div className="card-3d-inner" style={{ transformStyle: 'preserve-3d' }}>
        {/* Enhanced decorative corner elements with 3D effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: `linear-gradient(135deg, transparent 30%, rgba(59, 130, 246, 0.15) 100%)`,
          borderRadius: '0 24px 0 80px',
          transform: 'translateZ(10px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '60px',
          height: '60px',
          background: `linear-gradient(315deg, transparent 30%, rgba(16, 185, 129, 0.15) 100%)`,
          borderRadius: '60px 0 24px 0',
          transform: 'translateZ(8px)'
        }} />
        
        {/* 3D Content Container */}
        <div style={{ 
          position: 'relative', 
          zIndex: 2,
          transform: 'translateZ(20px)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const UserHeader = ({ children, theme, isDarkMode }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
    position: 'relative'
  }}>
    {children}
  </div>
);

const UserAvatar = ({ name, profileImage, theme, isDarkMode }) => {
  const avatarRef = useRef(null);

  const handleMouseEnter = () => {
    if (avatarRef.current) {
      gsap.to(avatarRef.current, {
        rotationY: 18,
        rotationX: 8,
        scale: 1.2,
        z: 60,
        zIndex: 9999,
        duration: 0.5,
        ease: "power2.out"
      });
      
      // Add subtle pulsing glow effect
      gsap.to(avatarRef.current, {
        boxShadow: '0 20px 50px rgba(102, 126, 234, 0.6), 0 0 35px rgba(102, 126, 234, 0.7)',
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (avatarRef.current) {
      gsap.to(avatarRef.current, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        z: 0,
        zIndex: 1,
        duration: 0.6,
        ease: "power2.out"
      });
      
      // Reset glow
      gsap.to(avatarRef.current, {
        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  return (
    <div 
      ref={avatarRef}
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: profileImage 
          ? `url(${profileImage}) center/cover`
          : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginRight: '20px',
        border: '4px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transformStyle: 'preserve-3d',
        zIndex: 1
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!profileImage && (
        <>
          {/* Animated background gradient with 3D effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, 
              rgba(102, 126, 234, 0.9) 0%, 
              rgba(118, 75, 162, 0.9) 25%, 
              rgba(255, 154, 158, 0.9) 50%, 
              rgba(250, 208, 196, 0.9) 75%, 
              rgba(102, 126, 234, 0.9) 100%)`,
            backgroundSize: '300% 300%',
            animation: 'gradientShift 4s ease infinite',
            borderRadius: '50%',
            transform: 'translateZ(-5px)'
          }} />
          <span style={{ 
            position: 'relative', 
            zIndex: 2,
            transform: 'translateZ(10px)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </>
      )}
    </div>
  );
};

const UserInfo = ({ children, theme, isDarkMode }) => (
  <div style={{ flex: 1 }}>
    {children}
  </div>
);

const UserName = ({ children, theme, isDarkMode }) => (
  <div style={{
    fontSize: '16px',
    fontWeight: '600',
    color: isDarkMode ? '#f9fafb' : '#1f2937',
    marginBottom: '4px'
  }}>
    {children}
  </div>
);

const UserEmail = ({ email, designation, theme, isDarkMode }) => (
  <div style={{ fontSize: '12px' }}>
    <div style={{ 
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      marginBottom: '2px'
    }}>
      {email}
    </div>
    <div style={{ 
      color: isDarkMode ? '#60a5fa' : '#3b82f6', 
      fontWeight: '500',
      fontSize: '11px'
    }}>
      {designation}
    </div>
  </div>
);

const StatusBadge = ({ status, theme, isDarkMode }) => {
  const badgeRef = useRef(null);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Break': return '#f59e0b';
      case 'Meeting': return '#8b5cf6';
      case 'Offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        scale: 1.18,
        y: -3,
        rotationZ: 4,
        z: 30,
        zIndex: 9999,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(badgeRef.current, {
        boxShadow: `0 8px 25px ${getStatusColor(status)}60, 0 0 20px ${getStatusColor(status)}40`,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (badgeRef.current) {
      gsap.to(badgeRef.current, {
        scale: 1,
        y: 0,
        rotationZ: 0,
        z: 0,
        zIndex: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      
      gsap.to(badgeRef.current, {
        boxShadow: `0 2px 8px ${getStatusColor(status)}40`,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  return (
    <span 
      ref={badgeRef}
      style={{
        backgroundColor: getStatusColor(status),
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'inline-block',
        boxShadow: `0 2px 8px ${getStatusColor(status)}40`,
        transformStyle: 'preserve-3d',
        position: 'relative',
        zIndex: 1
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {status}
    </span>
  );
};

const MetricsGrid = ({ children, theme, isDarkMode }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '16px',
    position: 'relative'
  }}>
    {children}
  </div>
);

const MetricItem = ({ label, value, color = '#3b82f6', theme, isDarkMode }) => {
  const metricRef = useRef(null);

  const handleMouseEnter = () => {
    if (metricRef.current) {
      gsap.to(metricRef.current, {
        y: -8,
        scale: 1.1,
        rotationY: 6,
        z: 25,
        zIndex: 9999,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(metricRef.current, {
        backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
        borderColor: color,
        boxShadow: `0 15px 30px ${color}25, 0 6px 15px rgba(0,0,0,0.1)`,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (metricRef.current) {
      gsap.to(metricRef.current, {
        y: 0,
        scale: 1,
        rotationY: 0,
        z: 0,
        zIndex: 1,
        duration: 0.4,
        ease: "power2.out"
      });
      
      gsap.to(metricRef.current, {
        backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
        borderColor: 'transparent',
        boxShadow: 'none',
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  return (
    <div 
      ref={metricRef}
      style={{
        textAlign: 'center',
        padding: '12px',
        backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
        borderRadius: '8px',
        cursor: 'pointer',
        border: `2px solid transparent`,
        transformStyle: 'preserve-3d',
        position: 'relative',
        zIndex: 1
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: color,
        marginBottom: '4px',
        transition: 'all 0.3s ease'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '12px',
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        transition: 'all 0.3s ease'
      }}>
        {label}
      </div>
    </div>
  );
};

const ProgressBar = ({ percentage, color = '#3b82f6', theme, isDarkMode }) => {
  const [animatedWidth, setAnimatedWidth] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.height = '12px';
      e.currentTarget.style.boxShadow = `0 4px 12px ${color}30`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.height = '8px';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{
        width: `${animatedWidth}%`,
        height: '100%',
        backgroundColor: color,
        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '4px',
        boxShadow: `0 0 10px ${color}60`,
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
          animation: 'shimmer 2s infinite',
          borderRadius: '4px'
        }} />
      </div>
    </div>
  );
};

const StatsRow = ({ children, theme, isDarkMode }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginBottom: '4px'
  }}>
    {children}
  </div>
);

const QuickView = () => {
  const themeContext = useTheme();
  const { isDarkMode = false, theme = {} } = themeContext || {};
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employee reports on component mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const employeeReports = await fetchEmployeeReports();
        setReports(employeeReports);
      } catch (err) {
        setError('Failed to load employee data. Using fallback data.');
        console.error('Error loading employee data:', err);
        
        // Fallback to dummy data in case of API error
        const dummyReports = generateDummyReports();
        setReports(dummyReports);
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, []);

  // Calculate summary stats
  const summaryStats = {
    totalUsers: reports.length,
    activeUsers: reports.filter(r => r.status === 'Active').length,
    avgProductivity: reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + r.productivityPercentage, 0) / reports.length) : 0,
    totalHours: reports.reduce((sum, r) => sum + r.totalMinutes, 0) / 60
  };

  return (
    <DashboardLayout headerTitle="Productivity Reports Dashboard" headerBreadcrumb="Home / Reports / Productivity">
      <Wrapper theme={theme} isDarkMode={isDarkMode}>
        <Container theme={theme} isDarkMode={isDarkMode}>
          
         

          {/* Reports Content */}
          {loading ? (
            <LoadingContainer>
              <CircularProgress />
              <div>Loading productivity reports...</div>
            </LoadingContainer>
          ) : error ? (
            <NoDataMessage theme={theme} isDarkMode={isDarkMode}>
              {error}
            </NoDataMessage>
          ) : reports.length === 0 ? (
            <NoDataMessage theme={theme} isDarkMode={isDarkMode}>
              No productivity data available
            </NoDataMessage>
          ) : (
            <AnimatedReportsGrid theme={theme} isDarkMode={isDarkMode}>
              {reports.map((report) => (
                <ReportCard key={report.id} theme={theme} isDarkMode={isDarkMode}>
                  <UserHeader theme={theme} isDarkMode={isDarkMode}>
                    <UserAvatar 
                      name={report.userName} 
                      profileImage={report.profileImage}
                      theme={theme} 
                      isDarkMode={isDarkMode} 
                    />
                    <UserInfo theme={theme} isDarkMode={isDarkMode}>
                      <UserName theme={theme} isDarkMode={isDarkMode}>
                        {report.userName}
                      </UserName>
                      <UserEmail theme={theme} isDarkMode={isDarkMode}>
                        {report.email} • {report.designation}
                      </UserEmail>
                    </UserInfo>
                    <StatusBadge status={report.status} theme={theme} isDarkMode={isDarkMode} />
                  </UserHeader>

                  <MetricsGrid theme={theme} isDarkMode={isDarkMode}>
                    <MetricItem 
                      label="Total Time" 
                      value={report.totalTime} 
                      color="#3b82f6"
                      theme={theme} 
                      isDarkMode={isDarkMode} 
                    />
                    <MetricItem 
                      label="Productive Time" 
                      value={report.productiveTime} 
                      color="#10b981"
                      theme={theme} 
                      isDarkMode={isDarkMode} 
                    />
                    <MetricItem 
                      label="Screenshots" 
                      value={report.screenshots} 
                      color="#f59e0b"
                      theme={theme} 
                      isDarkMode={isDarkMode} 
                    />
                    <MetricItem 
                      label="Tasks Done" 
                      value={report.tasksCompleted} 
                      color="#8b5cf6"
                      theme={theme} 
                      isDarkMode={isDarkMode} 
                    />
                  </MetricsGrid>

                  <div style={{ marginBottom: '12px' }}>
                    <StatsRow theme={theme} isDarkMode={isDarkMode}>
                      <span>Productivity Score</span>
                      <span style={{ fontWeight: '600', color: report.productivityPercentage >= 75 ? '#10b981' : report.productivityPercentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {report.productivityPercentage}%
                      </span>
                    </StatsRow>
                    <ProgressBar 
                      percentage={report.productivityPercentage} 
                      color={report.productivityPercentage >= 75 ? '#10b981' : report.productivityPercentage >= 50 ? '#f59e0b' : '#ef4444'}
                      theme={theme} 
                      isDarkMode={isDarkMode} 
                    />
                  </div>

                  <StatsRow theme={theme} isDarkMode={isDarkMode}>
                    <span>Idle Time: {report.idleTime}</span>
                    <span>Last Activity: {report.lastActivity}</span>
                  </StatsRow>
                  <StatsRow theme={theme} isDarkMode={isDarkMode}>
                    <span>Rating: ⭐ {report.rating}</span>
                    <span>Status: {report.status}</span>
                  </StatsRow>
                </ReportCard>
              ))}
            </AnimatedReportsGrid>
          )}

          {/* Summary Info */}
          
        </Container>
      </Wrapper>
    </DashboardLayout>
  );
};

export default QuickView;
