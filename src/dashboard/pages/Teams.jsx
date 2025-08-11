import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { gsap } from 'gsap';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  TeamsWrapper,
  TeamsContainer,
  TeamsHeader,
  TeamsTitle,
  TeamsSubtitle,
  TeamStats,
  StatCard,
  StatIcon,
  StatValue,
  StatLabel,
  FilterSection,
  FilterInput,
  FilterSelect,
  TeamsGrid,
  TeamCard,
  TeamHeader,
  TeamIcon,
  TeamInfo,
  TeamName,
  TeamDescription,
  TeamStatsSection,
  TeamStatItem,
  TeamStatValue,
  TeamStatLabel,
  TeamMembersSection,
  TeamMembersTitle,
  TeamMembersList,
  TeamMemberChip,
  MemberAvatar,
  TeamActions,
  ActionButton,
  LoadingSpinner,
  NoDataMessage,
  // Modal Components
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ProfileSection,
  ProfileImageContainer,
  ProfileImage,
  ProfileInfo,
  ProfileName,
  ProfileRole,
  ProfileDescription,
  DetailsSection,
  SectionTitle,
  DetailsList,
  DetailItem,
  DetailIcon,
  DetailContent,
  DetailLabel,
  DetailValue,
  SkillsSection,
  SkillsList,
  SkillItem,
  SkillName,
  SkillLevel,
  SkillBar,
  SkillProgress,
  ModalActions,
  ModalActionButton
} from '../components/teams/Teams.styles';

