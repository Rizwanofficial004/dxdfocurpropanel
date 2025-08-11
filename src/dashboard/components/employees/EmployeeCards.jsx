// EmployeeCards.jsx - Comprehensive Employee Profile Cards
import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { gsap } from 'gsap';

// 3D Animation Keyframes


const cardFloat = keyframes`
  0%, 100% {
    transform: perspective(1000px) translateY(0px) rotateX(0deg);
  }
  50% {
    transform: perspective(1000px) translateY(-8px) rotateX(2deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const EmployeeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
  perspective: 1000px;
  transform-style: preserve-3d;
`;

const EmployeeCard = styled.div`
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 1.5rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  min-height: 500px;
  
  // Glass morphism effect
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  // 3D Box Shadow
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 3D Hover Effects
  &:hover {
    transform: perspective(1000px) translateY(-12px) rotateX(8deg) rotateY(5deg) scale(1.02);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 2px 0 rgba(255, 255, 255, 0.2);
  }
  
  // Floating animation
  animation: ${css`${cardFloat} 6s ease-in-out infinite`};
  animation-delay: ${props => props.index * 0.2}s;
  
  // Entrance animation
  opacity: 0;
  transform: perspective(1000px) rotateX(90deg) rotateY(45deg) translateZ(-300px);
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.bgColor || 'linear-gradient(135deg, #6366f1, #8b5cf6)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1) rotateY(10deg);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.4),
      inset 0 3px 6px rgba(255, 255, 255, 0.3);
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const EmployeeName = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  text-align: center;
  margin: 0 0 0.5rem 0;
  
  background: linear-gradient(135deg, #f8fafc, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const JobTitle = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  text-align: center;
  margin: 0 0 1rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ContactInfo = styled.div`
  margin: 1.5rem 0;
  color: #cbd5e1;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
`;

const ContactIcon = styled.span`
  font-size: 1rem;
  min-width: 20px;
`;

const ContactText = styled.span`
  font-size: 0.875rem;
  color: #e2e8f0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Star = styled.span`
  color: ${props => props.filled ? '#fbbf24' : '#374151'};
  font-size: 1.25rem;
`;

const RatingText = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: #f8fafc;
  margin-left: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'view':
        return css`
          background: #3b82f6;
          color: white;
          &:hover {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }
        `;
      case 'edit':
        return css`
          background: #10b981;
          color: white;
          &:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          }
        `;
      case 'delete':
        return css`
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }
        `;
      default:
        return css`
          background: #6b7280;
          color: white;
          &:hover {
            background: #4b5563;
          }
        `;
    }
  }}
`;

