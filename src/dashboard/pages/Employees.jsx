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

// Generate dummy employees data
const generateEmployeesData = () => {
  const employees = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      jobTitle: 'Senior Frontend Developer',
      department: 'Engineering',
      hourlyRate: 85,
      rating: 4.8,
      status: 'Active',
      joinDate: '2022-01-15',
      location: 'New York, NY'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      jobTitle: 'Digital Marketing Manager',
      department: 'Marketing',
      hourlyRate: 75,
      rating: 4.6,
      status: 'Active',
      joinDate: '2021-03-22',
      location: 'Los Angeles, CA'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      phone: '+1 (555) 345-6789',
      jobTitle: 'Financial Analyst',
      department: 'Finance',
      hourlyRate: 70,
      rating: 4.4,
      status: 'Active',
      joinDate: '2021-11-08',
      location: 'Chicago, IL'
    },
    {
      id: 4,
      name: 'Emily Wilson',
      email: 'emily.wilson@company.com',
      phone: '+1 (555) 456-7890',
      jobTitle: 'HR Specialist',
      department: 'Human Resources',
      hourlyRate: 65,
      rating: 4.9,
      status: 'Active',
      joinDate: '2020-07-12',
      location: 'Austin, TX'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@company.com',
      phone: '+1 (555) 567-8901',
      jobTitle: 'Backend Developer',
      department: 'Engineering',
      hourlyRate: 80,
      rating: 4.7,
      status: 'Active',
      joinDate: '2021-09-30',
      location: 'Seattle, WA'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      phone: '+1 (555) 678-9012',
      jobTitle: 'DevOps Engineer',
      department: 'Engineering',
      hourlyRate: 90,
      rating: 4.5,
      status: 'Active',
      joinDate: '2020-12-03',
      location: 'San Francisco, CA'
    },
    {
      id: 7,
      name: 'Tom Wilson',
      email: 'tom.wilson@company.com',
      phone: '+1 (555) 789-0123',
      jobTitle: 'Sales Manager',
      department: 'Sales',
      hourlyRate: 72,
      rating: 4.3,
      status: 'Active',
      joinDate: '2019-05-18',
      location: 'Miami, FL'
    },
    {
      id: 8,
      name: 'Anna Taylor',
      email: 'anna.taylor@company.com',
      phone: '+1 (555) 890-1234',
      jobTitle: 'Product Designer',
      department: 'Design',
      hourlyRate: 78,
      rating: 4.8,
      status: 'Active',
      joinDate: '2022-02-14',
      location: 'Portland, OR'
    },
    {
      id: 9,
      name: 'Chris Martin',
      email: 'chris.martin@company.com',
      phone: '+1 (555) 901-2345',
      jobTitle: 'Data Scientist',
      department: 'Analytics',
      hourlyRate: 95,
      rating: 4.9,
      status: 'Active',
      joinDate: '2021-08-07',
      location: 'Boston, MA'
    },
    {
      id: 10,
      name: 'Jessica Lee',
      email: 'jessica.lee@company.com',
      phone: '+1 (555) 012-3456',
      jobTitle: 'Content Strategist',
      department: 'Marketing',
      hourlyRate: 68,
      rating: 4.6,
      status: 'Active',
      joinDate: '2020-10-25',
      location: 'Denver, CO'
    },
    {
      id: 11,
      name: 'Robert Garcia',
      email: 'robert.garcia@company.com',
      phone: '+1 (555) 123-0456',
      jobTitle: 'QA Engineer',
      department: 'Engineering',
      hourlyRate: 73,
      rating: 4.4,
      status: 'Active',
      joinDate: '2021-06-14',
      location: 'Phoenix, AZ'
    },
    {
      id: 12,
      name: 'Amy Rodriguez',
      email: 'amy.rodriguez@company.com',
      phone: '+1 (555) 234-1567',
      jobTitle: 'Business Analyst',
      department: 'Operations',
      hourlyRate: 71,
      rating: 4.7,
      status: 'Active',
      joinDate: '2020-04-09',
      location: 'Atlanta, GA'
    }
  ];

  return employees;
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
        <span>{employee.name.split(' ').map(n => n[0]).join('')}</span>
      </EmployeeAvatar>

      <EmployeeInfo className="employee-info">
        <EmployeeName isDarkMode={isDarkMode}>{employee.name}</EmployeeName>
        <EmployeeTitle isDarkMode={isDarkMode}>{employee.jobTitle}</EmployeeTitle>
        <EmployeeEmail isDarkMode={isDarkMode}>{employee.email}</EmployeeEmail>
        <EmployeeContact isDarkMode={isDarkMode}>{employee.phone}</EmployeeContact>
      </EmployeeInfo>

      <EmployeeDetails>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>Hourly Rate</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>${employee.hourlyRate}/hr</DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>Department</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>{employee.department}</DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>Location</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>{employee.location}</DetailValue>
        </DetailItem>
        <DetailItem isDarkMode={isDarkMode}>
          <DetailLabel isDarkMode={isDarkMode}>Join Date</DetailLabel>
          <DetailValue isDarkMode={isDarkMode}>
            {new Date(employee.joinDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
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

  // Generate employees data on component mount
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const dummyData = generateEmployeesData();
      setEmployeesData(dummyData);
      setLoading(false);
    }, 1500);
  }, []);

  // Calculate statistics
  const stats = {
    totalEmployees: employeesData.length,
    averageRating: employeesData.length > 0 ? 
      (employeesData.reduce((sum, emp) => sum + emp.rating, 0) / employeesData.length) : 0,
    averageHourlyRate: employeesData.length > 0 ? 
      Math.round(employeesData.reduce((sum, emp) => sum + emp.hourlyRate, 0) / employeesData.length) : 0,
    departments: new Set(employeesData.map(emp => emp.department)).size
  };

  // Filter data based on search and filters
  const filteredData = employeesData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All' || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = ['All', ...new Set(employeesData.map(emp => emp.department))];

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
              👥 Employee Management Dashboard
            </EmployeesTitle>
            <EmployeesSubtitle isDarkMode={isDarkMode}>
              Manage your team with comprehensive employee profiles and insights
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

          {/* Filters */}
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