// Generate comprehensive teams data for digital agency
const generateTeamsData = () => {
  const teams = [
    {
      id: 1,
      name: 'Frontend Development Team',
      description: 'Creating stunning user interfaces and exceptional user experiences',
      icon: '💻',
      color: '#3b82f6',
      category: 'Development',
      members: [
        { 
          name: 'Sarah Johnson', 
          role: 'Senior Frontend Developer', 
          avatar: '#e11d48',
          email: 'sarah.johnson@company.com',
          phone: '+1 (555) 123-4567',
          experience: '5 years',
          location: 'New York, NY',
          bio: 'Passionate frontend developer with expertise in React and modern web technologies. Loves creating beautiful user interfaces.',
          skills: [
            { name: 'React', level: 95, color: '#61dafb' },
            { name: 'TypeScript', level: 88, color: '#3178c6' },
            { name: 'CSS/SCSS', level: 92, color: '#1572b6' },
            { name: 'JavaScript', level: 90, color: '#f7df1e' }
          ]
        },
        { 
          name: 'Mike Chen', 
          role: 'React Specialist', 
          avatar: '#059669',
          email: 'mike.chen@company.com',
          phone: '+1 (555) 234-5678',
          experience: '4 years',
          location: 'San Francisco, CA',
          bio: 'React enthusiast focused on building scalable and performant web applications with modern development practices.',
          skills: [
            { name: 'React', level: 98, color: '#61dafb' },
            { name: 'Redux', level: 85, color: '#764abc' },
            { name: 'GraphQL', level: 80, color: '#e10098' },
            { name: 'Node.js', level: 75, color: '#339933' }
          ]
        },
        { 
          name: 'Emily Davis', 
          role: 'UI/UX Developer', 
          avatar: '#7c3aed',
          email: 'emily.davis@company.com',
          phone: '+1 (555) 345-6789',
          experience: '3 years',
          location: 'Austin, TX',
          bio: 'Creative developer bridging the gap between design and development with a focus on user experience.',
          skills: [
            { name: 'Figma', level: 93, color: '#f24e1e' },
            { name: 'CSS Animation', level: 88, color: '#1572b6' },
            { name: 'Vue.js', level: 82, color: '#4fc08d' },
            { name: 'Adobe XD', level: 90, color: '#ff61f6' }
          ]
        },
        { 
          name: 'Alex Rodriguez', 
          role: 'Frontend Lead', 
          avatar: '#dc2626',
          email: 'alex.rodriguez@company.com',
          phone: '+1 (555) 456-7890',
          experience: '7 years',
          location: 'Miami, FL',
          bio: 'Experienced frontend lead with a passion for mentoring developers and architecting scalable solutions.',
          skills: [
            { name: 'Leadership', level: 95, color: '#f59e0b' },
            { name: 'Angular', level: 90, color: '#dd0031' },
            { name: 'React', level: 88, color: '#61dafb' },
            { name: 'Architecture', level: 92, color: '#8b5cf6' }
          ]
        },
        { 
          name: 'Jessica Kim', 
          role: 'Vue.js Developer', 
          avatar: '#0ea5e9',
          email: 'jessica.kim@company.com',
          phone: '+1 (555) 567-8901',
          experience: '3 years',
          location: 'Seattle, WA',
          bio: 'Vue.js specialist passionate about creating responsive and interactive web applications.',
          skills: [
            { name: 'Vue.js', level: 94, color: '#4fc08d' },
            { name: 'Nuxt.js', level: 85, color: '#00dc82' },
            { name: 'JavaScript', level: 87, color: '#f7df1e' },
            { name: 'Tailwind CSS', level: 90, color: '#06b6d4' }
          ]
        }
      ],
      stats: {
        activeProjects: 12,
        completedProjects: 89,
        teamSize: 5
      },
      technologies: ['React', 'Vue.js', 'Angular', 'TypeScript', 'Tailwind CSS'],
      established: '2020-01-15'
    },
    {
      id: 2,
      name: 'Backend Development Team',
      description: 'Building robust server-side applications and APIs',
      icon: '⚙️',
      color: '#10b981',
      category: 'Development',
      members: [
        { name: 'David Wilson', role: 'Backend Lead', avatar: '#f59e0b' },
        { name: 'Lisa Brown', role: 'API Architect', avatar: '#8b5cf6' },
        { name: 'John Smith', role: 'Database Specialist', avatar: '#06b6d4' },
        { name: 'Maria Garcia', role: 'DevOps Engineer', avatar: '#84cc16' },
        { name: 'Robert Taylor', role: 'Python Developer', avatar: '#ef4444' }
      ],
      stats: {
        activeProjects: 8,
        completedProjects: 156,
        teamSize: 5
      },
      technologies: ['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB'],
      established: '2019-03-22'
    },
    {
      id: 3,
      name: 'Digital Marketing Team',
      description: 'Driving growth through strategic digital marketing campaigns',
      icon: '📊',
      color: '#f59e0b',
      category: 'Marketing',
      members: [
        { name: 'Amanda Thompson', role: 'Marketing Director', avatar: '#ec4899' },
        { name: 'Chris Anderson', role: 'SEO Specialist', avatar: '#10b981' },
        { name: 'Sophie Martinez', role: 'Content Strategist', avatar: '#6366f1' },
        { name: 'James Wilson', role: 'PPC Manager', avatar: '#f97316' },
        { name: 'Rachel Green', role: 'Social Media Manager', avatar: '#14b8a6' }
      ],
      stats: {
        activeProjects: 25,
        completedProjects: 340,
        teamSize: 5
      },
      technologies: ['Google Analytics', 'Facebook Ads', 'SEMrush', 'Mailchimp', 'HubSpot'],
      established: '2018-07-10'
    },
    {
      id: 4,
      name: 'Human Resources Team',
      description: 'Managing talent acquisition, development, and employee relations',
      icon: '👥',
      color: '#8b5cf6',
      category: 'Management',
      members: [
        { name: 'Jennifer Adams', role: 'HR Director', avatar: '#be185d' },
        { name: 'Mark Johnson', role: 'Talent Acquisition', avatar: '#0369a1' },
        { name: 'Laura Mitchell', role: 'Employee Relations', avatar: '#059669' },
        { name: 'Paul Davis', role: 'Training Coordinator', avatar: '#dc2626' }
      ],
      stats: {
        activeProjects: 15,
        completedProjects: 89,
        teamSize: 4
      },
      technologies: ['BambooHR', 'Workday', 'LinkedIn Recruiter', 'Slack', 'Zoom'],
      established: '2017-11-05'
    },
    {
      id: 5,
      name: 'WordPress Development Team',
      description: 'Creating custom WordPress solutions and maintaining websites',
      icon: '📝',
      color: '#06b6d4',
      category: 'Development',
      members: [
        { name: 'Tom Richards', role: 'WordPress Lead', avatar: '#7c2d12' },
        { name: 'Anna Cooper', role: 'Theme Developer', avatar: '#be123c' },
        { name: 'Kevin Lee', role: 'Plugin Developer', avatar: '#166534' },
        { name: 'Grace Taylor', role: 'WooCommerce Specialist', avatar: '#9333ea' }
      ],
      stats: {
        activeProjects: 18,
        completedProjects: 127,
        teamSize: 4
      },
      technologies: ['WordPress', 'PHP', 'WooCommerce', 'Elementor', 'ACF'],
      established: '2019-09-12'
    },
    {
      id: 6,
      name: 'Server Management Team',
      description: 'Maintaining infrastructure, security, and server optimization',
      icon: '🖥️',
      color: '#dc2626',
      category: 'Infrastructure',
      members: [
        { name: 'Michael Brown', role: 'DevOps Lead', avatar: '#1f2937' },
        { name: 'Linda Wilson', role: 'Cloud Architect', avatar: '#0f766e' },
        { name: 'Steve Garcia', role: 'Security Engineer', avatar: '#7c3aed' },
        { name: 'Helen Davis', role: 'System Administrator', avatar: '#ea580c' }
      ],
      stats: {
        activeProjects: 6,
        completedProjects: 98,
        teamSize: 4
      },
      technologies: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Nginx'],
      established: '2018-02-28'
    },
    {
      id: 7,
      name: 'UI/UX Design Team',
      description: 'Crafting beautiful and intuitive user experiences',
      icon: '🎨',
      color: '#ec4899',
      category: 'Design',
      members: [
        { name: 'Olivia Parker', role: 'Design Director', avatar: '#be185d' },
        { name: 'Daniel Kim', role: 'UI Designer', avatar: '#0369a1' },
        { name: 'Emma Watson', role: 'UX Researcher', avatar: '#059669' },
        { name: 'Lucas Miller', role: 'Product Designer', avatar: '#7c2d12' },
        { name: 'Sophia Chen', role: 'Visual Designer', avatar: '#9333ea' }
      ],
      stats: {
        activeProjects: 14,
        completedProjects: 203,
        teamSize: 5
      },
      technologies: ['Figma', 'Adobe XD', 'Sketch', 'Principle', 'InVision'],
      established: '2018-05-20'
    },
    {
      id: 8,
      name: 'Quality Assurance Team',
      description: 'Ensuring high-quality deliverables through comprehensive testing',
      icon: '🔍',
      color: '#84cc16',
      category: 'Quality',
      members: [
        { name: 'Ryan Thompson', role: 'QA Lead', avatar: '#166534' },
        { name: 'Monica Rodriguez', role: 'Test Automation Engineer', avatar: '#be123c' },
        { name: 'Ian Foster', role: 'Manual Tester', avatar: '#0369a1' },
        { name: 'Natalie Brooks', role: 'Performance Tester', avatar: '#7c3aed' }
      ],
      stats: {
        activeProjects: 10,
        completedProjects: 145,
        teamSize: 4
      },
      technologies: ['Selenium', 'Jest', 'Cypress', 'Postman', 'JMeter'],
      established: '2019-06-15'
    },
    {
      id: 9,
      name: 'Data Analytics Team',
      description: 'Extracting insights from data to drive business decisions',
      icon: '📈',
      color: '#0ea5e9',
      category: 'Analytics',
      members: [
        { name: 'Dr. Sarah Connor', role: 'Data Science Lead', avatar: '#be185d' },
        { name: 'Alex Turner', role: 'Business Analyst', avatar: '#059669' },
        { name: 'Maya Patel', role: 'Data Engineer', avatar: '#7c3aed' },
        { name: 'Ben Clarke', role: 'ML Engineer', avatar: '#dc2626' }
      ],
      stats: {
        activeProjects: 7,
        completedProjects: 67,
        teamSize: 4
      },
      technologies: ['Python', 'R', 'Tableau', 'Power BI', 'TensorFlow'],
      established: '2020-08-10'
    },
    {
      id: 10,
      name: 'Mobile Development Team',
      description: 'Building native and cross-platform mobile applications',
      icon: '📱',
      color: '#f97316',
      category: 'Development',
      members: [
        { name: 'Carlos Mendoza', role: 'Mobile Lead', avatar: '#7c2d12' },
        { name: 'Priya Sharma', role: 'iOS Developer', avatar: '#be123c' },
        { name: 'Ahmed Hassan', role: 'Android Developer', avatar: '#166534' },
        { name: 'Yuki Tanaka', role: 'React Native Developer', avatar: '#9333ea' }
      ],
      stats: {
        activeProjects: 9,
        completedProjects: 78,
        teamSize: 4
      },
      technologies: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'Xamarin'],
      established: '2020-01-20'
    },
    {
      id: 11,
      name: 'Content Creation Team',
      description: 'Producing engaging content across all digital platforms',
      icon: '✍️',
      color: '#14b8a6',
      category: 'Content',
      members: [
        { name: 'Isabella Martinez', role: 'Content Director', avatar: '#be185d' },
        { name: 'Jacob Williams', role: 'Copywriter', avatar: '#0369a1' },
        { name: 'Zoe Anderson', role: 'Video Producer', avatar: '#059669' },
        { name: 'Ethan Moore', role: 'Graphic Designer', avatar: '#7c3aed' }
      ],
      stats: {
        activeProjects: 22,
        completedProjects: 456,
        teamSize: 4
      },
      technologies: ['Adobe Creative Suite', 'Canva', 'Final Cut Pro', 'Grammarly', 'Buffer'],
      established: '2017-12-01'
    },
    {
      id: 12,
      name: 'Sales & Business Development Team',
      description: 'Driving revenue growth and building strategic partnerships',
      icon: '💼',
      color: '#6366f1',
      category: 'Sales',
      members: [
        { name: 'Victoria Stone', role: 'Sales Director', avatar: '#be185d' },
        { name: 'Marcus Johnson', role: 'Account Manager', avatar: '#059669' },
        { name: 'Diana Foster', role: 'Business Development', avatar: '#7c3aed' },
        { name: 'Nathan Wright', role: 'Sales Representative', avatar: '#dc2626' }
      ],
      stats: {
        activeProjects: 35,
        completedProjects: 289,
        teamSize: 4
      },
      technologies: ['Salesforce', 'HubSpot CRM', 'Pipedrive', 'LinkedIn Sales Navigator', 'Calendly'],
      established: '2017-04-15'
    }
  ];

  return teams;
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

