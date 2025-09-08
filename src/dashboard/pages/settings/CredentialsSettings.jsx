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
    credential_name: 'Complete Production Setup',
    credential_type: 'general',
    description: 'All production services configuration',
    aws_access_key_id: 'AKIATEST123456789012',
    aws_secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY',
    aws_region: 'us-west-2',
    aws_bucket_name: 'company-production-bucket',
    db_host: 'prod-db.company.com',
    db_port: '5432',
    db_name: 'main_app_db',
    db_username: 'db_admin',
    db_password: 'extremely_secure_password_2025',
    db_type: 'postgresql',
    openai_api_key: 'sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    openai_organization: 'org-company123456789',
    environment: 'production',
    is_active: true,
    is_default: true
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [fetchingConfig, setFetchingConfig] = useState(false);
  const [message, setMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState({});

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

  // Dynamic update function with change tracking
  const updateCredentialsConfig = (field, value) => {
    setCredentialsConfig(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Check if there are changes from original
      const hasChanges = JSON.stringify(updated) !== JSON.stringify(originalConfig);
      setHasChanges(hasChanges);
      
      return updated;
    });
  };

  // Auto-generate credential name based on inputs
  const generateCredentialName = () => {
    const env = credentialsConfig.environment;
    const timestamp = new Date().toISOString().split('T')[0];
    return `${env.charAt(0).toUpperCase() + env.slice(1)} Config - ${timestamp}`;
  };

  // Auto-update credential name when environment changes
  useEffect(() => {
    if (credentialsConfig.environment && !credentialsConfig.credential_name.includes('Config -')) {
      updateCredentialsConfig('credential_name', generateCredentialName());
    }
  }, [credentialsConfig.environment]);

  // Save credentials configuration to database
  const saveCredentialsConfig = async () => {
    setSavingConfig(true);
    setMessage('💾 Saving credentials to database...');
    
    try {
      // Prepare data for API - ensure all required fields are present
      const dataToSave = {
        credential_name: credentialsConfig.credential_name || 'Complete Production Setup',
        credential_type: credentialsConfig.credential_type || 'general',
        description: credentialsConfig.description || 'All production services configuration',
        aws_access_key_id: credentialsConfig.aws_access_key_id || '',
        aws_secret_access_key: credentialsConfig.aws_secret_access_key || '',
        aws_region: credentialsConfig.aws_region || 'us-west-2',
        aws_bucket_name: credentialsConfig.aws_bucket_name || '',
        db_host: credentialsConfig.db_host || '',
        db_port: credentialsConfig.db_port || '5432',
        db_name: credentialsConfig.db_name || '',
        db_username: credentialsConfig.db_username || '',
        db_password: credentialsConfig.db_password || '',
        db_type: credentialsConfig.db_type || 'postgresql',
        openai_api_key: credentialsConfig.openai_api_key || '',
        openai_organization: credentialsConfig.openai_organization || '',
        environment: credentialsConfig.environment || 'production',
        is_active: credentialsConfig.is_active !== undefined ? credentialsConfig.is_active : true,
        is_default: credentialsConfig.is_default !== undefined ? credentialsConfig.is_default : true
      };

      console.log('Saving credentials:', dataToSave);

      // API call to save credentials using the live endpoint
      const response = await fetch('https://dxdtime.ddsolutions.io/api/set-all-credentials/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (response.ok) {
        setMessage('✅ Credentials saved successfully to database!');
        console.log('Save response:', responseData);
        
        // Update original config to reflect saved state
        setOriginalConfig({ ...dataToSave });
        setHasChanges(false);
        
        // Auto-refresh to get latest data
        setTimeout(() => {
          fetchCredentialsConfig();
        }, 1000);
        
        setTimeout(() => setMessage(''), 4000);
      } else {
        // Enhanced error handling with detailed response
        console.error('API Error Response:', responseData);
        let errorMessage = 'Failed to save credentials';
        
        if (responseData.errors) {
          // Handle validation errors
          const errorDetails = Object.entries(responseData.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
          errorMessage = `Validation errors: ${errorDetails}`;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      setMessage(`❌ Failed to save to database: ${error.message}`);
      setTimeout(() => setMessage(''), 8000);
    } finally {
      setSavingConfig(false);
    }
  };

  // Determine credential type based on filled fields
  const determineCredentialType = (config) => {
    if (config.aws_access_key_id || config.aws_secret_access_key) {
      return 'aws';
    } else if (config.db_host || config.db_name) {
      return 'database';
    } else if (config.openai_api_key) {
      return 'openai';
    } else {
      return 'general';
    }
  };

  // Fetch current credentials configuration from database
  const fetchCredentialsConfig = async () => {
    setFetchingConfig(true);
    setMessage('🔄 Loading credentials from database...');
    
    try {
      // API call to fetch credentials using the live endpoint
      const response = await fetch('https://dxdtime.ddsolutions.io/api/get-all-credentials/');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.credential_configurations && data.data.credential_configurations.length > 0) {
          // Get the most recent/active configuration
          const latestConfig = data.data.credential_configurations[0];
          
          const loadedConfig = {
            credential_name: latestConfig.credential_name || generateCredentialName(),
            credential_type: latestConfig.credential_type || 'general',
            description: latestConfig.description || 'All production services configuration',
            aws_access_key_id: latestConfig.aws_access_key_id || '',
            aws_secret_access_key: latestConfig.aws_secret_access_key || '',
            aws_region: latestConfig.aws_region || 'us-west-2',
            aws_bucket_name: latestConfig.aws_bucket_name || '',
            db_host: latestConfig.db_host || '',
            db_port: latestConfig.db_port || '5432',
            db_name: latestConfig.db_name || '',
            db_username: latestConfig.db_username || '',
            db_password: latestConfig.db_password || '',
            db_type: latestConfig.db_type || 'postgresql',
            openai_api_key: latestConfig.openai_api_key || '',
            openai_organization: latestConfig.openai_organization || '',
            environment: latestConfig.environment || 'production',
            is_active: latestConfig.is_active !== undefined ? latestConfig.is_active : true,
            is_default: latestConfig.is_default !== undefined ? latestConfig.is_default : true
          };
          
          setCredentialsConfig(loadedConfig);
          setOriginalConfig({ ...loadedConfig });
          setHasChanges(false);
          setMessage('✅ Credentials loaded from database!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('📝 No existing credentials found. Ready for new configuration.');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setMessage('❌ Failed to load credentials from database');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setFetchingConfig(false);
    }
  };

  // Reset to original values
  const resetCredentialsConfig = () => {
    setCredentialsConfig({ ...originalConfig });
    setHasChanges(false);
    setMessage('🔄 Reset to saved values');
    setTimeout(() => setMessage(''), 2000);
  };

  // Clear all fields
  const clearAllFields = () => {
    const emptyConfig = {
      credential_name: generateCredentialName(),
      credential_type: 'general',
      description: 'All production services configuration',
      aws_access_key_id: '',
      aws_secret_access_key: '',
      aws_region: 'us-west-2',
      aws_bucket_name: '',
      db_host: '',
      db_port: '5432',
      db_name: '',
      db_username: '',
      db_password: '',
      db_type: 'postgresql',
      openai_api_key: '',
      openai_organization: '',
      environment: 'production',
      is_active: true,
      is_default: true
    };
    setCredentialsConfig(emptyConfig);
    setHasChanges(true);
    setMessage('🗑️ All fields cleared');
    setTimeout(() => setMessage(''), 2000);
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
              Configure API keys and sensitive credentials for your application. Changes are saved to the database in real-time.
            </SettingsSubtitle>
          </SettingsHeader>

          {/* Add CSS for pulse animation */}
          <style jsx>{`
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
              }
              50% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
              }
            }
          `}</style>

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

              {/* Configuration Info */}
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Configuration Name</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.credential_name}
                    onChange={(e) => updateCredentialsConfig('credential_name', e.target.value)}
                    placeholder="Production Configuration"
                    style={{
                      borderColor: credentialsConfig.credential_name ? '#10b981' : undefined
                    }}
                  />
                  <small style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                    Current: {credentialsConfig.credential_name || 'Not set'}
                  </small>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Environment</Label>
                  <select 
                    value={credentialsConfig.environment}
                    onChange={(e) => updateCredentialsConfig('environment', e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `2px solid ${credentialsConfig.environment ? '#10b981' : (isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)')}`,
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      width: '100%'
                    }}
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                  <small style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                    Selected: {credentialsConfig.environment}
                  </small>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Description</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.description}
                    onChange={(e) => updateCredentialsConfig('description', e.target.value)}
                    placeholder="All production services configuration"
                    style={{
                      borderColor: credentialsConfig.description ? '#10b981' : undefined
                    }}
                  />
                  <small style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                    Length: {credentialsConfig.description.length} characters
                  </small>
                </FormField>
              </FormGrid>

              {/* OpenAI Configuration */}
              <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🤖 OpenAI Configuration</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>OpenAI API Key</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.openai_api_key}
                    onChange={(e) => updateCredentialsConfig('openai_api_key', e.target.value)}
                    placeholder="sk-proj-..."
                    style={{
                      borderColor: credentialsConfig.openai_api_key ? '#10b981' : undefined
                    }}
                  />
                  <small style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                    Status: {credentialsConfig.openai_api_key ? '✅ Set' : '❌ Not set'}
                  </small>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>OpenAI Organization</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.openai_organization}
                    onChange={(e) => updateCredentialsConfig('openai_organization', e.target.value)}
                    placeholder="org-..."
                    style={{
                      borderColor: credentialsConfig.openai_organization ? '#10b981' : undefined
                    }}
                  />
                  <small style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                    Organization: {credentialsConfig.openai_organization || 'Not specified'}
                  </small>
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
                    value={credentialsConfig.aws_access_key_id}
                    onChange={(e) => updateCredentialsConfig('aws_access_key_id', e.target.value)}
                    placeholder="AKIA..."
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>AWS Secret Access Key</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.aws_secret_access_key}
                    onChange={(e) => updateCredentialsConfig('aws_secret_access_key', e.target.value)}
                    placeholder="Enter secret key"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
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
                <FormField>
                  <Label isDarkMode={isDarkMode}>AWS Bucket Name</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.aws_bucket_name}
                    onChange={(e) => updateCredentialsConfig('aws_bucket_name', e.target.value)}
                    placeholder="my-production-bucket"
                  />
                </FormField>
              </FormGrid>

              {/* Database Configuration */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🗄️ Database Configuration</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Host</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.db_host}
                    onChange={(e) => updateCredentialsConfig('db_host', e.target.value)}
                    placeholder="prod-db.company.com"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Port</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.db_port}
                    onChange={(e) => updateCredentialsConfig('db_port', e.target.value)}
                    placeholder="5432"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Name</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.db_name}
                    onChange={(e) => updateCredentialsConfig('db_name', e.target.value)}
                    placeholder="main_app_db"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Type</Label>
                  <select 
                    value={credentialsConfig.db_type}
                    onChange={(e) => updateCredentialsConfig('db_type', e.target.value)}
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
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Username</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.db_username}
                    onChange={(e) => updateCredentialsConfig('db_username', e.target.value)}
                    placeholder="db_admin"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Password</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={credentialsConfig.db_password}
                    onChange={(e) => updateCredentialsConfig('db_password', e.target.value)}
                    placeholder="Enter database password"
                  />
                </FormField>
              </FormGrid>

              {/* Action Buttons */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="outline"
                    isDarkMode={isDarkMode}
                    onClick={clearAllFields}
                    disabled={savingConfig || fetchingConfig}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    🗑️ Clear All
                  </Button>
                  <Button
                    variant="outline"
                    isDarkMode={isDarkMode}
                    onClick={resetCredentialsConfig}
                    disabled={savingConfig || fetchingConfig || !hasChanges}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    {fetchingConfig ? '🔄 Loading...' : '↶ Reset'}
                  </Button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {hasChanges && (
                    <small style={{ 
                      color: '#f59e0b', 
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      ⚠️ Unsaved changes
                    </small>
                  )}
                  
                  <Button
                    variant="primary"
                    isDarkMode={isDarkMode}
                    onClick={saveCredentialsConfig}
                    disabled={savingConfig || fetchingConfig}
                    style={{ 
                      fontSize: '1rem', 
                      padding: '0.75rem 2rem',
                      background: hasChanges ? '#10b981' : undefined,
                      animation: hasChanges ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {savingConfig ? '💾 Saving to Database...' : hasChanges ? '💾 Save Changes to Database' : '💾 Save Credentials'}
                  </Button>
                </div>
              </div>

              {/* Status Display */}
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.5)',
                borderRadius: '0.5rem',
                border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)'}`,
                fontSize: '0.875rem'
              }}>
                <div style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', fontWeight: '600', marginBottom: '0.5rem' }}>
                  📊 Configuration Status:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <div>🤖 OpenAI: {credentialsConfig.openai_api_key ? '✅ Configured' : '❌ Not set'}</div>
                  <div>☁️ AWS: {credentialsConfig.aws_access_key_id ? '✅ Configured' : '❌ Not set'}</div>
                  <div>🗄️ Database: {credentialsConfig.db_host ? '✅ Configured' : '❌ Not set'}</div>
                  <div>💾 Changes: {hasChanges ? '⚠️ Unsaved' : '✅ Saved'}</div>
                </div>
              </div>
            </ConfigCard>
          </Section>
        </SettingsContainer>
      </SettingsWrapper>
    </DashboardLayout>
  );
};

export default CredentialsSettings;
