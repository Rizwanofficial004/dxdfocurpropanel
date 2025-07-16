import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';

const SettingsContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: 0;
`;

const TopSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Breadcrumb = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.875rem;
  
  span {
    margin: 0 0.5rem;
  }
  
  .active {
    color: ${props => props.theme.colors.text.primary};
    font-weight: 500;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.hover};
  }
  
  &.primary {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
    
    &:hover {
      background: ${props => props.theme.colors.primary}dd;
    }
  }
`;

const ContentContainer = styled.div`
  // max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1rem;
`;

const TabsContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  gap: 2rem;
`;

const Tab = styled.button`
  padding: 1rem 0;
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
`;

const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  padding: 2rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr auto;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text.primary};
  font-size: 0.875rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.light};
  }
`;

const EditButton = styled.button`
  color: ${props => props.theme.colors.primary};
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: ${props => props.theme.colors.success};
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
`;

const ProfileImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: ${props => props.theme.colors.text.secondary};
  margin-right: 1rem;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

const CardTitle = styled.h4`
  color: ${props => props.theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 44px;
  height: 24px;
  background: ${props => props.checked ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const Settings = () => {
  const [activeTab, setActiveTab] = useState('ui');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { theme } = useTheme(); // Add theme hook

  const tabs = [
    { id: 'ui', label: 'UI Settings' },
    { id: 'credentials', label: 'Credentials' }
  ];

  // Function to send data to settings API
  async function sendSettingsData(endpoint, data) {
    setLoading(true);
    setMessage('');
    
    // Log the API call for testing
    console.log(`🚀 API Call - Endpoint: ${endpoint}`);
    console.log(`📤 Request Data:`, data);
    console.log(`🌐 Full URL: https://dxdtime.ddsolutions.io/api/settings/${endpoint}/`);
    
    try {
      const response = await fetch(`https://dxdtime.ddsolutions.io/api/settings/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      // Log response details
      console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
      console.log(`📡 Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log(`📥 Response Data:`, result);
      
      if (result.success) {
        setMessage('✅ Settings saved successfully!');
        console.log(`✅ API Success - ${endpoint}:`, result.data);
        return result.data;
      } else {
        setMessage('❌ Error saving settings: ' + result.message);
        console.error(`❌ API Error - ${endpoint}:`, result);
        return null;
      }
    } catch (error) {
      setMessage('❌ Network error: ' + error.message);
      console.error(`🚨 Network Error - ${endpoint}:`, {
        message: error.message,
        stack: error.stack,
        endpoint: endpoint,
        data: data
      });
      return null;
    } finally {
      setLoading(false);
    }
  }

  const renderUISettings = () => (
    <Section>
      <SectionTitle>🎨 Theme Settings</SectionTitle>
      <p style={{ color: theme.colors.text.secondary, marginBottom: '2rem' }}>Customize the appearance and layout of your dashboard.</p>
      
      <form id="themeSettingsForm" onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const themeData = {
          setting_name: formData.get('settingName'),
          font_family: formData.get('fontFamily'),
          font_size: formData.get('fontSize'),
          primary_color: formData.get('primaryColor'),
          secondary_color: formData.get('secondaryColor'),
          background_color: formData.get('backgroundColor'),
          text_color: formData.get('textColor'),
          theme_mode: formData.get('themeMode'),
          sidebar_collapsed: formData.has('sidebarCollapsed'),
          is_global: formData.has('isGlobal'),
          user_id: null
        };
        
        await sendSettingsData('ui', themeData);
      }}>
        
        <FormRow>
          <Label>Setting Name:</Label>
          <Input type="text" name="settingName" defaultValue="dashboard_theme" required />
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Font Family:</Label>
          <select name="fontFamily" style={{ 
            padding: '0.75rem', 
            border: `1px solid ${theme.colors.border}`, 
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            width: '100%',
            background: theme.colors.surface,
            color: theme.colors.text.primary
          }}>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Open Sans, sans-serif">Open Sans</option>
            <option value="Lato, sans-serif">Lato</option>
            <option value="Montserrat, sans-serif">Montserrat</option>
          </select>
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Font Size:</Label>
          <select name="fontSize" style={{ 
            padding: '0.75rem', 
            border: `1px solid ${theme.colors.border}`, 
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            width: '100%',
            background: theme.colors.surface,
            color: theme.colors.text.primary
          }}>
            <option value="12px">12px (Extra Small)</option>
            <option value="14px">14px (Small)</option>
            <option value="16px">16px (Medium)</option>
            <option value="18px">18px (Large)</option>
            <option value="20px">20px (Extra Large)</option>
            <option value="24px">24px (XXL)</option>
          </select>
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Primary Color:</Label>
          <input 
            type="color" 
            name="primaryColor" 
            defaultValue="#3498db"
            style={{ 
              width: '80px', 
              height: '40px', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer' 
            }}
          />
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Secondary Color:</Label>
          <input 
            type="color" 
            name="secondaryColor" 
            defaultValue="#2ecc71"
            style={{ 
              width: '80px', 
              height: '40px', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer' 
            }}
          />
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Background Color:</Label>
          <input 
            type="color" 
            name="backgroundColor" 
            defaultValue="#ffffff"
            style={{ 
              width: '80px', 
              height: '40px', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer' 
            }}
          />
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Text Color:</Label>
          <input 
            type="color" 
            name="textColor" 
            defaultValue="#2c3e50"
            style={{ 
              width: '80px', 
              height: '40px', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer' 
            }}
          />
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Theme Mode:</Label>
          <select name="themeMode" style={{ 
            padding: '0.75rem', 
            border: `1px solid ${theme.colors.border}`, 
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            width: '100%',
            background: theme.colors.surface,
            color: theme.colors.text.primary
          }}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <div></div>
        </FormRow>

        <FormRow>
          <Label>Options:</Label>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: theme.colors.text.primary }}>
              <input type="checkbox" name="sidebarCollapsed" style={{ marginRight: '0.5rem' }} />
              Collapse Sidebar
            </label>
            <label style={{ display: 'flex', alignItems: 'center', color: theme.colors.text.primary }}>
              <input type="checkbox" name="isGlobal" defaultChecked style={{ marginRight: '0.5rem' }} />
              Apply Globally
            </label>
          </div>
          <div></div>
        </FormRow>

        <div style={{ marginTop: '2rem' }}>
          <ActionButton 
            type="submit" 
            className="primary" 
            disabled={loading}
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
          >
            {loading ? '⏳ Saving...' : '💾 Save Theme Settings'}
          </ActionButton>
        </div>
      </form>
    </Section>
  );

  const renderCredentialsSettings = () => (
    <div>
      {/* OpenAI Configuration Section */}
      <Section>
        <SectionTitle>🔐 OpenAI Configuration</SectionTitle>
        <p style={{ color: theme.colors.text.secondary, marginBottom: '2rem' }}>Configure OpenAI API settings for AI-powered features.</p>
        
        <form id="openaiCredentialsForm" onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          
          const credentialData = {
            name: formData.get('credentialName'),
            credential_type: 'openai',
            description: formData.get('credentialDescription'),
            api_key: formData.get('apiKey'),
            is_active: formData.has('isActive'),
            is_production: formData.has('isProduction'),
            additional_config: {
              model: formData.get('aiModel'),
              max_tokens: parseInt(formData.get('maxTokens')),
              temperature: parseFloat(formData.get('temperature'))
            }
          };
          
          const result = await sendSettingsData('credentials', credentialData);
          if (result) {
            e.target.reset(); // Clear form on success
          }
        }}>
          
          <FormRow>
            <Label>Configuration Name:</Label>
            <Input type="text" name="credentialName" defaultValue="openai_production" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Description:</Label>
            <Input type="text" name="credentialDescription" defaultValue="Main OpenAI API for dashboard" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>API Key:</Label>
            <Input type="password" name="apiKey" placeholder="sk-..." required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>AI Model:</Label>
            <select name="aiModel" style={{ 
              padding: '0.75rem', 
              border: `1px solid ${theme.colors.border}`, 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              width: '100%',
              background: theme.colors.surface,
              color: theme.colors.text.primary
            }}>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Max Tokens:</Label>
            <Input type="number" name="maxTokens" defaultValue="4000" min="1" max="32000" />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Temperature:</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="range" 
                name="temperature" 
                min="0" 
                max="2" 
                step="0.1" 
                defaultValue="0.7"
                style={{ flex: 1 }}
                onChange={(e) => {
                  document.getElementById('tempValue').textContent = e.target.value;
                }}
              />
              <span id="tempValue" style={{ minWidth: '3rem', fontWeight: '500', color: theme.colors.text.primary }}>0.7</span>
            </div>
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Status:</Label>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', color: theme.colors.text.primary }}>
                <input type="checkbox" name="isActive" defaultChecked style={{ marginRight: '0.5rem' }} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', color: theme.colors.text.primary }}>
                <input type="checkbox" name="isProduction" style={{ marginRight: '0.5rem' }} />
                Production Environment
              </label>
            </div>
            <div></div>
          </FormRow>

          <div style={{ marginTop: '2rem' }}>
            <ActionButton 
              type="submit" 
              className="primary" 
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
            >
              {loading ? '⏳ Saving...' : '🔑 Save OpenAI Credentials'}
            </ActionButton>
          </div>
        </form>
      </Section>

      {/* Database Configuration Section */}
      <Section>
        <SectionTitle>🗄️ Database Configuration</SectionTitle>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Configure database connection settings for data storage.</p>
        
        <form id="databaseCredentialsForm" onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          
          const credentialData = {
            name: formData.get('dbName'),
            credential_type: 'database',
            description: formData.get('dbDescription'),
            is_active: formData.has('dbIsActive'),
            is_production: formData.has('dbIsProduction'),
            additional_config: {
              host: formData.get('dbHost'),
              port: parseInt(formData.get('dbPort')),
              database: formData.get('dbDatabase'),
              username: formData.get('dbUsername'),
              password: formData.get('dbPassword'),
              ssl_mode: formData.get('dbSslMode'),
              connection_timeout: parseInt(formData.get('dbTimeout'))
            }
          };
          
          const result = await sendSettingsData('credentials', credentialData);
          if (result) {
            e.target.reset(); // Clear form on success
          }
        }}>
          
          <FormRow>
            <Label>Configuration Name:</Label>
            <Input type="text" name="dbName" defaultValue="main_database" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Description:</Label>
            <Input type="text" name="dbDescription" defaultValue="Main application database" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Host:</Label>
            <Input type="text" name="dbHost" placeholder="localhost or database URL" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Port:</Label>
            <Input type="number" name="dbPort" defaultValue="5432" min="1" max="65535" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Database Name:</Label>
            <Input type="text" name="dbDatabase" placeholder="database_name" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Username:</Label>
            <Input type="text" name="dbUsername" placeholder="db_user" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Password:</Label>
            <Input type="password" name="dbPassword" placeholder="••••••••" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>SSL Mode:</Label>
            <select name="dbSslMode" style={{ 
              padding: '0.75rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              width: '100%'
            }}>
              <option value="disable">Disable</option>
              <option value="allow">Allow</option>
              <option value="prefer">Prefer</option>
              <option value="require">Require</option>
              <option value="verify-ca">Verify CA</option>
              <option value="verify-full">Verify Full</option>
            </select>
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Connection Timeout:</Label>
            <Input type="number" name="dbTimeout" defaultValue="30" min="5" max="300" />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>seconds</span>
          </FormRow>

          <FormRow>
            <Label>Status:</Label>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="checkbox" name="dbIsActive" defaultChecked style={{ marginRight: '0.5rem' }} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" name="dbIsProduction" style={{ marginRight: '0.5rem' }} />
                Production Environment
              </label>
            </div>
            <div></div>
          </FormRow>

          <div style={{ marginTop: '2rem' }}>
            <ActionButton 
              type="submit" 
              className="primary" 
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
            >
              {loading ? '⏳ Saving...' : '🗄️ Save Database Credentials'}
            </ActionButton>
          </div>
        </form>
      </Section>

      {/* AWS Configuration Section */}
      <Section>
        <SectionTitle>☁️ AWS Configuration</SectionTitle>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Configure AWS credentials for cloud storage and services.</p>
        
        <form id="awsCredentialsForm" onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          
          const credentialData = {
            name: formData.get('awsName'),
            credential_type: 'aws',
            description: formData.get('awsDescription'),
            is_active: formData.has('awsIsActive'),
            is_production: formData.has('awsIsProduction'),
            additional_config: {
              access_key_id: formData.get('awsAccessKey'),
              secret_access_key: formData.get('awsSecretKey'),
              region: formData.get('awsRegion'),
              storage_bucket_name: formData.get('awsBucket'),
              default_acl: formData.get('awsAcl'),
              custom_domain: formData.get('awsCustomDomain')
            }
          };
          
          const result = await sendSettingsData('credentials', credentialData);
          if (result) {
            e.target.reset(); // Clear form on success
          }
        }}>
          
          <FormRow>
            <Label>Configuration Name:</Label>
            <Input type="text" name="awsName" defaultValue="aws_storage" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Description:</Label>
            <Input type="text" name="awsDescription" defaultValue="AWS S3 storage configuration" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Access Key ID:</Label>
            <Input type="text" name="awsAccessKey" placeholder="AKIARSU6EUUWMQ5I2JWC" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Secret Access Key:</Label>
            <Input type="password" name="awsSecretKey" placeholder="sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Region:</Label>
            <select name="awsRegion" style={{ 
              padding: '0.75rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              width: '100%'
            }}>
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-east-2">US East (Ohio)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="eu-west-2">EU (London)</option>
              <option value="eu-west-3">EU (Paris)</option>
              <option value="eu-central-1">EU (Frankfurt)</option>
              <option value="eu-north-1" selected>EU (Stockholm)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
              <option value="ap-south-1">Asia Pacific (Mumbai)</option>
            </select>
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Storage Bucket Name:</Label>
            <Input type="text" name="awsBucket" placeholder="ddsfocustime" required />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Default ACL:</Label>
            <select name="awsAcl" style={{ 
              padding: '0.75rem', 
              border: '1px solid #d1d5db', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              width: '100%'
            }}>
              <option value="private">Private</option>
              <option value="public-read">Public Read</option>
              <option value="public-read-write">Public Read Write</option>
              <option value="authenticated-read">Authenticated Read</option>
            </select>
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Custom Domain:</Label>
            <Input type="url" name="awsCustomDomain" placeholder="https://cdn.yourdomain.com (optional)" />
            <div></div>
          </FormRow>

          <FormRow>
            <Label>Status:</Label>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="checkbox" name="awsIsActive" defaultChecked style={{ marginRight: '0.5rem' }} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" name="awsIsProduction" style={{ marginRight: '0.5rem' }} />
                Production Environment
              </label>
            </div>
            <div></div>
          </FormRow>

          <div style={{ marginTop: '2rem' }}>
            <ActionButton 
              type="submit" 
              className="primary" 
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
            >
              {loading ? '⏳ Saving...' : '☁️ Save AWS Credentials'}
            </ActionButton>
          </div>
        </form>
      </Section>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ui':
        return renderUISettings();
      case 'credentials':
        return renderCredentialsSettings();
      default:
        return renderUISettings();
    }
  };

  return (
    <DashboardLayout headerTitle="User Profile" headerBreadcrumb="Settings › User Profile">
      <SettingsContainer>
        <ContentContainer>
          <Header>
            <PageTitle>Settings Management</PageTitle>
            <PageSubtitle>Configure UI themes and manage API credentials</PageSubtitle>
          </Header>

          {message && (
            <div style={{
              padding: '1rem',
              marginBottom: '2rem',
              borderRadius: '0.5rem',
              background: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
              color: message.includes('✅') ? '#166534' : '#dc2626'
            }}>
              {message}
            </div>
          )}

          <TabsContainer>
            <TabsList>
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabsList>
          </TabsContainer>

          <ContentGrid>
            <MainContent>
              {renderTabContent()}
            </MainContent>

            <RightSidebar>
              <Card>
                <CardTitle>API Configuration</CardTitle>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Settings API Integration
                </p>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  All settings are saved to the backend API and applied in real-time.
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  <p><strong>Base URL:</strong> https://dxdtime.ddsolutions.io/api/</p>
                  <p><strong>UI Endpoint:</strong> /api/settings/ui/</p>
                  <p><strong>Credentials:</strong> /api/settings/credentials/</p>
                </div>
              </Card>

              <Card>
                <CardTitle>Settings Categories</CardTitle>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ color: '#3b82f6' }}>🎨</span>
                    <strong style={{ marginLeft: '0.5rem' }}>UI Settings</strong>
                    <p style={{ fontSize: '0.75rem', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                      Themes, colors, fonts, layout preferences
                    </p>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ color: '#10b981' }}>🔐</span>
                    <strong style={{ marginLeft: '0.5rem' }}>OpenAI</strong>
                    <p style={{ fontSize: '0.75rem', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                      API keys, models, temperature, tokens
                    </p>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ color: '#f59e0b' }}>🗄️</span>
                    <strong style={{ marginLeft: '0.5rem' }}>Database</strong>
                    <p style={{ fontSize: '0.75rem', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                      Connection strings, SSL, timeouts
                    </p>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#8b5cf6' }}>☁️</span>
                    <strong style={{ marginLeft: '0.5rem' }}>AWS</strong>
                    <p style={{ fontSize: '0.75rem', marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                      S3 storage, access keys, regions, buckets
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <CardTitle>Status Monitor</CardTitle>
                <div style={{ fontSize: '0.875rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.5rem',
                    background: '#f0fdf4',
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#10b981' }}>●</span>
                    <span style={{ marginLeft: '0.5rem', color: '#166534' }}>API Connected</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.5rem',
                    background: '#f8fafc',
                    borderRadius: '0.5rem'
                  }}>
                    <span style={{ color: '#64748b' }}>●</span>
                    <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>Ready for Configuration</span>
                  </div>
                </div>
              </Card>
            </RightSidebar>
          </ContentGrid>
        </ContentContainer>
      </SettingsContainer>
    </DashboardLayout>
  );
};

export default Settings;
