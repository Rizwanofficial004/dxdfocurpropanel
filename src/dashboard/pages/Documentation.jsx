import React, { useState } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Styled Components
const DocumentationContainer = styled.div`
  padding: 10px 24px 24px;
//   max-width: 1200px;
  margin: 0 auto;
  background: transparent;
  min-height: calc(100vh - 140px);
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 24px;
`;

const SearchBox = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const DocSidebar = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1a1f2e' : '#f8fafc'};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
`;

const SidebarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const CategoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const CategoryItem = styled.li`
  margin-bottom: 8px;
`;

const CategoryLink = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: ${props => props.$isActive ? props.theme.colors.primary + '20' : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary + '20'};
    color: ${props => props.theme.colors.primary};
  }
`;

const MainContent = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1a1f2e' : '#ffffff'};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 32px;
`;

const ContentTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const ContentText = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.text.secondary};
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
    margin: 24px 0 12px 0;
  }
  
  h4 {
    font-size: 18px;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
    margin: 20px 0 8px 0;
  }
  
  p {
    margin-bottom: 16px;
  }
  
  ul, ol {
    margin-bottom: 16px;
    padding-left: 24px;
  }
  
  li {
    margin-bottom: 8px;
  }
  
  code {
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : '#f1f5f9'};
    color: ${props => props.theme.colors.primary};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 14px;
  }
  
  pre {
    background: ${props => props.theme.mode === 'dark' ? '#2d3748' : '#f1f5f9'};
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 16px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
`;

