import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { gsap } from 'gsap';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  SettingsWrapper,
  SettingsContainer,
  SettingsHeader,
  SettingsTitle,
  SettingsSubtitle,
  Section,
  SectionTitle,
  ConfigCard,
  ConfigHeader,
  ConfigInfo,
  ConfigName,
  ConfigDescription,
  FormGrid,
  FormField,
  Label,
  Input,
  MessageBox,
  ConfigButton as Button
} from '../../components/settings/Settings.styles';

const CredentialsSettings = () => {
  const { theme, isDarkMode } = useTheme();
  const settingsRef = useRef(null);
  const cardsRef = useRef([]);

  // Credentials Configuration State
  const [credentialsConfig, setCredentialsConfig] = useState({
    openai_api_key: '',
    aws_access_key: '',
    aws_secret_key: '',
    aws_region: 'us-east-1',
    database_url: '',
    smtp_server: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: ''
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [fetchingConfig, setFetchingConfig] = useState(false);
  const [message, setMessage] = useState('');

  // Animation setup
  useEffect(() => {
    if (settingsRef.current) {
      gsap.fromTo(settingsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Animate cards
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(card,
            {
              opacity: 0,
              y: 50,
              rotationX: 45,
              scale: 0.8,
              transformPerspective: 1000
            },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              scale: 1,
              duration: 0.8,
              delay: 0.2 + (0.1 * index),
              ease: "power3.out"
            }
          );
        }
      });
    }
  }, []);

  // Dynamic update function
  const updateCredentialsConfig = (field, value) => {
    setCredentialsConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save credentials configuration
  const saveCredentialsConfig = async () => {
    setSavingConfig(true);
    try {
      // API call to save credentials (replace with actual endpoint)
      const response = await fetch('https://dxdtime.ddsolutions.io/api/credentials/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialsConfig)
      });

      if (response.ok) {
        setMessage('✅ Credentials saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      setMessage('❌ Failed to save credentials');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  // Fetch current credentials configuration
  const fetchCredentialsConfig = async () => {
    setFetchingConfig(true);
    try {
      // API call to fetch credentials (replace with actual endpoint)
      const response = await fetch('https://dxdtime.ddsolutions.io/api/credentials/');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          setCredentialsConfig(data.data);
          setMessage('✅ Credentials loaded successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setMessage('❌ Failed to load credentials');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setFetchingConfig(false);
    }
  };

  // Load configuration on component mount
  useEffect(() => {
    fetchCredentialsConfig();
  }, []);

  return (
    <DashboardLayout headerTitle="Credentials Settings" headerBreadcrumb="Settings › Credentials">
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>🔐 Credentials & API Keys</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              Configure API keys and sensitive credentials for your application
            </SettingsSubtitle>
          </SettingsHeader>

          {message && (
            <MessageBox 
              type={message.includes('✅') ? 'success' : 'error'}
              isDarkMode={isDarkMode}
            >
              {message}
            </MessageBox>
          )}

          <Section isDarkMode={isDarkMode} index={0} ref={el => cardsRef.current[0] = el}>
            <SectionTitle isDarkMode={isDarkMode}>🔐 API Credentials Configuration</SectionTitle>
            
            <ConfigCard isDarkMode={isDarkMode} index={0}>
              <ConfigHeader>
                <ConfigInfo>
                  <ConfigName isDarkMode={isDarkMode}>API Keys & Credentials</ConfigName>
                  <ConfigDescription isDarkMode={isDarkMode}>
                    Manage OpenAI, AWS, database, and email service credentials securely
                  </ConfigDescription>
                </ConfigInfo>
              </ConfigHeader>

              {/* OpenAI Configuration */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🤖 OpenAI Configuration</h4>
              </div>
              
              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>OpenAI API Key</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.openai_api_key}
                    onChange={(e) => updateCredentialsConfig('openai_api_key', e.target.value)}
                    placeholder="sk-..."
                  />
                </FormField>
              </FormGrid>

              {/* AWS Configuration */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>☁️ AWS Configuration</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>AWS Access Key ID</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.aws_access_key}
                    onChange={(e) => updateCredentialsConfig('aws_access_key', e.target.value)}
                    placeholder="AKIA..."
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>AWS Secret Access Key</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.aws_secret_key}
                    onChange={(e) => updateCredentialsConfig('aws_secret_key', e.target.value)}
                    placeholder="Enter secret key"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>AWS Region</Label>
                  <select 
                    value={credentialsConfig.aws_region}
                    onChange={(e) => updateCredentialsConfig('aws_region', e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`,
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      width: '100%'
                    }}
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  </select>
                </FormField>
              </FormGrid>

              {/* Database Configuration */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🗄️ Database Configuration</h4>
              </div>
              
              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database URL</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.database_url}
                    onChange={(e) => updateCredentialsConfig('database_url', e.target.value)}
                    placeholder="postgresql://user:password@host:port/database"
                  />
                </FormField>
              </FormGrid>

              {/* Email Configuration */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>📧 Email Configuration</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>SMTP Server</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.smtp_server}
                    onChange={(e) => updateCredentialsConfig('smtp_server', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>SMTP Port</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.smtp_port}
                    onChange={(e) => updateCredentialsConfig('smtp_port', e.target.value)}
                    placeholder="587"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>SMTP Username</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.smtp_username}
                    onChange={(e) => updateCredentialsConfig('smtp_username', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>SMTP Password</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.smtp_password}
                    onChange={(e) => updateCredentialsConfig('smtp_password', e.target.value)}
                    placeholder="App password"
                  />
                </FormField>
              </FormGrid>

              {/* Action Buttons */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button
                  variant="outline"
                  isDarkMode={isDarkMode}
                  onClick={() => {
                    fetchCredentialsConfig();
                  }}
                  disabled={savingConfig || fetchingConfig}
                >
                  {fetchingConfig ? 'Loading...' : 'Reset'}
                </Button>
                <Button
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={saveCredentialsConfig}
                  disabled={savingConfig || fetchingConfig}
                >
                  {savingConfig ? 'Saving...' : 'Save Credentials'}
                </Button>
              </div>
            </ConfigCard>
          </Section>
        </SettingsContainer>
      </SettingsWrapper>
    </DashboardLayout>
  );
};

export default CredentialsSettings;
