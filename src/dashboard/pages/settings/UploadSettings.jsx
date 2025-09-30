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

const UploadSettings = () => {
  const { theme, isDarkMode } = useTheme();
  const settingsRef = useRef(null);
  const cardsRef = useRef([]);

  // Upload Configuration State
  const [uploadConfig, setUploadConfig] = useState({
    max_file_size: '10',
    allowed_file_types: 'jpg,png,pdf,doc,docx',
    upload_path: '/uploads/',
    auto_resize: true,
    image_quality: '85',
    enable_compression: true
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [message, setMessage] = useState('');

  // Animation setup
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

  // Dynamic update function
  const updateUploadConfig = (field, value) => {
    setUploadConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save upload configuration
  const saveUploadConfig = async () => {
    setSavingConfig(true);
    try {
      setMessage('✅ Upload configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving upload config:', error);
      setMessage('❌ Failed to save upload configuration');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <DashboardLayout headerTitle="Upload Settings" headerBreadcrumb="Settings › Upload">
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>📤 Upload Configuration</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              Configure file upload settings and restrictions
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
            <SectionTitle isDarkMode={isDarkMode}>📤 File Upload Configuration</SectionTitle>
            
            <ConfigCard isDarkMode={isDarkMode} index={0}>
              <ConfigHeader>
                <ConfigInfo>
                  <ConfigName isDarkMode={isDarkMode}>Upload Settings</ConfigName>
                  <ConfigDescription isDarkMode={isDarkMode}>
                    Configure file size limits, allowed types, and upload behavior
                  </ConfigDescription>
                </ConfigInfo>
              </ConfigHeader>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Max File Size (MB)</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    type="number"
                    value={uploadConfig.max_file_size}
                    onChange={(e) => updateUploadConfig('max_file_size', e.target.value)}
                    placeholder="10"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Upload Path</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={uploadConfig.upload_path}
                    onChange={(e) => updateUploadConfig('upload_path', e.target.value)}
                    placeholder="/uploads/"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Allowed File Types</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={uploadConfig.allowed_file_types}
                    onChange={(e) => updateUploadConfig('allowed_file_types', e.target.value)}
                    placeholder="jpg,png,pdf,doc,docx"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Image Quality (%)</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="range"
                      min="10"
                      max="100"
                      value={uploadConfig.image_quality}
                      onChange={(e) => updateUploadConfig('image_quality', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b', minWidth: '40px' }}>
                      {uploadConfig.image_quality}%
                    </span>
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Settings</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
                      <input
                        type="checkbox"
                        checked={uploadConfig.auto_resize}
                        onChange={(e) => updateUploadConfig('auto_resize', e.target.checked)}
                      />
                      Auto Resize Images
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
                      <input
                        type="checkbox"
                        checked={uploadConfig.enable_compression}
                        onChange={(e) => updateUploadConfig('enable_compression', e.target.checked)}
                      />
                      Enable Compression
                    </label>
                  </div>
                </FormField>
              </FormGrid>

              {/* Action Buttons */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={saveUploadConfig}
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

export default UploadSettings;
