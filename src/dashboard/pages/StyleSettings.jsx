import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { gsap } from 'gsap';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { getApiBaseURL } from '../../config/api';
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
} from '../components/settings/Settings.styles';

const StyleSettings = () => {
  const { theme, isDarkMode } = useTheme();
  const settingsRef = useRef(null);
  const cardsRef = useRef([]);

  // Styling Configuration State
  const [stylingConfig, setStylingConfig] = useState({
    theme_name: 'My Custom Theme pagal',
    description: 'My custom styling theme',
    'header-color': '#000',
    'footer-color': '#000',
    text_color: '#000',
    background_color: '#1f2937',
    button_color: '#fff',
    'button-text_color': '#000',
    heading_font_size: '28px',
    body_font_size: '16px',
    font_family: 'Arial, sans-serif',
    border_radius: '8px'
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

  // Fetch current styling configuration
  const fetchStylingConfig = async () => {
    setFetchingConfig(true);
    try {
      const response = await fetch(`${getApiBaseURL()}/styling/global/`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          setStylingConfig({
            theme_name: data.data.theme_name || '',
            description: data.data.description || '',
            'header-color': data.data['header-color'] || '#000',
            'footer-color': data.data['footer-color'] || '#000',
            background_color: data.data.background_color || '#1f2937',
            button_color: data.data.button_color || '#fff',
            text_color: data.data.text_color || '#000',
            'button-text_color': data.data['button-text_color'] || '#000',
            heading_font_size: data.data.heading_font_size || '28px',
            body_font_size: data.data.body_font_size || '16px',
            font_family: data.data.font_family || 'Arial, sans-serif',
            border_radius: data.data.border_radius || '8px'
          });
          setMessage('✅ Styling configuration loaded successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching styling config:', error);
      setMessage('❌ Failed to load styling configuration');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setFetchingConfig(false);
    }
  };

  // Save styling configuration
  const saveStylingConfig = async () => {
    setSavingConfig(true);
    try {
      // Prepare the POST body with exact field names as specified
      const postBody = {
        theme_name: stylingConfig.theme_name,
        description: stylingConfig.description,
        "header-color": stylingConfig['header-color'],
        "footer-color": stylingConfig['footer-color'],
        text_color: stylingConfig.text_color,
        background_color: stylingConfig.background_color,
        button_color: stylingConfig.button_color,
        "button-text_color": stylingConfig['button-text_color'],
        heading_font_size: stylingConfig.heading_font_size,
        body_font_size: stylingConfig.body_font_size,
        font_family: stylingConfig.font_family,
        border_radius: stylingConfig.border_radius
      };

      console.log('🎨 Saving Styling Configuration:');
      console.log('   API URL:', `${getApiBaseURL()}/styling/global/`);
      console.log('   POST Body:', JSON.stringify(postBody, null, 2));

      const response = await fetch(`${getApiBaseURL()}/styling/global/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody)
      });

      console.log('📡 API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response Data:', data);
        if (data.status === 'success') {
          setMessage('✅ Styling configuration saved successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        const errorText = await response.text();
        console.log('❌ API Error Response:', errorText);
        throw new Error(`Failed to save configuration: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving styling config:', error);
      setMessage('❌ Failed to save styling configuration');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSavingConfig(false);
    }
  };

  // Color validation helper
  const validateColor = (color) => {
    if (!color) return '#000000';
    if (color.startsWith('#')) return color;
    return `#${color}`;
  };

  // Dynamic update function with validation
  const updateStylingConfig = (field, value) => {
    let processedValue = value;
    
    // Validate color fields
    if (field.includes('color')) {
      processedValue = validateColor(value);
    }
    
    setStylingConfig(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  // Load configuration on component mount
  useEffect(() => {
    fetchStylingConfig();
  }, []);

  return (
    <DashboardLayout headerTitle="Styling Settings" headerBreadcrumb="Settings › Styling">
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>🎨 Styling Configuration</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              Customize the global theme and styling for your application
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
            <SectionTitle isDarkMode={isDarkMode}>🎨 Global Theme Configuration</SectionTitle>
            
            <ConfigCard isDarkMode={isDarkMode} index={0}>
              <ConfigHeader>
                <ConfigInfo>
                  <ConfigName isDarkMode={isDarkMode}>Theme Settings</ConfigName>
                  <ConfigDescription isDarkMode={isDarkMode}>
                    Configure global theme colors, typography, and styling preferences
                  </ConfigDescription>
                </ConfigInfo>
              </ConfigHeader>

              {/* Basic Information */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>📋 Basic Information</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Theme Name</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={stylingConfig.theme_name}
                    onChange={(e) => updateStylingConfig('theme_name', e.target.value)}
                    placeholder="Enter theme name"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Description</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={stylingConfig.description}
                    onChange={(e) => updateStylingConfig('description', e.target.value)}
                    placeholder="Describe your theme"
                  />
                </FormField>
              </FormGrid>

              {/* Color Configuration */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🎨 Color Settings</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Header Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig['header-color'])}
                      onChange={(e) => updateStylingConfig('header-color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig['header-color']}
                      onChange={(e) => updateStylingConfig('header-color', e.target.value)}
                      placeholder="#000000"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Footer Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig['footer-color'])}
                      onChange={(e) => updateStylingConfig('footer-color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig['footer-color']}
                      onChange={(e) => updateStylingConfig('footer-color', e.target.value)}
                      placeholder="#000000"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Background Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.background_color)}
                      onChange={(e) => updateStylingConfig('background_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.background_color}
                      onChange={(e) => updateStylingConfig('background_color', e.target.value)}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Button Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.button_color)}
                      onChange={(e) => updateStylingConfig('button_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.button_color}
                      onChange={(e) => updateStylingConfig('button_color', e.target.value)}
                      placeholder="#2ecc71"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Button Text Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig['button-text_color'])}
                      onChange={(e) => updateStylingConfig('button-text_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig['button-text_color']}
                      onChange={(e) => updateStylingConfig('button-text_color', e.target.value)}
                      placeholder="#000000"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Text Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.text_color)}
                      onChange={(e) => updateStylingConfig('text_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.text_color}
                      onChange={(e) => updateStylingConfig('text_color', e.target.value)}
                      placeholder="#000000"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Typography Configuration */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>📝 Typography Settings</h4>
              </div>
              
              <FormGrid columns="1fr 1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Font Family</Label>
                  <select 
                    value={stylingConfig.font_family}
                    onChange={(e) => updateStylingConfig('font_family', e.target.value)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}`,
                      background: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      width: '100%'
                    }}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Heading Font Size</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="range"
                      min="16"
                      max="48"
                      value={parseInt(stylingConfig.heading_font_size)}
                      onChange={(e) => updateStylingConfig('heading_font_size', e.target.value + 'px')}
                      style={{ flex: 1 }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.heading_font_size}
                      onChange={(e) => updateStylingConfig('heading_font_size', e.target.value)}
                      placeholder="28px"
                      style={{ width: '80px' }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Body Font Size</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="range"
                      min="12"
                      max="24"
                      value={parseInt(stylingConfig.body_font_size)}
                      onChange={(e) => updateStylingConfig('body_font_size', e.target.value + 'px')}
                      style={{ flex: 1 }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.body_font_size}
                      onChange={(e) => updateStylingConfig('body_font_size', e.target.value)}
                      placeholder="16px"
                      style={{ width: '80px' }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Border Radius */}
              <FormGrid columns="1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Border Radius</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="range"
                      min="0"
                      max="50"
                      value={parseInt(stylingConfig.border_radius)}
                      onChange={(e) => updateStylingConfig('border_radius', e.target.value + 'px')}
                      style={{ flex: 1 }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.border_radius}
                      onChange={(e) => updateStylingConfig('border_radius', e.target.value)}
                      placeholder="8px"
                      style={{ width: '80px' }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Action Buttons */}
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button
                  variant="outline"
                  isDarkMode={isDarkMode}
                  onClick={() => {
                    fetchStylingConfig();
                  }}
                  disabled={savingConfig || fetchingConfig}
                >
                  {fetchingConfig ? 'Loading...' : 'Reset'}
                </Button>
                <Button
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={saveStylingConfig}
                  disabled={savingConfig || fetchingConfig}
                >
                  {savingConfig ? 'Saving...' : 'Save Styling'}
                </Button>
              </div>
            </ConfigCard>
          </Section>
        </SettingsContainer>
      </SettingsWrapper>
    </DashboardLayout>
  );
};

export default StyleSettings;
