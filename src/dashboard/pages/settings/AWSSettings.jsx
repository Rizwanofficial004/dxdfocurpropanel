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

const AWSSettings = () => {
  const { theme, isDarkMode } = useTheme();
  const settingsRef = useRef(null);
  const cardsRef = useRef([]);

  // AWS Configuration State
  const [awsConfig, setAwsConfig] = useState({
    access_key_id: '',
    secret_access_key: '',
    region: 'us-east-1',
    s3_bucket_name: '',
    s3_folder_path: '',
    cloudfront_domain: '',
    ses_sender_email: '',
    lambda_function_name: '',
    enable_s3_encryption: true,
    enable_versioning: false
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

  const updateAwsConfig = (field, value) => {
    setAwsConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveAwsConfig = async () => {
    setSavingConfig(true);
    try {
      setMessage('✅ AWS configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving AWS config:', error);
      setMessage('❌ Failed to save AWS configuration');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <DashboardLayout headerTitle="AWS Settings" headerBreadcrumb="Settings › AWS">
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>☁️ AWS Configuration</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              Configure Amazon Web Services integration and cloud resources
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
            <SectionTitle isDarkMode={isDarkMode}>☁️ AWS Services Configuration</SectionTitle>
            
            <ConfigCard isDarkMode={isDarkMode} index={0}>
              <ConfigHeader>
                <ConfigInfo>
                  <ConfigName isDarkMode={isDarkMode}>AWS Configuration</ConfigName>
                  <ConfigDescription isDarkMode={isDarkMode}>
                    Configure AWS credentials and service settings for S3, SES, Lambda, and more
                  </ConfigDescription>
                </ConfigInfo>
              </ConfigHeader>

              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🔑 AWS Credentials</h4>
              </div>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Access Key ID</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={awsConfig.access_key_id}
                    onChange={(e) => updateAwsConfig('access_key_id', e.target.value)}
                    placeholder="AKIA..."
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Secret Access Key</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="password"
                    value={awsConfig.secret_access_key}
                    onChange={(e) => updateAwsConfig('secret_access_key', e.target.value)}
                    placeholder="Enter secret key"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>AWS Region</Label>
                  <select 
                    value={awsConfig.region}
                    onChange={(e) => updateAwsConfig('region', e.target.value)}
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
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                  </select>
                </FormField>
              </FormGrid>

              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🪣 S3 Configuration</h4>
              </div>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>S3 Bucket Name</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={awsConfig.s3_bucket_name}
                    onChange={(e) => updateAwsConfig('s3_bucket_name', e.target.value)}
                    placeholder="my-app-bucket"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>S3 Folder Path</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={awsConfig.s3_folder_path}
                    onChange={(e) => updateAwsConfig('s3_folder_path', e.target.value)}
                    placeholder="uploads/"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>CloudFront Domain (Optional)</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={awsConfig.cloudfront_domain}
                    onChange={(e) => updateAwsConfig('cloudfront_domain', e.target.value)}
                    placeholder="d1234567890.cloudfront.net"
                  />
                </FormField>
              </FormGrid>

              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>📧 SES & Lambda Configuration</h4>
              </div>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>SES Sender Email</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={awsConfig.ses_sender_email}
                    onChange={(e) => updateAwsConfig('ses_sender_email', e.target.value)}
                    placeholder="noreply@yourapp.com"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Lambda Function Name</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={awsConfig.lambda_function_name}
                    onChange={(e) => updateAwsConfig('lambda_function_name', e.target.value)}
                    placeholder="my-lambda-function"
                  />
                </FormField>
              </FormGrid>

              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>⚙️ Additional Settings</h4>
              </div>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>S3 Security Settings</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
                      <input
                        type="checkbox"
                        checked={awsConfig.enable_s3_encryption}
                        onChange={(e) => updateAwsConfig('enable_s3_encryption', e.target.checked)}
                      />
                      Enable S3 Encryption
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
                      <input
                        type="checkbox"
                        checked={awsConfig.enable_versioning}
                        onChange={(e) => updateAwsConfig('enable_versioning', e.target.checked)}
                      />
                      Enable S3 Versioning
                    </label>
                  </div>
                </FormField>
              </FormGrid>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={saveAwsConfig}
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

export default AWSSettings;
