import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { gsap } from 'gsap';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  EmployeesWrapper,
  EmployeesContainer,
  EmployeesHeader,
  EmployeesTitle,
  EmployeesSubtitle,
  FilterSection,
  FilterInput,
  FilterSelect,
  EmployeesGrid,
  EmployeeCard,
  EmployeeAvatar,
  EmployeeInfo,
  EmployeeName,
  EmployeeTitle,
  EmployeeEmail,
  EmployeeContact,
  EmployeeDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  RatingSection,
  RatingStars,
  Star,
  RatingValue,
  ActionButtons,
  ActionButton,
  LoadingSpinner,
  NoDataMessage,
  StatsSummary,
  StatCard,
  StatIcon,
  StatValue,
  StatLabel
} from '../components/employees/Employees.styles';

// Fetch REAL employees data from your working API
const fetchEmployeesFromAPI = async () => {
  try {
    console.log('🚀 Fetching REAL employees from your CRM API...');
    const apiUrl = 'http://127.0.0.1:8000/api/dashboard/employees/enhanced/?include_profiles=true&format=detailed';
    console.log('📡 API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 Complete API Response:', data);
    
    if (data.success && data.data && data.data.employees && Array.isArray(data.data.employees)) {
      console.log(`✅ Found ${data.data.employees.length} REAL employees from CRM`);
      console.log('📋 First employee sample:', data.data.employees[0]);
      
      // Transform REAL API data from your CRM system - EXACT field mapping
      const transformedEmployees = data.data.employees.map((employee, index) => {
        console.log(`🔄 Processing employee ${index + 1}: ${employee.full_name}`);
        console.log('Raw employee data:', employee);
        
        return {
          id: employee.id,
          name: employee.full_name,
          email: employee.email, // Direct field name from API
          phone: employee.phone, // Direct field name from API  
          jobTitle: employee.job_title, // Direct field name from API
          department: employee.department,
          hourlyRate: parseFloat(employee.hourly_rate || 0),
          rating: parseFloat(employee.rating || 0),
          status: employee.is_active ? 'Active' : 'Inactive',
          joinDate: employee.join_date,
          location: employee.location || employee.nation || 'Not specified',
          avatar: employee.profile_image && employee.profile_image !== 'null' && employee.profile_image !== '' ? 
            `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.id}/thumb_${employee.profile_image}` : null,
          initials: employee.initials || employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase(),
          staff_id: employee.staff_id,
          performance_score: parseFloat(employee.performance_score || 0),
          ai_insights: employee.ai_insights || [],
          is_logged_in: employee.is_logged_in || false,
          last_activity: employee.last_activity,
          currency: employee.currency || 'USD'
        };
      });
      
      console.log(`🎉 Successfully transformed ${transformedEmployees.length} REAL employees`);
      console.log('📊 Sample transformed employee:', transformedEmployees[0]);
      return transformedEmployees;
      
    } else {
      console.error('❌ Invalid API response structure:', data);
      throw new Error('Invalid API response format');
    }
  } catch (error) {
    console.error('❌ Failed to fetch REAL employee data:', error);
    throw new Error(`API Error: ${error.message}`);
  }
};

// Animated Counter Component
const AnimatedCounter = ({ target, prefix = '', suffix = '', duration = 2000 }) => {
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

  return <span ref={countRef}>{prefix}{count}{suffix}</span>;
};

