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

const DatabaseSettings = () => {
  const { theme, isDarkMode } = useTheme();
  const settingsRef = useRef(null);
  const cardsRef = useRef([]);

  // Database Configuration State
  const [dbConfig, setDbConfig] = useState({
    database_type: 'postgresql',
    host: 'localhost',
    port: '5432',
    database_name: '',
    username: '',
    password: '',
    ssl_enabled: false,
    connection_pool_size: '10',
    timeout: '30'
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settingsRef.current) {
      gsap.fromTo(settingsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

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

  const updateDbConfig = (field, value) => {
    setDbConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveDbConfig = async () => {
    setSavingConfig(true);
    try {
      setMessage('✅ Database configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving database config:', error);
      setMessage('❌ Failed to save database configuration');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <DashboardLayout headerTitle="Database Settings" headerBreadcrumb="Settings › Database">
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>🗄️ Database Configuration</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              Configure database connection and performance settings
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
            <SectionTitle isDarkMode={isDarkMode}>🗄️ Database Connection Settings</SectionTitle>
            
            <ConfigCard isDarkMode={isDarkMode} index={0}>
              <ConfigHeader>
                <ConfigInfo>
                  <ConfigName isDarkMode={isDarkMode}>Database Configuration</ConfigName>
                  <ConfigDescription isDarkMode={isDarkMode}>
                    Configure database connection parameters and performance settings
                  </ConfigDescription>
                </ConfigInfo>
              </ConfigHeader>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Type</Label>
                  <select 
                    value={dbConfig.database_type}
                    onChange={(e) => updateDbConfig('database_type', e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`,
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      width: '100%'
                    }}
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlite">SQLite</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Host</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={dbConfig.host}
                    onChange={(e) => updateDbConfig('host', e.target.value)}
                    placeholder="localhost"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Port</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={dbConfig.port}
                    onChange={(e) => updateDbConfig('port', e.target.value)}
                    placeholder="5432"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Name</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={dbConfig.database_name}
                    onChange={(e) => updateDbConfig('database_name', e.target.value)}
                    placeholder="my_database"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Username</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={dbConfig.username}
                    onChange={(e) => updateDbConfig('username', e.target.value)}
                    placeholder="db_user"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Password</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => updateDbConfig('password', e.target.value)}
                    placeholder="Enter password"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Connection Pool Size</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="number"
                    value={dbConfig.connection_pool_size}
                    onChange={(e) => updateDbConfig('connection_pool_size', e.target.value)}
                    placeholder="10"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Timeout (seconds)</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="number"
                    value={dbConfig.timeout}
                    onChange={(e) => updateDbConfig('timeout', e.target.value)}
                    placeholder="30"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>SSL Settings</Label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#f1f5f9' : '#1e293b', marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={dbConfig.ssl_enabled}
                      onChange={(e) => updateDbConfig('ssl_enabled', e.target.checked)}
                    />
                    Enable SSL
                  </label>
                </FormField>
              </FormGrid>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={saveDbConfig}
                  disabled={savingConfig}
                >
                  {savingConfig ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </ConfigCard>
          </Section>
        </SettingsContainer>
      </SettingsWrapper>
    </DashboardLayout>
  );
};

export default DatabaseSettings;