const LoadingCard = styled(EmployeeCard)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.125rem;
`;

export const EmployeeCards = () => {
  const cardsRef = useRef([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employee data from CRM
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        console.log('Fetching employees from CRM...');
        
        const response = await fetch('https://crm.deluxebilisim.com/api/staffs', {
          method: 'GET',
          headers: {
            'authtoken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZGVsdXhldGltZSIsIm5hbWUiOiJkZWx1eGV0aW1lIiwiQVBJX1RJTUUiOjE3NDUzNDQyNjJ9.kJGo5DksaPwkHwufDvLMGaMmjk5q2F7GhjzwdHtfT_o',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'DDS-Focus-Time-Dashboard/1.0'
          },
        });
        
        if (!response.ok) {
          throw new Error(`CRM API failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('CRM data received:', data);
        
        // Transform CRM data to component format
        const transformedEmployees = data.map(staff => ({
          id: staff.staffid,
          full_name: `${staff.firstname} ${staff.lastname}`,
          first_name: staff.firstname,
          last_name: staff.lastname,
          initials: `${staff.firstname.charAt(0)}${staff.lastname.charAt(0)}`,
          email: staff.email,
          phone: formatPhoneNumber(staff.phonenumber),
          job_title: getJobTitle(staff.admin, staff.is_not_staff),
          department: staff.department_name || 'General',
          location: 'Office',
          join_date: staff.datecreated,
          hourly_rate: parseFloat(staff.hourly_rate) || 50,
          currency: 'USD',
          rating: 4.5,
          max_rating: 5.0,
          avatar_url: staff.profile_image ? `https://crm.deluxebilisim.com/${staff.profile_image}` : `https://ui-avatars.com/api/?name=${staff.firstname}+${staff.lastname}&background=6366f1&color=fff&size=200`,
          active: staff.active === '1'
        }));
        
        setEmployees(transformedEmployees);
        
      } catch (error) {
        console.error('Error fetching CRM employees:', error);
        setError(`Failed to load employees: ${error.message}`);
        
        // Fallback demo data for development
        const demoEmployees = [
          {
            id: 1001,
            full_name: "Emily Wilson",
            first_name: "Emily",
            last_name: "Wilson",
            initials: "EW",
            email: "emily.wilson@company.com",
            phone: "+1 (555) 456-7890",
            job_title: "HR Specialist",
            department: "Human Resources",
            location: "Austin, TX",
            join_date: "2020-07-12",
            hourly_rate: 65,
            currency: "USD",
            rating: 4.9,
            max_rating: 5.0,
            avatar_url: "https://ui-avatars.com/api/?name=Emily+Wilson&background=6366f1&color=fff&size=200"
          }
        ];
        setEmployees(demoEmployees);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Helper function to determine job title based on CRM roles
  const getJobTitle = (admin, isNotStaff) => {
    if (admin === '1') return 'Administrator';
    if (isNotStaff === '0') return 'Staff Member';
    return 'Employee';
  };

  // Helper function to format phone numbers dynamically
  const formatPhoneNumber = (phoneNumber) => {
    // Return N/A if no phone number provided
    if (!phoneNumber || phoneNumber.trim() === '') {
      return 'N/A';
    }
    
    // Clean the phone number (remove spaces, dashes, parentheses, plus signs)
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's empty after cleaning, return N/A
    if (cleaned.length === 0) {
      return 'N/A';
    }
    
    // Handle different international formats based on the actual CRM data patterns
    if (cleaned.startsWith('90') && cleaned.length === 12) {
      // Turkish numbers: 905XXXXXXXXX -> +90 (5XX) XXX XX XX
      return `+90 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    } else if (cleaned.startsWith('92') && cleaned.length === 12) {
      // Pakistani numbers: 923XXXXXXXXX -> +92 (3XX) XXX XXXX
      return `+92 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.startsWith('90') && cleaned.length === 13) {
      // Turkish numbers with country code: 905XXXXXXXXX -> +90 (5XX) XXX XX XX
      return `+90 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    } else if (cleaned.startsWith('92') && cleaned.length === 13) {
      // Pakistani numbers with country code: 923XXXXXXXXX -> +92 (3XX) XXX XXXX
      return `+92 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('90')) {
      // Turkish numbers without leading country code digit: 905XXXXXXXX -> +90 (5XX) XXX XX XX
      return `+90 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('92')) {
      // Pakistani numbers without leading country code digit: 923XXXXXXXX -> +92 (3XX) XXX XXXX
      return `+92 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else if (cleaned.length === 10) {
      // US format: (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US with country code: +1 (XXX) XXX-XXXX
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length >= 10) {
      // Generic international format for other numbers
      const countryCode = cleaned.slice(0, -10);
      const number = cleaned.slice(-10);
      return `+${countryCode} (${number.slice(0, 3)}) ${number.slice(3, 6)} ${number.slice(6)}`;
    } else if (cleaned.length >= 7) {
      // Shorter numbers: XXX-XXXX format
      if (cleaned.length === 7) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else if (cleaned.length === 8) {
        return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
      } else if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
    }
    
    // If we can't format it nicely, return the original with + prefix if it doesn't have one
    const original = phoneNumber.trim();
    return original.startsWith('+') ? original : `+${original}`;
  };

  // GSAP animations
  useEffect(() => {
    if (!loading && employees.length > 0) {
      // Set initial state
      gsap.set(cardsRef.current, {
        opacity: 0,
        rotationX: 90,
        rotationY: 45,
        z: -300,
        scale: 0.8
      });

      // Animate entrance
      gsap.to(cardsRef.current, {
        opacity: 1,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        scale: 1,
        duration: 1.2,
        ease: "back.out(1.7)",
        stagger: 0.2,
        delay: 0.3
      });
    }
  }, [loading, employees]);

  const renderStars = (rating, maxRating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < maxRating; i++) {
      stars.push(
        <Star key={i} filled={i < fullStars || (i === fullStars && hasHalfStar)}>
          ★
        </Star>
      );
    }
    
    return stars;
  };

  const formatJoinDate = (dateString) => {
    try {
      // Handle CRM date format (YYYY-MM-DD HH:MM:SS)
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <EmployeeGrid>
        {[1, 2, 3, 4].map((_, index) => (
          <LoadingCard key={index} index={index}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              <div>Loading employees...</div>
            </div>
          </LoadingCard>
        ))}
      </EmployeeGrid>
    );
  }

  if (error && employees.length === 0) {
    return (
      <EmployeeGrid>
        <LoadingCard>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <div>Error loading employees: {error}</div>
          </div>
        </LoadingCard>
      </EmployeeGrid>
    );
  }

  return (
    <EmployeeGrid>
      {employees.map((employee, index) => (
        <EmployeeCard
          key={employee.id}
          index={index}
          ref={el => cardsRef.current[index] = el}
        >
          <AvatarSection>
            <Avatar>
              {employee.avatar_url && employee.avatar_url.includes('http') ? (
                <AvatarImage src={employee.avatar_url} alt={employee.full_name} />
              ) : (
                employee.initials
              )}
            </Avatar>
          </AvatarSection>
          
          <EmployeeName>{employee.full_name}</EmployeeName>
          <JobTitle>{employee.job_title}</JobTitle>
          
          <ContactInfo>
            <ContactItem>
              <ContactIcon>📧</ContactIcon>
              <ContactText>{employee.email}</ContactText>
            </ContactItem>
            <ContactItem>
              <ContactIcon>📞</ContactIcon>
              <ContactText>{employee.phone}</ContactText>
            </ContactItem>
          </ContactInfo>
          
          <StatsGrid>
            <StatBox>
              <StatLabel>Hourly Rate</StatLabel>
              <StatValue>${employee.hourly_rate}/{employee.currency === 'USD' ? 'hr' : 'h'}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Department</StatLabel>
              <StatValue>{employee.department}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Location</StatLabel>
              <StatValue>{employee.location}</StatValue>
            </StatBox>
            <StatBox>
              <StatLabel>Join Date</StatLabel>
              <StatValue>{formatJoinDate(employee.join_date)}</StatValue>
            </StatBox>
          </StatsGrid>
          
          <RatingSection>
            <StarRating>
              {renderStars(employee.rating, employee.max_rating)}
            </StarRating>
            <RatingText>
              {employee.rating}/{employee.max_rating}
            </RatingText>
          </RatingSection>
          
          <ActionButtons>
            <ActionButton variant="view">
              👁️ View
            </ActionButton>
            <ActionButton variant="edit">
              ✏️ Edit
            </ActionButton>
            <ActionButton variant="delete">
              🗑️ Delete
            </ActionButton>
          </ActionButtons>
        </EmployeeCard>
      ))}
    </EmployeeGrid>
  );
};

export default EmployeeCards;
