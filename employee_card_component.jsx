import React, { useState, useEffect } from 'react';

const EmployeeCard = ({ employee }) => {
  // Format join date to display as "Jul 12, 2020" format
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Generate initials from name - updated for S3 data structure
  const getInitials = (name) => {
    if (employee.initials) return employee.initials;
    if (!name) return 'N/A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format hourly rate
  const formatHourlyRate = (rate) => {
    if (!rate || rate === 0) return 'N/A';
    return `$${rate}/hr`;
  };

  // Generate star rating
  const StarRating = ({ rating, maxRating = 5 }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">★</span>
      );
    }

    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">★</span>
      );
    }

    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="employee-card">
      {/* Profile Section */}
      <div className="profile-section">
        <div className="avatar">
          {employee.avatar || (employee.profile_image && employee.profile_image !== 'null') ? (
            <img 
              src={employee.avatar || `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staff_id}/thumb_${employee.profile_image}`} 
              alt={employee.name}
              onError={(e) => {
                // Fallback to different image formats if main URL fails
                const fallbackUrls = [
                  `https://crm.deluxebilisim.com/uploads/staff/${employee.profile_image}`,
                  `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staff_id}/${employee.profile_image}`,
                  `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.profile_image}`
                ];
                
                const currentSrc = e.target.src;
                const currentIndex = fallbackUrls.findIndex(url => currentSrc.includes(url.split('/').pop()));
                
                if (currentIndex < fallbackUrls.length - 1) {
                  e.target.src = fallbackUrls[currentIndex + 1];
                } else {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          ) : null}
          <div 
            className="avatar-initials" 
            style={{ display: (employee.avatar || (employee.profile_image && employee.profile_image !== 'null')) ? 'none' : 'flex' }}
          >
            {getInitials(employee.name)}
          </div>
        </div>
        
        <h2 className="employee-name">{employee.name}</h2>
        <p className="job-title">{employee.jobTitle || 'Employee'}</p>
        <p className="email">{employee.email}</p>
        <p className="phone">
          {employee.phone && employee.phone !== 'Not provided' && employee.phone !== 'N/A' ? (
            <span>📞 {employee.phone}</span>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>📞 No phone provided</span>
          )}
        </p>
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="info-item">
          <span className="label">JOB POSITION</span>
          <span className="value">{employee.jobTitle || 'Employee'}</span>
        </div>
        
        <div className="info-item">
          <span className="label">PHONE NUMBER</span>
          <span className="value">
            {employee.phone && employee.phone !== 'Not provided' && employee.phone !== 'N/A' ? (
              <a href={`tel:${employee.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                📞 {employee.phone}
              </a>
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic' }}>📞 Not provided in CRM</span>
            )}
          </span>
        </div>
        
        <div className="info-item">
          <span className="label">HOURLY RATE</span>
          <span className="value">{formatHourlyRate(employee.hourlyRate)}</span>
        </div>
        
        <div className="info-item">
          <span className="label">DEPARTMENT</span>
          <span className="value">{employee.department}</span>
        </div>
        
        <div className="info-item">
          <span className="label">LOCATION</span>
          <span className="value">{employee.location || 'Office'}</span>
        </div>
        
        <div className="info-item">
          <span className="label">JOIN DATE</span>
          <span className="value">{formatJoinDate(employee.joinDate)}</span>
        </div>

        <div className="info-item">
          <span className="label">STAFF ID</span>
          <span className="value">{employee.staff_id || 'N/A'}</span>
        </div>
        
        <div className="info-item">
          <span className="label">STATUS</span>
          <span className="value">{employee.status || 'Active'}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="rating-section">
        <StarRating rating={employee.rating || 0} maxRating={5} />
        <span className="rating-text">{employee.rating || 0}/5</span>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-view">
          <span className="icon">👁</span> View
        </button>
        <button className="btn btn-edit">
          <span className="icon">✏️</span> Edit
        </button>
        <button className="btn btn-delete">
          <span className="icon">🗑️</span> Delete
        </button>
      </div>
    </div>
  );
};

// Main component to fetch and display all employees from CRM API
const EmployeeCards = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const endpoints = [
      {
        url: 'https://crm.deluxebilisim.com/api/staff',
        headers: {
          'authtoken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
        }
      },
      {
        url: 'http://127.0.0.1:8000/api/dashboard/employees/enhanced/?include_profiles=true&format=detailed',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    ];

    for (let i = 0; i < endpoints.length; i++) {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🚀 Fetching from CRM: ${endpoints[i].url}`);
        
        const response = await fetch(endpoints[i].url, {
          method: 'GET',
          mode: 'cors',
          headers: endpoints[i].headers,
          signal: AbortSignal.timeout(30000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 CRM API Response:', data);
        
        // Handle direct CRM API response format (array of staff)
        if (Array.isArray(data)) {
          const transformedEmployees = data.map((employee, index) => {
            // Clean up phone number - handle empty strings and null values
            const phoneNumber = employee.phonenumber && employee.phonenumber.trim() !== '' 
              ? employee.phonenumber.trim() 
              : null;
            
            // Generate proper profile image URL based on CRM structure
            let profileImageUrl = null;
            if (employee.profile_image && employee.profile_image !== 'null' && employee.profile_image !== '') {
              // Try the staff_profile_images format first
              profileImageUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staffid}/thumb_${employee.profile_image}`;
            }
            
            console.log(`📞 Processing employee: ${employee.firstname} ${employee.lastname} - Phone: "${employee.phonenumber}" -> ${phoneNumber || 'No phone'}`);
            console.log(`🖼️ Profile image: ${employee.profile_image} -> ${profileImageUrl || 'No image'}`);
            
            return {
              id: employee.staffid || employee.id || index,
              name: `${employee.firstname || ''} ${employee.lastname || ''}`.trim() || employee.full_name || 'Unknown',
              email: employee.email,
              phone: phoneNumber || 'Not provided', // Real phone number from CRM
              jobTitle: employee.job_title || employee.position || 'Employee',
              department: employee.department || 'General',
              hourlyRate: parseFloat(employee.hourly_rate) || 0,
              rating: parseFloat(employee.rating) || 0,
              status: employee.active === '1' ? 'Active' : 'Inactive',
              joinDate: employee.datecreated || employee.join_date,
              location: employee.location || employee.address || 'Office',
              avatar: profileImageUrl,
              initials: employee.firstname && employee.lastname ? 
                `${employee.firstname.charAt(0)}${employee.lastname.charAt(0)}`.toUpperCase() : 
                employee.firstname ? employee.firstname.substring(0, 2).toUpperCase() : 'NA',
              staff_id: employee.staffid || `EMP_${index + 1}`,
              first_name: employee.firstname,
              last_name: employee.lastname,
              full_name: `${employee.firstname || ''} ${employee.lastname || ''}`.trim(),
              profile_image: employee.profile_image,
              max_rating: 5
            };
          });
          
          setEmployees(transformedEmployees);
          console.log(`✅ Successfully loaded ${transformedEmployees.length} employees from CRM with real phone numbers and profile images`);
          
          // Log phone number statistics
          const employeesWithPhone = transformedEmployees.filter(emp => emp.phone && emp.phone !== 'Not provided');
          const employeesWithImage = transformedEmployees.filter(emp => emp.avatar);
          console.log(`📊 Phone number stats: ${employeesWithPhone.length}/${transformedEmployees.length} employees have phone numbers`);
          console.log(`📊 Profile image stats: ${employeesWithImage.length}/${transformedEmployees.length} employees have profile images`);
          
          return; // Success, exit the loop
          
        } else if (data.success && data.data && data.data.employees && Array.isArray(data.data.employees)) {
          // Handle wrapped response format
          const transformedEmployees = data.data.employees.map((employee, index) => {
            return {
              id: employee.staff_id || employee.id,
              name: employee.full_name || `${employee.first_name} ${employee.last_name}`,
              email: employee.email,
              phone: employee.phone || employee.phonenumber || 'N/A', // Dynamic phone number
              jobTitle: employee.job_title || employee.position || 'Employee',
              department: employee.department || 'General',
              hourlyRate: employee.hourly_rate || 0,
              rating: employee.rating || 0,
              status: employee.status || 'Active',
              joinDate: employee.join_date || employee.date_created,
              location: employee.location || employee.address || 'Office',
              avatar: employee.profile_image && employee.profile_image !== 'null' ? 
                `https://crm.deluxebilisim.com/uploads/staff/${employee.profile_image}` : null,
              initials: employee.first_name && employee.last_name ? 
                `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`.toUpperCase() :
                employee.full_name ? employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA',
              staff_id: employee.staff_id || `EMP_${index + 1}`,
              first_name: employee.first_name,
              last_name: employee.last_name,
              full_name: employee.full_name,
              profile_image: employee.profile_image,
              max_rating: employee.max_rating || 5
            };
          });
          
          setEmployees(transformedEmployees);
          console.log(`✅ Successfully loaded ${transformedEmployees.length} employees from CRM`);
          return; // Success, exit the loop
          
        } else {
          throw new Error('Invalid CRM API response format');
        }
        
      } catch (err) {
        console.error(`❌ Failed to fetch from ${endpoints[i].url}:`, err);
        
        if (i === endpoints.length - 1) {
          // Last endpoint failed, show error
          setError(`Failed to connect to CRM API: ${err.message}`);
          setEmployees([]);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employees from CRM API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Unable to Load Employee Data</h2>
        <p>Error: {error}</p>
        <button onClick={fetchEmployees} className="retry-btn">
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="no-data-container">
        <h2>No Employees Found</h2>
        <p>No employee data available from the CRM system.</p>
        <button onClick={fetchEmployees} className="retry-btn">
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employee Directory - CRM Data</h1>
        <p>Total Employees: {employees.length}</p>
        {employees.length > 0 && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
              📊 Phone numbers: {employees.filter(emp => emp.phone && emp.phone !== 'Not provided').length} of {employees.length} employees have phone numbers in CRM
            </p>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
              🖼️ Profile images: {employees.filter(emp => emp.avatar).length} of {employees.length} employees have profile images in CRM
            </p>
          </div>
        )}
      </div>
      
      <div className="employees-grid">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

export default EmployeeCards;
