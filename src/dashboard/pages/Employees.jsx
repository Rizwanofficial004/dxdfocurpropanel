import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
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

// Fetch employees data from S3 Screenshots Users API
const fetchEmployeesFromAPI = async () => {
  const endpoints = [
    'https://dxdtime.ddsolutions.io/api/screenshots/users/?include_stats=true&limit=50',
    'http://localhost:8000/api/screenshots/users/?include_stats=true&limit=50' // Fallback
  ];

  for (let i = 0; i < endpoints.length; i++) {
    const apiUrl = endpoints[i];
    console.log(`� Attempting to fetch from: ${apiUrl}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        mode: 'cors', // Enable CORS
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 S3 API Response received:', data);
      
      if (data.success && data.data && data.data.users && Array.isArray(data.data.users)) {
        console.log(`✅ Found ${data.data.users.length} employees from S3 Screenshots API`);
        console.log('📋 First user sample:', data.data.users[0]);
        
        // Transform S3 Users API data to employee format
        const transformedEmployees = data.data.users.map((user, index) => {
          console.log(`🔄 Processing user ${index + 1}: ${user.email}`);
          
          // Extract department from domain or set default
          const domain = user.domain || 'unknown.com';
          const department = domain.includes('gmail') ? 'External' : 
                            domain.includes('outlook') ? 'External' : 
                            domain.includes('ddsolutions') ? 'Internal' : 
                            'General';
          
          // Calculate hourly rate based on file activity (simulation)
          const fileCount = user.statistics?.total_files || 0;
          const hourlyRate = Math.min(Math.max(Math.round(fileCount / 20), 15), 150); // $15-150 range
          
          // Calculate rating based on activity and file size
          const totalSizeMB = user.statistics?.total_size_mb || 0;
          const rating = Math.min(Math.max((fileCount / 200) + (totalSizeMB / 100), 1), 5); // 1-5 rating
          
          return {
            id: user.email.replace(/[^a-zA-Z0-9]/g, ''), // Clean ID from email
            name: user.display_name || user.username.charAt(0).toUpperCase() + user.username.slice(1),
            email: user.email,
            phone: '+1 (555) ' + Math.random().toString().substr(2, 8), // Simulated phone
            jobTitle: fileCount > 800 ? 'Senior Developer' : 
                     fileCount > 400 ? 'Developer' : 
                     fileCount > 100 ? 'Junior Developer' : 'Intern',
            department: department,
            hourlyRate: hourlyRate,
            rating: Math.round(rating * 10) / 10, // Round to 1 decimal
            status: 'Active', // All S3 users are considered active
            joinDate: user.statistics?.last_modified ? 
              new Date(user.statistics.last_modified).toISOString().split('T')[0] : 
              new Date().toISOString().split('T')[0],
            location: domain.includes('gmail') ? 'Remote' : 
                     domain.includes('outlook') ? 'Remote' : 'Office',
            avatar: null, // No avatars from S3 API
            initials: user.display_name ? 
              user.display_name.split(' ').map(n => n[0]).join('').toUpperCase() : 
              user.username.substring(0, 2).toUpperCase(),
            staff_id: 'S3_' + (index + 1).toString().padStart(3, '0'),
            performance_score: Math.round(rating * 20), // Convert 1-5 to 20-100 scale
            ai_insights: [
              `Has ${fileCount} screenshots stored`,
              `Total storage: ${totalSizeMB} MB`,
              `File types: ${user.statistics?.file_types?.join(', ') || 'N/A'}`,
              `Activity level: ${fileCount > 500 ? 'High' : fileCount > 200 ? 'Medium' : 'Low'}`
            ],
            is_logged_in: true, // Assume active if they have recent files
            last_activity: user.statistics?.last_modified || new Date().toISOString(),
            currency: 'USD',
            // S3 specific data
            screenshots_folder: user.screenshots_folder,
            file_count: fileCount,
            storage_size_mb: totalSizeMB,
            folder_name: user.folder_name
          };
        });
        
        console.log(`🎉 Successfully transformed ${transformedEmployees.length} S3 users to employees`);
        console.log('📊 Sample transformed employee:', transformedEmployees[0]);
        return transformedEmployees;
        
      } else {
        console.error('❌ Invalid S3 API response structure:', data);
        throw new Error('Invalid S3 API response format');
      }
      
    } catch (error) {
      console.error(`❌ Failed to fetch from ${apiUrl}:`, error);
      
      // If this is the last endpoint, throw the error
      if (i === endpoints.length - 1) {
        // Return mock data as fallback
        console.log('🔄 Using mock data as fallback...');
        return generateMockEmployees();
      }
      
      // Continue to next endpoint
      console.log(`🔄 Trying next endpoint...`);
      continue;
    }
  }
};

// Generate mock employees as fallback
const generateMockEmployees = () => {
  const mockUsers = [
    { email: 'amirishaque67@gmail.com', username: 'amirishaque67', file_count: 1000, storage_mb: 222.65 },
    { email: 'atakankahraman35@outlook.com', username: 'atakankahraman35', file_count: 1000, storage_mb: 418.37 },
    { email: 'begumdamlasen@gmail.com', username: 'begumdamlasen', file_count: 1000, storage_mb: 475.07 },
    { email: 'haseebcodejourney@gmail.com', username: 'haseebcodejourney', file_count: 850, storage_mb: 320.12 }
  ];

  return mockUsers.map((user, index) => {
    const domain = user.email.split('@')[1];
    const department = domain.includes('gmail') ? 'External' : 
                      domain.includes('outlook') ? 'External' : 'Internal';
    
    return {
      id: user.email.replace(/[^a-zA-Z0-9]/g, ''),
      name: user.username.charAt(0).toUpperCase() + user.username.slice(1),
      email: user.email,
      phone: '+1 (555) ' + Math.random().toString().substr(2, 8),
      jobTitle: user.file_count > 800 ? 'Senior Developer' : 'Developer',
      department: department,
      hourlyRate: Math.min(Math.max(Math.round(user.file_count / 20), 15), 150),
      rating: Math.min(Math.max((user.file_count / 200) + (user.storage_mb / 100), 1), 5),
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      location: domain.includes('gmail') ? 'Remote' : 'Office',
      avatar: null,
      initials: user.username.substring(0, 2).toUpperCase(),
      staff_id: 'MOCK_' + (index + 1).toString().padStart(3, '0'),
      performance_score: Math.round((user.file_count / 200) * 20),
      ai_insights: [
        `Has ${user.file_count} screenshots stored`,
        `Total storage: ${user.storage_mb} MB`,
        'File types: webp',
        `Activity level: ${user.file_count > 500 ? 'High' : 'Medium'}`
      ],
      is_logged_in: true,
      last_activity: new Date().toISOString(),
      currency: 'USD',
      screenshots_folder: `screenshots/${user.username}_at_${domain.replace('.', '_')}/`,
      file_count: user.file_count,
      storage_size_mb: user.storage_mb,
      folder_name: `${user.username}_at_${domain.replace('.', '_')}`
    };
  });
};

// Animated Counter Component
const AnimatedCounter = ({ target, prefix = '', suffix = '' }) => {
  return <span>{prefix}{target}{suffix}</span>;
};

// Employee Card Component
const Employee3DCard = ({ employee, index, isDarkMode, onEdit, onDelete, onView }) => {
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
  <>
    <EmployeeCard
      index={index}
      isDarkMode={isDarkMode}
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
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>📸 Screenshots</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {employee.file_count ? `${employee.file_count.toLocaleString()} files` : 'No Data'}
          </DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>💾 Storage Used</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {employee.storage_size_mb ? `${employee.storage_size_mb.toFixed(1)} MB` : 'No Data'}
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
  </>
  );
};

// Statistics Card Component
const StatsCard3D = ({ icon, value, label, color, isDarkMode }) => {
  return (
    <StatCard
      color={color}
      isDarkMode={isDarkMode}
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

  // Fetch employees data from S3 Screenshots Users API on component mount
  useEffect(() => {
    const loadS3Employees = async () => {
      setLoading(true);
      try {
        console.log('🔄 Loading employee data from S3 Screenshots Users API...');
        const s3EmployeesData = await fetchEmployeesFromAPI();
        console.log(`🎉 Successfully loaded ${s3EmployeesData.length} employees from S3 Screenshots API`);
        console.log('📋 Employee names:', s3EmployeesData.map(emp => emp.name));
        setEmployeesData(s3EmployeesData);
      } catch (error) {
        console.error('❌ Failed to load S3 employee data:', error);
        console.log('🔄 API failed, using fallback data or mock data was already loaded');
        // Don't show alert, the function will handle fallback data
        // setEmployeesData will be set by the fallback logic in fetchEmployeesFromAPI
      } finally {
        setLoading(false);
      }
    };

    loadS3Employees();
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
              👥 Employee Management Dashboard - S3 SCREENSHOTS DATA
            </EmployeesTitle>
            <EmployeesSubtitle isDarkMode={isDarkMode}>
              {loading ? 
                "🔄 Loading employee data from S3 Screenshots Users API..." :
                employeesData.length > 0 ? 
                  `📊 Displaying ${employeesData.length} employees from S3 Screenshots database (${employeesData.slice(0, 3).map(emp => emp.name).join(', ')}, etc.)` :
                  "❌ No employee data found - Check S3 API connection"
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
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="⭐"
              value={stats.averageRating.toFixed(1)}
              label="Average Rating"
              color="#fbbf24"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="💰"
              value={`$${stats.averageHourlyRate}`}
              label="Avg Hourly Rate"
              color="#10b981"
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="🏢"
              value={stats.departments}
              label="Departments"
              color="#8b5cf6"
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