// 3D Employee Card Component
const Employee3DCard = ({ employee, index, isDarkMode, onEdit, onDelete, onView }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        {
          rotationX: 90,
          rotationY: 45,
          z: -300,
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
          delay: index * 0.15
        }
      );
    }
  }, [index]);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationX: -8,
        rotationY: 12,
        z: 60,
        scale: 1.03,
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          filled={i <= fullStars || (i === fullStars + 1 && hasHalfStar)}
          isDarkMode={isDarkMode}
        >
          {i <= fullStars ? '⭐' : (i === fullStars + 1 && hasHalfStar ? '⭐' : '☆')}
        </Star>
      );
    }
    return stars;
  };

  return (
    <EmployeeCard
      ref={cardRef}
      index={index}
      isDarkMode={isDarkMode}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <EmployeeAvatar className="employee-avatar">
        {employee.avatar ? (
          <img 
            src={employee.avatar} 
            alt={employee.name}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span style={{ 
          display: employee.avatar ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#6366f1',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {employee.initials}
        </span>
      </EmployeeAvatar>

      <EmployeeInfo className="employee-info">
        <EmployeeName isDarkMode={isDarkMode}>{employee.name}</EmployeeName>
        <EmployeeTitle isDarkMode={isDarkMode}>{employee.jobTitle || 'No Title'}</EmployeeTitle>
        <EmployeeEmail isDarkMode={isDarkMode}>{employee.email || 'No Email'}</EmployeeEmail>
        <EmployeeContact isDarkMode={isDarkMode}>{employee.phone || 'No Phone'}</EmployeeContact>
      </EmployeeInfo>

      <EmployeeDetails>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>💰 Hourly Rate</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {employee.hourlyRate > 0 ? `$${employee.hourlyRate.toFixed(2)}/hr` : 'Not Set'}
          </DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>🏢 Department</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>{employee.department || 'Not Assigned'}</DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>📍 Location</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>{employee.location || 'Not Specified'}</DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>📅 Join Date</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'Not Available'}
          </DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>🆔 Staff ID</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>{employee.staff_id || 'No ID'}</DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>📊 Performance</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {employee.performance_score ? `${employee.performance_score.toFixed(1)}%` : 'No Data'}
          </DetailValue>
        </DetailItem>
      </EmployeeDetails>

      <RatingSection className="employee-rating">
        <RatingStars>
          {renderStars(employee.rating)}
        </RatingStars>
        <RatingValue isDarkMode={isDarkMode}>
          {employee.rating.toFixed(1)}/5.0
        </RatingValue>
      </RatingSection>

      <ActionButtons className="employee-actions">
        <ActionButton variant="primary" onClick={() => onView(employee.id)}>
          👁️ View
        </ActionButton>
        <ActionButton variant="secondary" onClick={() => onEdit(employee.id)}>
          ✏️ Edit
        </ActionButton>
        <ActionButton variant="danger" onClick={() => onDelete(employee.id)}>
          🗑️ Delete
        </ActionButton>
      </ActionButtons>
    </EmployeeCard>
  );
};

// Statistics Card Component
const StatsCard3D = ({ icon, value, label, color, delay = 0, isDarkMode }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        {
          rotationX: 90,
          rotationY: 30,
          z: -200,
          opacity: 0,
          scale: 0.7
        },
        {
          rotationX: 0,
          rotationY: 0,
          z: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "back.out(1.5)",
          delay: delay / 1000
        }
      );
    }
  }, [delay]);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationX: -5,
        rotationY: 8,
        z: 30,
        scale: 1.05,
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
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  return (
    <StatCard
      ref={cardRef}
      color={color}
      isDarkMode={isDarkMode}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StatIcon>{icon}</StatIcon>
      <StatValue color={color}>
        <AnimatedCounter target={parseInt(value)} />
      </StatValue>
      <StatLabel isDarkMode={isDarkMode}>{label}</StatLabel>
    </StatCard>
  );
};

