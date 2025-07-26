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

  // Generate initials from name
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  // Format hourly rate
  const formatHourlyRate = (rate) => {
    if (!rate || rate === 0) return 'N/A';
    return `$${rate}/hr`;
  };

  // Generate star rating
  const StarRating = ({ rating, maxRating }) => {
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
          {employee.profile_image && employee.profile_image !== 'null' ? (
            <img 
              src={`https://crm.deluxebilisim.com/uploads/staff/${employee.profile_image}`} 
              alt={employee.full_name}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="avatar-initials" 
            style={{ display: employee.profile_image && employee.profile_image !== 'null' ? 'none' : 'flex' }}
          >
            {getInitials(employee.first_name, employee.last_name)}
          </div>
        </div>
        
        <h2 className="employee-name">{employee.full_name}</h2>
        <p className="job-title">{employee.job_title}</p>
        <p className="email">{employee.email}</p>
        <p className="phone">{employee.phone}</p>
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="info-item">
          <span className="label">HOURLY RATE</span>
          <span className="value">{formatHourlyRate(employee.hourly_rate)}</span>
        </div>
        
        <div className="info-item">
          <span className="label">DEPARTMENT</span>
          <span className="value">{employee.department}</span>
        </div>
        
        <div className="info-item">
          <span className="label">LOCATION</span>
          <span className="value">{employee.location || 'Remote'}</span>
        </div>
        
        <div className="info-item">
          <span className="label">JOIN DATE</span>
          <span className="value">{formatJoinDate(employee.join_date)}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="rating-section">
        <StarRating rating={employee.rating} maxRating={employee.max_rating} />
        <span className="rating-text">{employee.rating}/{employee.max_rating}</span>
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

// Main component to fetch and display all employees
const EmployeeCards = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/dashboard/employees/enhanced/?include_profiles=true&format=detailed');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data.employees);
      } else {
        setError('Failed to fetch employee data');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchEmployees} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employee Directory</h1>
        <p>Total Employees: {employees.length}</p>
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