// 3D Team Card Component
const Team3DCard = ({ team, index, isDarkMode, onView, onEdit, onManage, onMemberClick }) => {
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
          delay: index * 0.1
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
        scale: 1.02,
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
    <TeamCard
      ref={cardRef}
      index={index}
      isDarkMode={isDarkMode}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <TeamHeader>
        <TeamIcon color={team.color}>
          {team.icon}
        </TeamIcon>
        <TeamInfo>
          <TeamName isDarkMode={isDarkMode}>{team.name}</TeamName>
          <TeamDescription isDarkMode={isDarkMode}>{team.description}</TeamDescription>
        </TeamInfo>
      </TeamHeader>

      <TeamStatsSection className="team-stats">
        <TeamStatItem isDarkMode={isDarkMode}>
          <TeamStatValue color={team.color}>{team.stats.activeProjects}</TeamStatValue>
          <TeamStatLabel isDarkMode={isDarkMode}>Active</TeamStatLabel>
        </TeamStatItem>
        <TeamStatItem isDarkMode={isDarkMode}>
          <TeamStatValue color="#10b981">{team.stats.completedProjects}</TeamStatValue>
          <TeamStatLabel isDarkMode={isDarkMode}>Completed</TeamStatLabel>
        </TeamStatItem>
        <TeamStatItem isDarkMode={isDarkMode}>
          <TeamStatValue color="#f59e0b">{team.stats.teamSize}</TeamStatValue>
          <TeamStatLabel isDarkMode={isDarkMode}>Members</TeamStatLabel>
        </TeamStatItem>
      </TeamStatsSection>

      <TeamMembersSection className="team-members">
        <TeamMembersTitle isDarkMode={isDarkMode}>Team Members</TeamMembersTitle>
        <TeamMembersList>
          {team.members.map((member, memberIndex) => (
            <TeamMemberChip
              key={memberIndex}
              index={memberIndex}
              isDarkMode={isDarkMode}
              onClick={() => onMemberClick(member, team.name)}
              style={{ cursor: 'pointer' }}
            >
              <MemberAvatar color={member.avatar}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </MemberAvatar>
              {member.name}
            </TeamMemberChip>
          ))}
        </TeamMembersList>
      </TeamMembersSection>

      <TeamActions>
        <ActionButton variant="primary" onClick={() => onView(team.id)}>
          👁️ View Details
        </ActionButton>
        <ActionButton variant="secondary" isDarkMode={isDarkMode} onClick={() => onEdit(team.id)}>
          ✏️ Edit Team
        </ActionButton>
        <ActionButton variant="secondary" isDarkMode={isDarkMode} onClick={() => onManage(team.id)}>
          👥 Manage
        </ActionButton>
      </TeamActions>
    </TeamCard>
  );
};