const Documentation = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'overview', label: 'Project Overview' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'live-tracking', label: 'Live Tracking' },
        { id: 'quick-view', label: 'Quick View' },
    { id: 'image-modal', label: 'Image Modal' },
    { id: 'settings', label: 'Settings' },
    { id: 'api-integration', label: 'API Integration' },
  ];

  const content = {
    en: {
      'overview': {
        title: '🎯 Admin Focus - Project Overview',
        content: `
          <h3>About This Project</h3>
          <p>Admin Focus is a comprehensive employee monitoring and productivity tracking dashboard built with React. It provides real-time insights into workforce activities with a modern, responsive interface.</p>
          
          <h4>🚀 Current Features</h4>
          <ul>
            <li><strong>📊 Dashboard:</strong> Central hub with overview widgets and statistics</li>
            <li><strong>🛰️ Live Tracking:</strong> Real-time employee activity monitoring with screenshots</li>

            <li><strong>👁️ Quick View:</strong> Quick access to employee data and activities</li>
            <li><strong>⚙️ Settings:</strong> System configuration and preferences</li>
            <li><strong>📷 Image Modal:</strong> Enhanced image viewing with animations and download</li>
          </ul>

          <h4>🔧 Tech Stack</h4>
          <ul>
            <li><strong>Frontend:</strong> React 18 with Hooks</li>
            <li><strong>Styling:</strong> Styled Components with theme system</li>
            <li><strong>Routing:</strong> React Router v6</li>
            <li><strong>State Management:</strong> React Context API</li>
            <li><strong>Animation:</strong> Framer Motion</li>
            <li><strong>Build Tool:</strong> Vite</li>
          </ul>

          <h4>📁 Project Structure</h4>
          <pre><code>src/
├── dashboard/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   └── common/
│   │       └── ImageModal.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── LiveTracking.jsx
│   │   ├── TimeLogActivityStream.jsx
│   │   ├── QuickView.jsx
│   │   └── Settings.jsx
│   └── context/
│       ├── ThemeContext.jsx
│       └── LanguageContext.jsx
└── auth/
    └── pages/
        └── Login.jsx</code></pre>
        `
      },
      'dashboard': {
        title: '📊 Dashboard Usage',
        content: `
          <h3>Dashboard Overview</h3>
          <p>The main dashboard provides a centralized view of your monitoring system with key metrics and quick access to all features.</p>
          
          <h4>🎛️ Navigation</h4>
          <ul>
            <li><strong>Sidebar:</strong> Use the left sidebar to navigate between different sections</li>
            <li><strong>Header:</strong> Contains user info, notifications, and theme toggle</li>
            <li><strong>Breadcrumbs:</strong> Shows your current location in the app</li>
          </ul>
          
          <h4>📈 Widgets</h4>
          <ul>
            <li><strong>Stats Cards:</strong> Display key metrics like active employees, productivity scores</li>
            <li><strong>Charts:</strong> Visual representation of data trends</li>
            <li><strong>Recent Activity:</strong> Latest employee activities and system events</li>
          </ul>
          
          <h4>🎨 Theming</h4>
          <p>Toggle between light and dark themes using the theme button in the header. The theme preference is saved automatically.</p>
        `
      },
      'live-tracking': {
        title: '🛰️ Live Tracking',
        content: `
          <h3>Real-time Employee Monitoring</h3>
          <p>The Live Tracking feature allows you to monitor employee activities in real-time with screenshot capture and activity tracking.</p>
          
          <h4>📷 Screenshot Viewing</h4>
          <ul>
            <li><strong>Click to Enlarge:</strong> Click on any screenshot to open it in the Image Modal</li>
            <li><strong>Full Screen View:</strong> View screenshots in full resolution</li>
            <li><strong>Download:</strong> Download screenshots directly from the modal</li>
            <li><strong>Navigation:</strong> Use keyboard arrows or modal controls to navigate</li>
          </ul>
          
          <h4>⚡ Features</h4>
          <ul>
            <li><strong>Real-time Updates:</strong> Screenshots refresh automatically</li>
            <li><strong>Employee Search:</strong> Filter by employee name or ID</li>
            <li><strong>Activity Status:</strong> See who's active, idle, or offline</li>
            <li><strong>Time Tracking:</strong> Monitor work hours and productivity</li>
          </ul>
          
          <h4>🔒 Privacy & Compliance</h4>
          <p>All monitoring is conducted with employee awareness and compliance with privacy regulations. Screenshots are captured at configurable intervals.</p>
        `
      },
      'quick-view': {
        title: '👁️ Quick View',
        content: `
          <h3>Quick Employee Overview</h3>
          <p>The Quick View page provides a simplified interface for quick access to employee data and current activities.</p>
          
          <h4>⚡ Features</h4>
          <ul>
            <li><strong>Employee Grid:</strong> Grid layout showing all employees at a glance</li>
            <li><strong>Status Indicators:</strong> Visual indicators for online/offline status</li>
            <li><strong>Quick Actions:</strong> Rapid access to common tasks</li>
            <li><strong>Summary Cards:</strong> Key metrics for each employee</li>
          </ul>
          
          <h4>🎯 Use Cases</h4>
          <ul>
            <li>Quick team status check</li>
            <li>Rapid employee lookup</li>
            <li>Overview of current activities</li>
            <li>Fast access to individual employee details</li>
          </ul>
        `
      },
      'image-modal': {
        title: '📷 Image Modal Component',
        content: `
          <h3>Enhanced Image Viewing Experience</h3>
          <p>The Image Modal provides a sophisticated image viewing experience with animations, keyboard navigation, and download functionality.</p>
          
          <h4>✨ Features</h4>
          <ul>
            <li><strong>Smooth Animations:</strong> Powered by Framer Motion for fluid transitions</li>
            <li><strong>Keyboard Navigation:</strong> Use arrow keys, ESC to close</li>
            <li><strong>Download Support:</strong> One-click image download with CORS handling</li>
            <li><strong>Portal Rendering:</strong> Renders outside normal DOM hierarchy</li>
          </ul>
          
          <h4>🎮 Controls</h4>
          <ul>
            <li><strong>ESC Key:</strong> Close modal</li>
            <li><strong>Left/Right Arrows:</strong> Navigate between images (if multiple)</li>
            <li><strong>Click Outside:</strong> Close modal</li>
            <li><strong>Download Button:</strong> Save image to device</li>
          </ul>
          
          <h4>🔧 Technical Details</h4>
          <ul>
            <li><strong>Portal:</strong> Uses React.createPortal for proper layering</li>
            <li><strong>Animation:</strong> Framer Motion variants for smooth enter/exit</li>
            <li><strong>CORS:</strong> Handles cross-origin image downloads</li>
            <li><strong>Loading States:</strong> Shows loading indicator for large images</li>
          </ul>
          
          <h4>💻 Usage</h4>
          <pre><code>import ImageModal from '../components/common/ImageModal';

// In your component
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedImage, setSelectedImage] = useState('');

&lt;ImageModal
  isOpen={isModalOpen}
  src={selectedImage}
  alt="Screenshot"
  onClose={() => setIsModalOpen(false)}
/&gt;</code></pre>
        `
      },
      'settings': {
        title: '⚙️ Settings Configuration',
        content: `
          <h3>System Configuration</h3>
          <p>The Settings page allows you to configure various aspects of the monitoring system to match your organization's needs.</p>
          
          <h4>🎨 Theme Settings</h4>
          <ul>
            <li><strong>Dark/Light Mode:</strong> Toggle between dark and light themes</li>
            <li><strong>Auto Theme:</strong> Follow system preference</li>
            <li><strong>Custom Colors:</strong> Customize accent colors</li>
          </ul>
          
          <h4>🔔 Notification Settings</h4>
          <ul>
            <li><strong>Alert Types:</strong> Configure which events trigger notifications</li>
            <li><strong>Frequency:</strong> Set notification frequency</li>
            <li><strong>Channels:</strong> Choose notification delivery methods</li>
          </ul>
          
          <h4>🛡️ Privacy Settings</h4>
          <ul>
            <li><strong>Screenshot Intervals:</strong> Configure capture frequency</li>
            <li><strong>Data Retention:</strong> Set how long data is stored</li>
            <li><strong>Access Controls:</strong> Manage user permissions</li>
          </ul>
          
          <h4>🔌 API Configuration</h4>
          <ul>
            <li><strong>Credentials:</strong> Manage API keys and tokens</li>
            <li><strong>Endpoints:</strong> Configure API endpoints</li>
            <li><strong>Rate Limiting:</strong> Set API usage limits</li>
          </ul>
        `
      },
      'api-integration': {
        title: '🔌 API Integration',
        content: `
          <h3>API Configuration & Testing</h3>
          <p>The system includes comprehensive API integration tools for connecting with external services and managing data flow.</p>
          
          <h4>🔑 Authentication</h4>
          <ul>
            <li><strong>API Keys:</strong> Secure API key management</li>
            <li><strong>OAuth:</strong> OAuth 2.0 authentication flow</li>
            <li><strong>JWT Tokens:</strong> JSON Web Token handling</li>
            <li><strong>Session Management:</strong> Automatic token refresh</li>
          </ul>
          
          <h4>🧪 API Testing Tools</h4>
          <ul>
            <li><strong>API Tester:</strong> Built-in tool for testing endpoints</li>
            <li><strong>Request Builder:</strong> Visual request composition</li>
            <li><strong>Response Inspector:</strong> Detailed response analysis</li>
            <li><strong>Mock Data:</strong> Test with mock data when APIs are unavailable</li>
          </ul>
          
          <h4>📊 Data Sources</h4>
          <ul>
            <li><strong>S3 Integration:</strong> Amazon S3 for log storage and retrieval</li>
            <li><strong>Database APIs:</strong> Direct database connections</li>
            <li><strong>Third-party APIs:</strong> External service integrations</li>
            <li><strong>Webhooks:</strong> Real-time data updates</li>
          </ul>
          
          <h4>⚡ Performance</h4>
          <ul>
            <li><strong>Caching:</strong> Intelligent response caching</li>
            <li><strong>Rate Limiting:</strong> Automatic rate limit handling</li>
            <li><strong>Error Handling:</strong> Comprehensive error management</li>
            <li><strong>Retry Logic:</strong> Automatic retry for failed requests</li>
          </ul>
          
          <h4>🔧 Configuration Files</h4>
          <pre><code>// services/api.js - Main API configuration
// services/settingsAPI.js - Settings-specific APIs
// services/mockSettingsAPI.js - Mock data for testing
// utils/settingsAPITester.js - API testing utilities</code></pre>
        `
      }
    }
  };

  const getFilteredContent = () => {
    if (!searchTerm) return content[language] || content.en;
    
    const filtered = {};
    Object.keys(content[language] || content.en).forEach(key => {
      const item = (content[language] || content.en)[key];
      if (item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[key] = item;
      }
    });
    return filtered;
  };

  const filteredContent = getFilteredContent();
  const currentContent = filteredContent[activeCategory] || Object.values(filteredContent)[0];

  return (
    <DashboardLayout>
      <DocumentationContainer theme={theme}>
        <Header>
          <Title theme={theme}>DOCUMENTATION</Title>
          <Subtitle theme={theme}>
            Comprehensive guide to using the Admin Focus dashboard
          </Subtitle>
        </Header>
        
        <ContentArea>
          <DocSidebar theme={theme}>
            <SidebarTitle theme={theme}>Categories</SidebarTitle>
            <SearchBox
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
            />
            <CategoryList>
              {Object.keys(filteredContent).map(categoryId => (
                <CategoryItem key={categoryId}>
                  <CategoryLink
                    theme={theme}
                    $isActive={activeCategory === categoryId}
                    onClick={() => setActiveCategory(categoryId)}
                  >
                    {categories.find(cat => cat.id === categoryId)?.label || categoryId}
                  </CategoryLink>
                </CategoryItem>
              ))}
            </CategoryList>
          </DocSidebar>
          
          <MainContent theme={theme}>
            {currentContent ? (
              <>
                <ContentTitle theme={theme}>
                  {currentContent.title}
                </ContentTitle>
                <ContentText
                  theme={theme}
                  dangerouslySetInnerHTML={{ __html: currentContent.content }}
                />
              </>
            ) : (
              <ContentText theme={theme}>
                <p>No content found matching your search.</p>
              </ContentText>
            )}
          </MainContent>
        </ContentArea>
      </DocumentationContainer>
    </DashboardLayout>
  );
};

export default Documentation;