const Employees = () => {
  const themeContext = useTheme();
  const { isDarkMode = false, theme = {} } = themeContext || {};
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Fetch REAL employees data from API on component mount
  useEffect(() => {
    const loadRealEmployees = async () => {
      setLoading(true);
      try {
        console.log('🔄 Loading REAL employee data from your CRM API...');
        const realEmployeesData = await fetchEmployeesFromAPI();
        console.log(`🎉 Successfully loaded ${realEmployeesData.length} REAL employees from CRM`);
        console.log('📋 Real employee names:', realEmployeesData.map(emp => emp.name));
        setEmployeesData(realEmployeesData);
      } catch (error) {
        console.error('❌ Failed to load REAL employee data:', error);
        alert(`❌ Failed to load employee data: ${error.message}\n\nPlease ensure your Django server is running on port 8000.`);
        setEmployeesData([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealEmployees();
  }, []);

  // Calculate statistics with proper null handling
  const stats = {
    totalEmployees: employeesData.length || 0,
    averageRating: employeesData.length > 0 ? 
      Number((employeesData.reduce((sum, emp) => sum + (emp.rating || 0), 0) / employeesData.length).toFixed(1)) : 0,
    averageHourlyRate: employeesData.length > 0 ? 
      Math.round(employeesData.filter(emp => emp.hourlyRate > 0).reduce((sum, emp) => sum + (emp.hourlyRate || 0), 0) / 
        Math.max(employeesData.filter(emp => emp.hourlyRate > 0).length, 1)) : 0,
    departments: new Set(employeesData.map(emp => emp.department).filter(dept => dept && dept !== 'null')).size || 0
  };

  console.log('📊 Current Statistics:', stats);
  console.log('📊 Employees Data Length:', employeesData.length);
  console.log('📊 Sample Employee:', employeesData[0]);

  // Filter data based on search and filters with null checks
  const filteredData = employeesData.filter(employee => {
    if (!employee) return false;
    
    const name = employee.name || '';
    const email = employee.email || '';
    const jobTitle = employee.jobTitle || '';
    const department = employee.department || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All' || department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter (excluding null/undefined)
  const departments = ['All', ...new Set(employeesData.map(emp => emp.department).filter(dept => dept))];

  const handleRefreshData = async () => {
    console.log('🔄 Manual refresh requested...');
    setLoading(true);
    try {
      const freshData = await fetchEmployeesFromAPI();
      setEmployeesData(freshData);
      alert(`✅ Successfully refreshed! Loaded ${freshData.length} employees from CRM database.`);
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      alert(`❌ Refresh failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (employeeId) => {
    console.log('View employee:', employeeId);
    // Implement view functionality
  };

  const handleEdit = (employeeId) => {
    console.log('Edit employee:', employeeId);
    // Implement edit functionality
  };

  const handleDelete = (employeeId) => {
    console.log('Delete employee:', employeeId);
    // Implement delete functionality with confirmation
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployeesData(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  return (
    <DashboardLayout headerTitle="Employee Management" headerBreadcrumb="Home / HR / Employees">
      <EmployeesWrapper isDarkMode={isDarkMode}>
        <EmployeesContainer>
          {/* Header Section */}
          <EmployeesHeader>
            <EmployeesTitle isDarkMode={isDarkMode}>
              👥 Employee Management Dashboard - REAL DATABASE DATA
            </EmployeesTitle>
            <EmployeesSubtitle isDarkMode={isDarkMode}>
              {loading ? 
                "🔄 Loading real employee data from CRM API..." :
                employeesData.length > 0 ? 
                  `📊 Displaying ${employeesData.length} employees from your CRM database (Zahra H, Yunus Katırcı, Mehmet Fatih Önk, Hamza Haseeb, etc.)` :
                  "❌ No employee data found - Check API connection"
              }
            </EmployeesSubtitle>
          </EmployeesHeader>

          {/* Statistics Cards */}
          <StatsSummary>
            <StatsCard3D
              icon="👥"
              value={stats.totalEmployees}
              label="Total Employees"
              color="#3b82f6"
              delay={0}
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="⭐"
              value={stats.averageRating.toFixed(1)}
              label="Average Rating"
              color="#fbbf24"
              delay={200}
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="💰"
              value={`$${stats.averageHourlyRate}`}
              label="Avg Hourly Rate"
              color="#10b981"
              delay={400}
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="🏢"
              value={stats.departments}
              label="Departments"
              color="#8b5cf6"
              delay={600}
              isDarkMode={isDarkMode}
            />
          </StatsSummary>

          {/* Filters and Controls */}
          <FilterSection>
            <FilterInput
              type="text"
              placeholder="🔍 Search employees by name, email, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isDarkMode={isDarkMode}
            />
            <FilterSelect
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              isDarkMode={isDarkMode}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </FilterSelect>
            <button
              onClick={handleRefreshData}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '14px',
                marginLeft: '10px'
              }}
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh Real Data'}
            </button>
          </FilterSection>

          {/* Employees Grid */}
          {loading ? (
            <LoadingSpinner isDarkMode={isDarkMode} />
          ) : filteredData.length === 0 ? (
            <NoDataMessage isDarkMode={isDarkMode}>
              No employees found matching your criteria
            </NoDataMessage>
          ) : (
            <EmployeesGrid>
              {filteredData.map((employee, index) => (
                <Employee3DCard
                  key={employee.id}
                  employee={employee}
                  index={index}
                  isDarkMode={isDarkMode}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </EmployeesGrid>
          )}
        </EmployeesContainer>
      </EmployeesWrapper>
    </DashboardLayout>
  );
};

export default Employees;