// Statistics Card Component with 3D effects
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
      delay={delay}
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

// Profile Modal Component
const ProfileModal = ({ member, isOpen, isClosing, onClose, isDarkMode }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen || !member) return null;

  return (
    <ModalOverlay 
      isDarkMode={isDarkMode} 
      isClosing={isClosing}
      onClick={onClose}
    >
      <ModalContainer 
        ref={modalRef}
        isDarkMode={isDarkMode} 
        isClosing={isClosing}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader>
          <ModalTitle isDarkMode={isDarkMode}>👤 Profile Details</ModalTitle>
          <ModalCloseButton isDarkMode={isDarkMode} onClick={onClose}>
            ✕
          </ModalCloseButton>
        </ModalHeader>

        <ProfileSection>
          <ProfileImageContainer>
            <ProfileImage color={member.avatar} isDarkMode={isDarkMode}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </ProfileImage>
          </ProfileImageContainer>
          <ProfileInfo>
            <ProfileName isDarkMode={isDarkMode}>{member.name}</ProfileName>
            <ProfileRole color={member.avatar}>{member.role}</ProfileRole>
            <ProfileDescription isDarkMode={isDarkMode}>
              {member.bio || 'Passionate team member dedicated to delivering exceptional results.'}
            </ProfileDescription>
          </ProfileInfo>
        </ProfileSection>

        <DetailsSection>
          <SectionTitle isDarkMode={isDarkMode}>
            📋 Contact & Details
          </SectionTitle>
          <DetailsList>
            <DetailItem isDarkMode={isDarkMode}>
              <DetailIcon>📧</DetailIcon>
              <DetailContent>
                <DetailLabel isDarkMode={isDarkMode}>Email</DetailLabel>
                <DetailValue isDarkMode={isDarkMode}>{member.email}</DetailValue>
              </DetailContent>
            </DetailItem>
            <DetailItem isDarkMode={isDarkMode}>
              <DetailIcon>📱</DetailIcon>
              <DetailContent>
                <DetailLabel isDarkMode={isDarkMode}>Phone</DetailLabel>
                <DetailValue isDarkMode={isDarkMode}>{member.phone}</DetailValue>
              </DetailContent>
            </DetailItem>
            <DetailItem isDarkMode={isDarkMode}>
              <DetailIcon>🏢</DetailIcon>
              <DetailContent>
                <DetailLabel isDarkMode={isDarkMode}>Team</DetailLabel>
                <DetailValue isDarkMode={isDarkMode}>{member.teamName}</DetailValue>
              </DetailContent>
            </DetailItem>
            <DetailItem isDarkMode={isDarkMode}>
              <DetailIcon>📍</DetailIcon>
              <DetailContent>
                <DetailLabel isDarkMode={isDarkMode}>Location</DetailLabel>
                <DetailValue isDarkMode={isDarkMode}>{member.location}</DetailValue>
              </DetailContent>
            </DetailItem>
            <DetailItem isDarkMode={isDarkMode}>
              <DetailIcon>⏰</DetailIcon>
              <DetailContent>
                <DetailLabel isDarkMode={isDarkMode}>Experience</DetailLabel>
                <DetailValue isDarkMode={isDarkMode}>{member.experience}</DetailValue>
              </DetailContent>
            </DetailItem>
          </DetailsList>
        </DetailsSection>

        {member.skills && member.skills.length > 0 && (
          <SkillsSection>
            <SectionTitle isDarkMode={isDarkMode}>
              🛠️ Skills & Expertise
            </SectionTitle>
            <SkillsList>
              {member.skills.map((skill, index) => (
                <SkillItem key={index} isDarkMode={isDarkMode}>
                  <SkillName>
                    <span>{skill.name}</span>
                    <SkillLevel color={skill.color}>{skill.level}%</SkillLevel>
                  </SkillName>
                  <SkillBar isDarkMode={isDarkMode}>
                    <SkillProgress 
                      color={skill.color} 
                      level={skill.level}
                      delay={index * 200}
                    />
                  </SkillBar>
                </SkillItem>
              ))}
            </SkillsList>
          </SkillsSection>
        )}

        <ModalActions>
          <ModalActionButton variant="secondary" isDarkMode={isDarkMode} onClick={onClose}>
            📞 Contact
          </ModalActionButton>
          <ModalActionButton variant="primary">
            💬 Send Message
          </ModalActionButton>
        </ModalActions>
      </ModalContainer>
    </ModalOverlay>
  );
};

