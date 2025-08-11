import React, { useState, useEffect } from 'react';

// Enhanced Profile Image Component with multiple fallbacks
const ProfileImage = ({ employee }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate multiple possible image URLs
  const generateImageUrls = (employee) => {
    const baseUrls = [
      // Primary CRM URLs with different formats
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staff_id}/thumb_${employee.profile_image}`,
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staff_id}/${employee.profile_image}`,
      `https://crm.deluxebilisim.com/uploads/staff/${employee.profile_image}`,
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.profile_image}`,
      // Alternative format with different extensions
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staff_id}/thumb_${employee.profile_image.replace(/\.(jpg|jpeg|png|gif)$/i, '.jpg')}`,
      `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staff_id}/thumb_${employee.profile_image.replace(/\.(jpg|jpeg|png|gif)$/i, '.png')}`,
      // Direct staff folder
      `https://crm.deluxebilisim.com/uploads/staff/${employee.staff_id}/${employee.profile_image}`,
      `https://crm.deluxebilisim.com/uploads/staff/${employee.staff_id}/thumb_${employee.profile_image}`
    ];

    // Filter out invalid URLs and duplicates
    return baseUrls.filter((url, index, self) => 
      url && 
      employee.profile_image && 
      employee.profile_image !== 'null' && 
      employee.profile_image !== '' &&
      self.indexOf(url) === index
    );
  };

  const imageUrls = generateImageUrls(employee);

  useEffect(() => {
    // Reset state when employee changes
    setCurrentImageIndex(0);
    setImageLoaded(false);
    setImageError(false);
  }, [employee.staff_id]);

  const handleImageError = () => {
    console.log(`❌ Image failed to load: ${imageUrls[currentImageIndex]}`);
    
    if (currentImageIndex < imageUrls.length - 1) {
      // Try next URL
      setCurrentImageIndex(currentImageIndex + 1);
      console.log(`🔄 Trying next image URL: ${imageUrls[currentImageIndex + 1]}`);
    } else {
      // All URLs failed, show initials
      setImageError(true);
      const initialsElement = document.getElementById(`initials-${employee.staff_id}`);
      if (initialsElement) {
        initialsElement.style.display = 'flex';
      }
      console.log(`💥 All image URLs failed for ${employee.name}, showing initials`);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${imageUrls[currentImageIndex]}`);
    setImageLoaded(true);
    setImageError(false);
  };

  // Don't render image if no URLs available or all failed
  if (!imageUrls.length || imageError) {
    return null;
  }

  return (
    <img 
      src={imageUrls[currentImageIndex]}
      alt={employee.name}
      onLoad={handleImageLoad}
      onError={handleImageError}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
        display: imageLoaded ? 'block' : 'none'
      }}
    />
  );
};

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

  // Format last activity
  const formatLastActivity = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Generate initials from name
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
    const normalizedRating = Math.min(Math.max(rating || 1, 0), maxRating); // Ensure rating is between 0 and maxRating, default to 1
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 !== 0;

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

    const emptyStars = maxRating - Math.ceil(normalizedRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">★</span>
      );
    }

    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className={`employee-card ${employee.status === 'Active' ? 'active' : 'inactive'}`}>
      {/* Status Badge */}
      <div className="status-badges">
        <span className={`status-badge ${employee.status.toLowerCase()}`}>
          {employee.status}
        </span>
        {employee.isLoggedIn && (
          <span className="status-badge online">🟢 Online</span>
        )}
        {employee.isAdmin && (
          <span className="status-badge admin">👑 Admin</span>
        )}
        {employee.teamManage && (
          <span className="status-badge manager">👥 Manager</span>
        )}
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <div className="avatar">
          <ProfileImage employee={employee} />
          <div 
            className="avatar-initials" 
            style={{ display: 'none' }}
            id={`initials-${employee.staff_id}`}
          >
            {getInitials(employee.name)}
          </div>
        </div>
        
        <h2 className="employee-name">{employee.name}</h2>
        <p className="job-title">{employee.jobTitle}</p>
        {employee.expertise && (
          <p className="expertise">💡 {employee.expertise}</p>
        )}
        <p className="email">📧 {employee.email}</p>
        <p className="phone">
          {employee.phone && employee.phone !== 'Not provided' && employee.phone !== 'N/A' ? (
            <span>📞 {employee.phone}</span>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>📞 No phone provided</span>
          )}
        </p>
      </div>

      {/* Enhanced Info Grid with more details */}
      <div className="info-grid">
        <div className="info-item">
          <span className="label">STAFF ID</span>
          <span className="value">{employee.staff_id || 'N/A'}</span>
        </div>
        
        <div className="info-item">
          <span className="label">JOB POSITION</span>
          <span className="value">{employee.jobTitle}</span>
        </div>
        
        <div className="info-item">
          <span className="label">HOURLY RATE</span>
          <span className="value">{formatHourlyRate(employee.hourlyRate)}</span>
        </div>
        
        <div className="info-item">
          <span className="label">WORK LOCATION</span>
          <span className="value">{employee.workLocation || employee.location}</span>
        </div>
        
        <div className="info-item">
          <span className="label">JOIN DATE</span>
          <span className="value">{formatJoinDate(employee.joinDate)}</span>
        </div>

        <div className="info-item">
          <span className="label">LAST ACTIVITY</span>
          <span className="value">{formatLastActivity(employee.lastActivity)}</span>
        </div>
        
        {employee.contractType && (
          <div className="info-item">
            <span className="label">CONTRACT TYPE</span>
            <span className="value">{employee.contractType}</span>
          </div>
        )}
        
        {employee.education && (
          <div className="info-item">
            <span className="label">EDUCATION</span>
            <span className="value">{employee.education}</span>
          </div>
        )}
        
        {employee.birthday && (
          <div className="info-item">
            <span className="label">BIRTHDAY</span>
            <span className="value">{formatJoinDate(employee.birthday)}</span>
          </div>
        )}
        
        {employee.homeAddress && (
          <div className="info-item full-width">
            <span className="label">HOME ADDRESS</span>
            <span className="value">{employee.homeAddress}</span>
          </div>
        )}
        
        {employee.iban && (
          <div className="info-item full-width">
            <span className="label">IBAN</span>
            <span className="value" style={{ fontSize: '11px', wordBreak: 'break-all' }}>{employee.iban}</span>
          </div>
        )}
        
        {employee.bankName && (
          <div className="info-item">
            <span className="label">BANK</span>
            <span className="value">{employee.bankName}</span>
          </div>
        )}
      </div>

      {/* Security & Features */}
      <div className="features-section">
        <div className="feature-item">
          <span className="feature-icon">🔐</span>
          <span className="feature-text">
            2FA: {employee.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        {employee.lastLogin && (
          <div className="feature-item">
            <span className="feature-icon">🕐</span>
            <span className="feature-text">
              Last Login: {formatLastActivity(employee.lastLogin)}
            </span>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="rating-section">
        <StarRating rating={employee.rating || 1} maxRating={5} />
        <span className="rating-text">{employee.rating || 1.0}/5</span>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-view">
          <span className="icon">👁</span> View Profile
        </button>
        <button className="btn btn-edit">
          <span className="icon">✏️</span> Edit
        </button>
        {employee.phone && employee.phone !== 'Not provided' && (
          <button className="btn btn-call" onClick={() => window.open(`tel:${employee.phone}`)}>
            <span className="icon">�</span> Call
          </button>
        )}
        <button className="btn btn-email" onClick={() => window.open(`mailto:${employee.email}`)}>
          <span className="icon">📧</span> Email
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
        url: 'https://crm.deluxebilisim.com/api/staffs', // Fixed URL with 's'
        headers: {
          'authtoken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
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
              // Primary URL format that works with our ProfileImage component
              profileImageUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staffid}/thumb_${employee.profile_image}`;
              console.log(`🖼️ Generated profile image URL: ${profileImageUrl}`);
            }
            
            // Get job position from the custom fields or default mapping
            const getJobPosition = () => {
              if (employee.job_position) {
                const positions = {
                  '1': 'Account Manager',
                  '2': 'Graphic Designer', 
                  '3': 'General Coordinator',
                  '4': 'Project Manager',
                  '5': 'SEO Specialist',
                  '6': 'Developer',
                  '7': 'Full Stack Developer',
                  '9': 'Content Writer',
                  '10': 'Digital Marketing',
                  '11': 'Social Media Manager',
                  '12': 'Content Manager'
                };
                return positions[employee.job_position] || 'Employee';
              }
              return 'Employee';
            };
            
            // Get expertise from custom fields
            const getExpertise = () => {
              if (employee.customfields && Array.isArray(employee.customfields)) {
                const expertiseField = employee.customfields.find(field => 
                  field.label && field.label.includes('Uzmanl') || field.label.includes('Expertise')
                );
                if (expertiseField && expertiseField.value && expertiseField.value !== '1' && expertiseField.value !== '') {
                  return expertiseField.value.replace(/<br\s*\/?>/gi, ', '); // Clean HTML tags
                }
              }
              return null;
            };
            
            // Get contract type from custom fields
            const getContractType = () => {
              if (employee.customfields && Array.isArray(employee.customfields)) {
                const contractField = employee.customfields.find(field => 
                  field.label && (field.label.includes('Contract') || field.label.includes('Sözleşme'))
                );
                if (contractField && contractField.value && contractField.value !== '1' && contractField.value !== '') {
                  return contractField.value;
                }
              }
              return 'Standard';
            };
            
            // Get IBAN from custom fields
            const getIBAN = () => {
              if (employee.customfields && Array.isArray(employee.customfields)) {
                const ibanField = employee.customfields.find(field => 
                  field.label && field.label.includes('IBAN')
                );
                if (ibanField && ibanField.value && ibanField.value !== '1' && ibanField.value !== '') {
                  return ibanField.value;
                }
              }
              return employee.account_number || null;
            };
            
            console.log(`📞 Processing employee: ${employee.firstname} ${employee.lastname} - Phone: "${employee.phonenumber}" -> ${phoneNumber || 'No phone'}`);
            console.log(`🖼️ Profile image data: staffid=${employee.staffid}, image=${employee.profile_image}, url=${profileImageUrl || 'No image'}`);
            
            return {
              id: employee.staffid || employee.id || index,
              name: `${employee.firstname || ''} ${employee.lastname || ''}`.trim() || employee.full_name || 'Unknown',
              email: employee.email,
              phone: phoneNumber || 'Not provided',
              jobTitle: getJobPosition(),
              department: getJobPosition(), // Using job position as department
              hourlyRate: parseFloat(employee.hourly_rate) || 0,
              rating: parseFloat(employee.rating) || 1.0, // Default to 1 star if no rating
              status: employee.active === '1' ? 'Active' : 'Inactive',
              joinDate: employee.datecreated || employee.join_date,
              location: employee.workplace === '1' ? 'Office' : 'Remote',
              avatar: profileImageUrl,
              initials: employee.firstname && employee.lastname ? 
                `${employee.firstname.charAt(0)}${employee.lastname.charAt(0)}`.toUpperCase() : 
                employee.firstname ? employee.firstname.substring(0, 2).toUpperCase() : 'NA',
              staff_id: employee.staffid || `EMP_${index + 1}`,
              first_name: employee.firstname,
              last_name: employee.lastname,
              full_name: `${employee.firstname || ''} ${employee.lastname || ''}`.trim(),
              profile_image: employee.profile_image,
              max_rating: 5,
              // Additional rich data from CRM
              isAdmin: employee.admin === '1',
              lastLogin: employee.last_login,
              lastActivity: employee.last_activity,
              birthday: employee.birthday,
              homeAddress: employee.current_address || employee.home_town,
              education: employee.literacy,
              expertise: getExpertise(),
              contractType: getContractType(),
              iban: getIBAN(),
              bankName: employee.issue_bank,
              isLoggedIn: employee.is_logged_in === '1',
              teamManage: employee.team_manage !== '0' ? employee.team_manage : null,
              workLocation: employee.workplace === '1' ? 'Office' : 'Remote',
              twoFactorEnabled: employee.two_factor_auth_enabled === '1'
            };
          });
          
          setEmployees(transformedEmployees);
          console.log(`✅ Successfully loaded ${transformedEmployees.length} employees from CRM with rich details`);
          
          // Log statistics
          const employeesWithPhone = transformedEmployees.filter(emp => emp.phone && emp.phone !== 'Not provided');
          const employeesWithImage = transformedEmployees.filter(emp => emp.avatar);
          const activeEmployees = transformedEmployees.filter(emp => emp.status === 'Active');
          const loggedInEmployees = transformedEmployees.filter(emp => emp.isLoggedIn);
          
          console.log(`📊 Statistics:`);
          console.log(`   Phone numbers: ${employeesWithPhone.length}/${transformedEmployees.length}`);
          console.log(`   Profile images: ${employeesWithImage.length}/${transformedEmployees.length}`);
          console.log(`   Active employees: ${activeEmployees.length}/${transformedEmployees.length}`);
          console.log(`   Currently logged in: ${loggedInEmployees.length}/${transformedEmployees.length}`);
          
          return; // Success, exit the loop
          
        } else {
          throw new Error('Invalid CRM API response format - expected array');
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
        <h1>🏢 Employee Directory - Live CRM Data</h1>
        <p>Total Staff: {employees.length} employees</p>
        {employees.length > 0 && (
          <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', maxWidth: '800px', margin: '15px auto 0' }}>
            <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#4caf50', fontSize: '24px' }}>
                {employees.filter(emp => emp.status === 'Active').length}
              </h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>✅ Active Employees</p>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#2196f3', fontSize: '24px' }}>
                {employees.filter(emp => emp.isLoggedIn).length}
              </h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>🟢 Currently Online</p>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#ff9800', fontSize: '24px' }}>
                {employees.filter(emp => emp.isAdmin).length}
              </h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>👑 Administrators</p>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#9c27b0', fontSize: '24px' }}>
                {employees.filter(emp => emp.teamManage).length}
              </h3>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>👥 Team Managers</p>
            </div>
          </div>
        )}
        
        {employees.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px', textAlign: 'left', maxWidth: '600px', margin: '20px auto 0' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>📊 Data Overview:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', color: '#666' }}>
              <p style={{ margin: '0' }}>
                � Phone: {employees.filter(emp => emp.phone && emp.phone !== 'Not provided').length}/{employees.length}
              </p>
              <p style={{ margin: '0' }}>
                🖼️ Photos: {employees.filter(emp => emp.avatar).length}/{employees.length}
              </p>
              <p style={{ margin: '0' }}>
                🏠 Remote: {employees.filter(emp => emp.workLocation === 'Remote').length}/{employees.length}
              </p>
              <p style={{ margin: '0' }}>
                🔐 2FA: {employees.filter(emp => emp.twoFactorEnabled).length}/{employees.length}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="employees-grid">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
      
      {/* Enhanced CSS for comprehensive employee cards */}
      <style jsx>{`
        .employee-card {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          border-radius: 15px;
          padding: 20px;
          color: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          width: 100%;
          max-width: 400px;
          margin: 10px;
          position: relative;
          overflow: hidden;
        }

        .employee-card.inactive {
          background: linear-gradient(135deg, #555 0%, #777 100%);
          opacity: 0.8;
        }

        .employee-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        .status-badges {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: flex-end;
        }

        .status-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #4caf50;
        }

        .status-badge.inactive {
          background: #f44336;
        }

        .status-badge.online {
          background: #2196f3;
        }

        .status-badge.admin {
          background: #ff9800;
        }

        .status-badge.manager {
          background: #9c27b0;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          margin: 20px auto 15px;
          position: relative;
          overflow: hidden;
          border: 3px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .avatar-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          font-size: 24px;
          font-weight: bold;
          color: white;
          border-radius: 50%;
        }

        .employees-container {
          padding: 20px;
          background: #f5f7fa;
          min-height: 100vh;
        }

        .employees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .profile-section {
          text-align: center;
          margin-bottom: 20px;
          padding-top: 30px;
        }

        .employee-name {
          font-size: 18px;
          font-weight: 600;
          margin: 10px 0 5px;
        }

        .job-title {
          font-size: 14px;
          opacity: 0.9;
          margin: 3px 0;
          font-weight: 500;
        }

        .expertise {
          font-size: 12px;
          opacity: 0.8;
          margin: 3px 0;
          font-style: italic;
        }

        .email, .phone {
          font-size: 12px;
          opacity: 0.9;
          margin: 3px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 20px 0;
        }

        .info-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 10px;
          border-radius: 8px;
          border-left: 3px solid #64b5f6;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-item .label {
          display: block;
          font-size: 9px;
          opacity: 0.7;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-item .value {
          display: block;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
        }

        .features-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 5px 0;
          font-size: 12px;
        }

        .feature-icon {
          font-size: 14px;
        }

        .feature-text {
          opacity: 0.9;
        }

        .rating-section {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 15px 0;
          gap: 10px;
        }

        .star-rating {
          display: flex;
          gap: 2px;
        }

        .star {
          font-size: 16px;
        }

        .star.filled {
          color: #ffd700;
        }

        .star.empty {
          color: rgba(255, 255, 255, 0.3);
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 20px;
        }

        .btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-weight: 500;
        }

        .btn-view {
          background: #2196f3;
          color: white;
        }

        .btn-edit {
          background: #4caf50;
          color: white;
        }

        .btn-call {
          background: #ff9800;
          color: white;
        }

        .btn-email {
          background: #9c27b0;
          color: white;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          text-align: center;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container, .no-data-container {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 20px;
        }

        .retry-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 15px;
        }

        .retry-btn:hover {
          background: #2980b9;
        }

        .employees-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .employees-header h1 {
          color: #333;
          margin-bottom: 10px;
        }

        .employees-header p {
          color: #666;
          font-size: 18px;
          font-weight: 500;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .employees-grid {
            grid-template-columns: 1fr;
          }
          
          .employee-card {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeCards;
