// EmployeeCards.jsx - Comprehensive Employee Profile Cards
import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { gsap } from 'gsap';

// 3D Animation Keyframes
const cardEntrance = keyframes`
  0% {
    transform: perspective(1000px) rotateX(90deg) rotateY(45deg) translateZ(-300px);
    opacity: 0;
    scale: 0.6;
  }
  50% {
    transform: perspective(1000px) rotateX(45deg) rotateY(20deg) translateZ(-100px);
    opacity: 0.7;
    scale: 0.8;
  }
  100% {
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px);
    opacity: 1;
    scale: 1;
  }
`;

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

  // Fetch employee data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        console.log('Fetching comprehensive employee data...');
        
        const response = await fetch('http://127.0.0.1:8000/api/dashboard/employees/comprehensive/?include_profiles=true&format=detailed', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Employee data received:', data);
        
        if (data.success && data.data.employees) {
          setEmployees(data.data.employees);
        } else {
          throw new Error('Invalid API response format');
        }
        
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError(error.message);
        
        // Fallback demo data
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
            join_date: "Jul 12, 2020",
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