const Teams = () => {
  const themeContext = useTheme();
  const { isDarkMode = false, theme = {} } = themeContext || {};
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  // Generate teams data on component mount
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const dummyData = generateTeamsData();
      setTeamsData(dummyData);
      setLoading(false);
    }, 1500);
  }, []);

  // Calculate statistics
  const stats = {
    totalTeams: teamsData.length,
    totalMembers: teamsData.reduce((sum, team) => sum + team.stats.teamSize, 0),
    activeProjects: teamsData.reduce((sum, team) => sum + team.stats.activeProjects, 0),
    completedProjects: teamsData.reduce((sum, team) => sum + team.stats.completedProjects, 0)
  };

  // Filter data based on search and filters
  const filteredData = teamsData.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || team.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['All', ...new Set(teamsData.map(team => team.category))];

  const handleView = (teamId) => {
    console.log('View team:', teamId);
    // Implement view functionality
  };

  const handleEdit = (teamId) => {
    console.log('Edit team:', teamId);
    // Implement edit functionality
  };

  const handleManage = (teamId) => {
    console.log('Manage team:', teamId);
    // Implement manage functionality
  };

  const handleMemberClick = (member, teamName) => {
    setSelectedMember({ ...member, teamName });
    setIsModalOpen(true);
    setIsModalClosing(false);
  };

  const handleCloseModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedMember(null);
      setIsModalClosing(false);
    }, 800);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <DashboardLayout headerTitle="Teams Management" headerBreadcrumb="Home / Organization / Teams">
      <TeamsWrapper isDarkMode={isDarkMode}>
        <TeamsContainer>
          {/* Header Section */}
          <TeamsHeader>
            <TeamsTitle isDarkMode={isDarkMode}>
              🏢 Teams Management Dashboard
            </TeamsTitle>
            <TeamsSubtitle isDarkMode={isDarkMode}>
              Manage your digital agency teams with comprehensive insights and collaboration tools
            </TeamsSubtitle>
          </TeamsHeader>

          {/* Statistics Cards */}
          <TeamStats>
            <StatsCard3D
              icon="🏢"
              value={stats.totalTeams}
              label="Total Teams"
              color="#3b82f6"
              delay={0}
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="👥"
              value={stats.totalMembers}
              label="Team Members"
              color="#10b981"
              delay={200}
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="🚀"
              value={stats.activeProjects}
              label="Active Projects"
              color="#f59e0b"
              delay={400}
              isDarkMode={isDarkMode}
            />
            <StatsCard3D
              icon="✅"
              value={stats.completedProjects}
              label="Completed Projects"
              color="#8b5cf6"
              delay={600}
              isDarkMode={isDarkMode}
            />
          </TeamStats>

          {/* Filters */}
          <FilterSection>
            <FilterInput
              type="text"
              placeholder="🔍 Search teams by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              isDarkMode={isDarkMode}
            />
            <FilterSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              isDarkMode={isDarkMode}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </FilterSelect>
          </FilterSection>

          {/* Teams Grid */}
          {loading ? (
            <LoadingSpinner isDarkMode={isDarkMode} />
          ) : filteredData.length === 0 ? (
            <NoDataMessage isDarkMode={isDarkMode}>
              No teams found matching your criteria
            </NoDataMessage>
          ) : (
            <TeamsGrid>
              {filteredData.map((team, index) => (
                <Team3DCard
                  key={team.id}
                  team={team}
                  index={index}
                  isDarkMode={isDarkMode}
                  onView={handleView}
                  onEdit={handleEdit}
                  onManage={handleManage}
                  onMemberClick={handleMemberClick}
                />
              ))}
            </TeamsGrid>
          )}
        </TeamsContainer>

        {/* Profile Modal */}
        <ProfileModal
          member={selectedMember}
          isOpen={isModalOpen}
          isClosing={isModalClosing}
          onClose={handleModalOverlayClick}
          isDarkMode={isDarkMode}
        />
      </TeamsWrapper>
    </DashboardLayout>
  );
};

export default Teams;
