import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();
  const settingsRef = useRef(null);
  const cardsRef = useRef([]);

  // Styling Configuration State
  const [stylingConfig, setStylingConfig] = useState({
    // Basic Information
    theme_name: 'My Custom Theme pagal',
    description: 'My custom styling theme',
    
    // Primary Colors
    primary_color: '#006039',
    secondary_color: '#6c757d',
    background_color: '#0011ff',
    button_color: '#000000',
    text_color: '#000',
    header_color: '#ff531a',
    footer_color: '#003366',
    button_text_color: '#ffffff',
    
    // Button Colors
    submit_button_bg_color: '#28a745',
    submit_button_text_color: '#ffffff',
    primary_button_bg_color: '#007bff',
    primary_button_text_color: '#ffffff',
    secondary_button_bg_color: '#6c757d',
    secondary_button_text_color: '#ffffff',
    
    // Component Colors
    drawer_background_color: '#f8f9fa',
    drawer_text_color: '#212529',
    icon_color: '#6c757d',
    top_color: '#006039',
    
    // Primary Variations
    primary_dark: '#004d2e',
    primary_darker: '#003d24',
    primary_light: '#00804d',
    primary_hover: '#005530',
    primary_active: '#004426',
    
    // Secondary Variations
    secondary_dark: '#5a6268',
    secondary_light: '#adb5bd',
    
    // State Colors
    success_color: '#28a745',
    warning_color: '#ffc107',
    danger_color: '#dc3545',
    danger_dark: '#c82333',
    info_color: '#17a2b8',
    
    // Text Colors
    text_light: '#6c757d',
    text_dark: '#212529',
    
    // Background Variations
    background_light: '#f8f9fa',
    background_dark: '#343a40',
    border_color: '#dee2e6',
    
    // Button States
    button_hover: '#0056b3',
    button_dark: '#004085',
    button_light: '#66b3ff',
    
    // Application States
    state_idle: '#6c757d',
    state_work: '#006039',
    state_break: '#ffc107',
    state_meeting: '#17a2b8',
    
    // Drawer Styling
    drawer_overlay: 'rgba(0, 0, 0, 0.6)',
    drawer_border: 'rgba(0, 96, 57, 0.1)',
    drawer_shadow: 'rgba(0, 96, 57, 0.15)',
    
    // Modal Styling
    modal_background: '#ffffff',
    modal_overlay: 'rgba(0, 0, 0, 0.6)',
    modal_border: '#dee2e6',
    modal_overlay_bg: 'rgba(0, 0, 0, 0.6)',
    modal_content_bg: '#ffffff',
    modal_header_bg: '#f8f9fa',
    modal_border_color: '#dee2e6',
    modal_shadow: 'rgba(0, 0, 0, 0.25)',
    modal_close_bg: 'transparent',
    modal_close_hover: '#f8f9fa',
    
    // Input Styling
    input_background: '#ffffff',
    input_border: '#ced4da',
    input_focus: '#80bdff',
    input_text: '#495057',
    input_valid_border: '#28a745',
    input_invalid_border: '#dc3545',
    input_placeholder: '#6c757d',
    
    // Navigation
    nav_background: '#003366',
    nav_text: '#ffffff',
    nav_hover: 'rgba(255, 255, 255, 0.1)',
    nav_active: '#0056b3',
    
    // Standard Colors
    white: '#ffffff',
    black: '#000000',
    
    // Gray Scale
    gray_100: '#f8f9fa',
    gray_200: '#e9ecef',
    gray_300: '#dee2e6',
    gray_400: '#ced4da',
    gray_500: '#adb5bd',
    gray_600: '#6c757d',
    gray_700: '#495057',
    gray_800: '#343a40',
    gray_900: '#212529',
    
    // Login Page Colors
    login_background: '#f8f9fa',
    login_header_bg: '#006039',
    login_card_bg: '#ffffff',
    login_input_bg: '#ffffff',
    login_input_border: '#ced4da',
    login_input_focus: '#80bdff',
    login_button_bg: '#006039',
    login_button_text: '#ffffff',
    login_button_hover: '#005530',
    login_text_primary: '#212529',
    login_text_secondary: '#6c757d',
    login_link_color: '#006039',
    login_error_color: '#dc3545',
    login_success_color: '#28a745',
    
    // Form Elements
    checkbox_bg: '#ffffff',
    checkbox_checked: '#006039',
    language_dropdown_bg: '#ffffff',
    language_option_hover: '#f8f9fa',
    language_border: '#ced4da',
    
    // Typography
    heading_font_size: '28px',
    body_font_size: '16px',
    font_family: 'Arial, sans-serif',
    border_radius: '22px'
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
            theme_name: data.data.theme_name || 'My Custom Theme pagal',
            description: data.data.description || 'My custom styling theme',
            primary_color: data.data.primary_color || '#3498db',
            secondary_color: data.data.secondary_color || '#e74c3c',
            background_color: data.data.background_color || '#1f2937',
            header_color: data.data.header_color || '#fff',
            footer_color: data.data.footer_color || '#fff',
            button_color: data.data.button_color || '#fff',
            button_text_color: data.data.button_text_color || '#000',
            text_color: data.data.text_color || '#000',
            heading_font_size: data.data.heading_font_size || '28px',
            body_font_size: data.data.body_font_size || '16px',
            font_family: data.data.font_family || 'Arial, sans-serif',
            border_radius: data.data.border_radius || '8px'
          });
          setMessage('✅ ' + t('stylingConfigLoaded'));
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Error fetching styling config:', error);
      setMessage('❌ ' + t('failedToLoadStyling'));
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setFetchingConfig(false);
    }
  };

  // Save styling configuration
  const saveStylingConfig = async () => {
    setSavingConfig(true);
    try {
      // Prepare the POST body with all styling configuration fields
      const postBody = {
        // Basic Information
        theme_name: stylingConfig.theme_name,
        description: stylingConfig.description,
        
        // Primary Colors
        primary_color: stylingConfig.primary_color,
        secondary_color: stylingConfig.secondary_color,
        background_color: stylingConfig.background_color,
        button_color: stylingConfig.button_color,
        text_color: stylingConfig.text_color,
        header_color: stylingConfig.header_color,
        footer_color: stylingConfig.footer_color,
        button_text_color: stylingConfig.button_text_color,
        
        // Button Colors
        submit_button_bg_color: stylingConfig.submit_button_bg_color,
        submit_button_text_color: stylingConfig.submit_button_text_color,
        primary_button_bg_color: stylingConfig.primary_button_bg_color,
        primary_button_text_color: stylingConfig.primary_button_text_color,
        secondary_button_bg_color: stylingConfig.secondary_button_bg_color,
        secondary_button_text_color: stylingConfig.secondary_button_text_color,
        
        // Component Colors
        drawer_background_color: stylingConfig.drawer_background_color,
        drawer_text_color: stylingConfig.drawer_text_color,
        icon_color: stylingConfig.icon_color,
        top_color: stylingConfig.top_color,
        
        // Primary Variations
        primary_dark: stylingConfig.primary_dark,
        primary_darker: stylingConfig.primary_darker,
        primary_light: stylingConfig.primary_light,
        primary_hover: stylingConfig.primary_hover,
        primary_active: stylingConfig.primary_active,
        
        // Secondary Variations
        secondary_dark: stylingConfig.secondary_dark,
        secondary_light: stylingConfig.secondary_light,
        
        // State Colors
        success_color: stylingConfig.success_color,
        warning_color: stylingConfig.warning_color,
        danger_color: stylingConfig.danger_color,
        danger_dark: stylingConfig.danger_dark,
        info_color: stylingConfig.info_color,
        
        // Text Colors
        text_light: stylingConfig.text_light,
        text_dark: stylingConfig.text_dark,
        
        // Background Variations
        background_light: stylingConfig.background_light,
        background_dark: stylingConfig.background_dark,
        border_color: stylingConfig.border_color,
        
        // Button States
        button_hover: stylingConfig.button_hover,
        button_dark: stylingConfig.button_dark,
        button_light: stylingConfig.button_light,
        
        // Application States
        state_idle: stylingConfig.state_idle,
        state_work: stylingConfig.state_work,
        state_break: stylingConfig.state_break,
        state_meeting: stylingConfig.state_meeting,
        
        // Drawer Styling
        drawer_overlay: stylingConfig.drawer_overlay,
        drawer_border: stylingConfig.drawer_border,
        drawer_shadow: stylingConfig.drawer_shadow,
        
        // Modal Styling
        modal_background: stylingConfig.modal_background,
        modal_overlay: stylingConfig.modal_overlay,
        modal_border: stylingConfig.modal_border,
        modal_overlay_bg: stylingConfig.modal_overlay_bg,
        modal_content_bg: stylingConfig.modal_content_bg,
        modal_header_bg: stylingConfig.modal_header_bg,
        modal_border_color: stylingConfig.modal_border_color,
        modal_shadow: stylingConfig.modal_shadow,
        modal_close_bg: stylingConfig.modal_close_bg,
        modal_close_hover: stylingConfig.modal_close_hover,
        
        // Input Styling
        input_background: stylingConfig.input_background,
        input_border: stylingConfig.input_border,
        input_focus: stylingConfig.input_focus,
        input_text: stylingConfig.input_text,
        input_valid_border: stylingConfig.input_valid_border,
        input_invalid_border: stylingConfig.input_invalid_border,
        input_placeholder: stylingConfig.input_placeholder,
        
        // Navigation
        nav_background: stylingConfig.nav_background,
        nav_text: stylingConfig.nav_text,
        nav_hover: stylingConfig.nav_hover,
        nav_active: stylingConfig.nav_active,
        
        // Standard Colors
        white: stylingConfig.white,
        black: stylingConfig.black,
        
        // Gray Scale
        gray_100: stylingConfig.gray_100,
        gray_200: stylingConfig.gray_200,
        gray_300: stylingConfig.gray_300,
        gray_400: stylingConfig.gray_400,
        gray_500: stylingConfig.gray_500,
        gray_600: stylingConfig.gray_600,
        gray_700: stylingConfig.gray_700,
        gray_800: stylingConfig.gray_800,
        gray_900: stylingConfig.gray_900,
        
        // Login Page Colors
        login_background: stylingConfig.login_background,
        login_header_bg: stylingConfig.login_header_bg,
        login_card_bg: stylingConfig.login_card_bg,
        login_input_bg: stylingConfig.login_input_bg,
        login_input_border: stylingConfig.login_input_border,
        login_input_focus: stylingConfig.login_input_focus,
        login_button_bg: stylingConfig.login_button_bg,
        login_button_text: stylingConfig.login_button_text,
        login_button_hover: stylingConfig.login_button_hover,
        login_text_primary: stylingConfig.login_text_primary,
        login_text_secondary: stylingConfig.login_text_secondary,
        login_link_color: stylingConfig.login_link_color,
        login_error_color: stylingConfig.login_error_color,
        login_success_color: stylingConfig.login_success_color,
        
        // Form Elements
        checkbox_bg: stylingConfig.checkbox_bg,
        checkbox_checked: stylingConfig.checkbox_checked,
        language_dropdown_bg: stylingConfig.language_dropdown_bg,
        language_option_hover: stylingConfig.language_option_hover,
        language_border: stylingConfig.language_border,
        
        // Typography
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
          setMessage('✅ ' + t('stylingConfigSaved'));
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        const errorText = await response.text();
        console.log('❌ API Error Response:', errorText);
        throw new Error(`Failed to save configuration: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving styling config:', error);
      setMessage('❌ ' + t('failedToSaveStyling'));
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
    <DashboardLayout headerTitle={t('stylingSettings')} headerBreadcrumb={t('settings') + ' › ' + t('styling')}>
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>🎨 {t('stylingConfiguration')}</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              {t('customizeGlobalTheme')}
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
            <SectionTitle isDarkMode={isDarkMode}>🎨 {t('globalThemeConfiguration')}</SectionTitle>
            
            <ConfigCard isDarkMode={isDarkMode} index={0}>
              <ConfigHeader>
                <ConfigInfo>
                  <ConfigName isDarkMode={isDarkMode}>{t('themeSettings')}</ConfigName>
                  <ConfigDescription isDarkMode={isDarkMode}>
                    {t('configureGlobalTheme')}
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

              {/* Primary Colors */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🎨 Primary Colors</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_color)}
                      onChange={(e) => updateStylingConfig('primary_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_color}
                      onChange={(e) => updateStylingConfig('primary_color', e.target.value)}
                      placeholder="#006039"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Secondary Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.secondary_color)}
                      onChange={(e) => updateStylingConfig('secondary_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.secondary_color}
                      onChange={(e) => updateStylingConfig('secondary_color', e.target.value)}
                      placeholder="#6c757d"
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
                      placeholder="#0011ff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
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
                      placeholder="#000"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Header Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.header_color)}
                      onChange={(e) => updateStylingConfig('header_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.header_color}
                      onChange={(e) => updateStylingConfig('header_color', e.target.value)}
                      placeholder="#ff531a"
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
                      value={validateColor(stylingConfig.footer_color)}
                      onChange={(e) => updateStylingConfig('footer_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.footer_color}
                      onChange={(e) => updateStylingConfig('footer_color', e.target.value)}
                      placeholder="#003366"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Button Colors */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🔘 Button Colors</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
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
                      placeholder="#000000"
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
                      value={validateColor(stylingConfig.button_text_color)}
                      onChange={(e) => updateStylingConfig('button_text_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.button_text_color}
                      onChange={(e) => updateStylingConfig('button_text_color', e.target.value)}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Submit Button Background</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.submit_button_bg_color)}
                      onChange={(e) => updateStylingConfig('submit_button_bg_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.submit_button_bg_color}
                      onChange={(e) => updateStylingConfig('submit_button_bg_color', e.target.value)}
                      placeholder="#28a745"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Submit Button Text</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.submit_button_text_color)}
                      onChange={(e) => updateStylingConfig('submit_button_text_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.submit_button_text_color}
                      onChange={(e) => updateStylingConfig('submit_button_text_color', e.target.value)}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Button Background</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_button_bg_color)}
                      onChange={(e) => updateStylingConfig('primary_button_bg_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_button_bg_color}
                      onChange={(e) => updateStylingConfig('primary_button_bg_color', e.target.value)}
                      placeholder="#007bff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Button Text</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_button_text_color)}
                      onChange={(e) => updateStylingConfig('primary_button_text_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_button_text_color}
                      onChange={(e) => updateStylingConfig('primary_button_text_color', e.target.value)}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Secondary Button Background</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.secondary_button_bg_color)}
                      onChange={(e) => updateStylingConfig('secondary_button_bg_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.secondary_button_bg_color}
                      onChange={(e) => updateStylingConfig('secondary_button_bg_color', e.target.value)}
                      placeholder="#6c757d"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Secondary Button Text</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.secondary_button_text_color)}
                      onChange={(e) => updateStylingConfig('secondary_button_text_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.secondary_button_text_color}
                      onChange={(e) => updateStylingConfig('secondary_button_text_color', e.target.value)}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Primary Color Variations */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🎨 Primary Color Variations</h4>
              </div>
              
              <FormGrid columns="1fr 1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Dark</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_dark)}
                      onChange={(e) => updateStylingConfig('primary_dark', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_dark}
                      onChange={(e) => updateStylingConfig('primary_dark', e.target.value)}
                      placeholder="#004d2e"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Darker</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_darker)}
                      onChange={(e) => updateStylingConfig('primary_darker', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_darker}
                      onChange={(e) => updateStylingConfig('primary_darker', e.target.value)}
                      placeholder="#003d24"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Light</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_light)}
                      onChange={(e) => updateStylingConfig('primary_light', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_light}
                      onChange={(e) => updateStylingConfig('primary_light', e.target.value)}
                      placeholder="#00804d"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Hover</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_hover)}
                      onChange={(e) => updateStylingConfig('primary_hover', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_hover}
                      onChange={(e) => updateStylingConfig('primary_hover', e.target.value)}
                      placeholder="#005530"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Primary Active</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.primary_active)}
                      onChange={(e) => updateStylingConfig('primary_active', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.primary_active}
                      onChange={(e) => updateStylingConfig('primary_active', e.target.value)}
                      placeholder="#004426"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Top Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.top_color)}
                      onChange={(e) => updateStylingConfig('top_color', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.top_color}
                      onChange={(e) => updateStylingConfig('top_color', e.target.value)}
                      placeholder="#006039"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* State Colors */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🚦 State Colors</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Success Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.success_color)}
                      onChange={(e) => updateStylingConfig('success_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.success_color}
                      onChange={(e) => updateStylingConfig('success_color', e.target.value)}
                      placeholder="#28a745"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Warning Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.warning_color)}
                      onChange={(e) => updateStylingConfig('warning_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.warning_color}
                      onChange={(e) => updateStylingConfig('warning_color', e.target.value)}
                      placeholder="#ffc107"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Danger Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.danger_color)}
                      onChange={(e) => updateStylingConfig('danger_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.danger_color}
                      onChange={(e) => updateStylingConfig('danger_color', e.target.value)}
                      placeholder="#dc3545"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Danger Dark</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.danger_dark)}
                      onChange={(e) => updateStylingConfig('danger_dark', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.danger_dark}
                      onChange={(e) => updateStylingConfig('danger_dark', e.target.value)}
                      placeholder="#c82333"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Info Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.info_color)}
                      onChange={(e) => updateStylingConfig('info_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.info_color}
                      onChange={(e) => updateStylingConfig('info_color', e.target.value)}
                      placeholder="#17a2b8"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Application States */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>⏰ Application States</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>State Idle</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.state_idle)}
                      onChange={(e) => updateStylingConfig('state_idle', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.state_idle}
                      onChange={(e) => updateStylingConfig('state_idle', e.target.value)}
                      placeholder="#6c757d"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>State Work</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.state_work)}
                      onChange={(e) => updateStylingConfig('state_work', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.state_work}
                      onChange={(e) => updateStylingConfig('state_work', e.target.value)}
                      placeholder="#006039"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>State Break</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.state_break)}
                      onChange={(e) => updateStylingConfig('state_break', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.state_break}
                      onChange={(e) => updateStylingConfig('state_break', e.target.value)}
                      placeholder="#ffc107"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>State Meeting</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.state_meeting)}
                      onChange={(e) => updateStylingConfig('state_meeting', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.state_meeting}
                      onChange={(e) => updateStylingConfig('state_meeting', e.target.value)}
                      placeholder="#17a2b8"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* UI Element Colors */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🖼️ UI Element Colors</h4>
              </div>
              
              <FormGrid columns="1fr 1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Drawer Background</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.drawer_background_color)}
                      onChange={(e) => updateStylingConfig('drawer_background_color', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.drawer_background_color}
                      onChange={(e) => updateStylingConfig('drawer_background_color', e.target.value)}
                      placeholder="#f8f9fa"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Drawer Text</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.drawer_text_color)}
                      onChange={(e) => updateStylingConfig('drawer_text_color', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.drawer_text_color}
                      onChange={(e) => updateStylingConfig('drawer_text_color', e.target.value)}
                      placeholder="#212529"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Icon Color</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.icon_color)}
                      onChange={(e) => updateStylingConfig('icon_color', e.target.value)}
                      style={{ width: '50px', height: '30px', padding: '0.1rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.icon_color}
                      onChange={(e) => updateStylingConfig('icon_color', e.target.value)}
                      placeholder="#6c757d"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Navigation Colors */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🧭 Navigation Colors</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Nav Background</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.nav_background)}
                      onChange={(e) => updateStylingConfig('nav_background', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.nav_background}
                      onChange={(e) => updateStylingConfig('nav_background', e.target.value)}
                      placeholder="#003366"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Nav Text</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.nav_text)}
                      onChange={(e) => updateStylingConfig('nav_text', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.nav_text}
                      onChange={(e) => updateStylingConfig('nav_text', e.target.value)}
                      placeholder="#ffffff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Nav Hover</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.nav_hover}
                      onChange={(e) => updateStylingConfig('nav_hover', e.target.value)}
                      placeholder="rgba(255, 255, 255, 0.1)"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Nav Active</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.nav_active)}
                      onChange={(e) => updateStylingConfig('nav_active', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.nav_active}
                      onChange={(e) => updateStylingConfig('nav_active', e.target.value)}
                      placeholder="#0056b3"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              {/* Login Page Colors */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🔐 Login Page Colors</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>Login Background</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.login_background)}
                      onChange={(e) => updateStylingConfig('login_background', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.login_background}
                      onChange={(e) => updateStylingConfig('login_background', e.target.value)}
                      placeholder="#f8f9fa"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Login Button Background</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.login_button_bg)}
                      onChange={(e) => updateStylingConfig('login_button_bg', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.login_button_bg}
                      onChange={(e) => updateStylingConfig('login_button_bg', e.target.value)}
                      placeholder="#006039"
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
                    <option value="Arial, sans-serif">Arial</option>
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
                    <span style={{ 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      minWidth: '50px',
                      fontSize: '0.875rem'
                    }}>
                      {stylingConfig.heading_font_size}
                    </span>
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
                    <span style={{ 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      minWidth: '50px',
                      fontSize: '0.875rem'
                    }}>
                      {stylingConfig.body_font_size}
                    </span>
                  </div>
                </FormField>
              </FormGrid>

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
                    <span style={{ 
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      minWidth: '50px',
                      fontSize: '0.875rem'
                    }}>
                      {stylingConfig.border_radius}
                    </span>
                  </div>
                </FormField>
              </FormGrid>

              {/* Color Configuration */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>🎨 {t('colorSettings')}</h4>
              </div>
              
              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('headerColor')}</Label>
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
                  <Label isDarkMode={isDarkMode}>{t('footerColor')}</Label>
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
                  <Label isDarkMode={isDarkMode}>{t('backgroundColor')}</Label>
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
                      placeholder="#1f2937"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('headerColor')}</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.header_color)}
                      onChange={(e) => updateStylingConfig('header_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.header_color}
                      onChange={(e) => updateStylingConfig('header_color', e.target.value)}
                      placeholder="#fff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('footerColor')}</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.footer_color)}
                      onChange={(e) => updateStylingConfig('footer_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.footer_color}
                      onChange={(e) => updateStylingConfig('footer_color', e.target.value)}
                      placeholder="#fff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('buttonColor')}</Label>
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
                      placeholder="#fff"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('buttonTextColor')}</Label>
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

              <FormGrid columns="1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('buttonTextColor')}</Label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      isDarkMode={isDarkMode}
                      type="color"
                      value={validateColor(stylingConfig.button_text_color)}
                      onChange={(e) => updateStylingConfig('button_text_color', e.target.value)}
                      style={{ width: '60px', height: '40px', padding: '0.25rem' }}
                    />
                    <Input
                      isDarkMode={isDarkMode}
                      value={stylingConfig.button_text_color}
                      onChange={(e) => updateStylingConfig('button_text_color', e.target.value)}
                      placeholder="#000"
                      style={{ flex: 1 }}
                    />
                  </div>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('textColor')}</Label>
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
                <h4 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>📝 {t('typographySettings')}</h4>
              </div>
              
              <FormGrid columns="1fr 1fr 1fr">
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('fontFamily')}</Label>
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
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>{t('headingFontSize')}</Label>
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
                  <Label isDarkMode={isDarkMode}>{t('bodyFontSize')}</Label>
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
                  <Label isDarkMode={isDarkMode}>{t('borderRadius')}</Label>
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
                  {fetchingConfig ? t('loading') : t('reset')}
                </Button>
                <Button
                  variant="primary"
                  isDarkMode={isDarkMode}
                  onClick={saveStylingConfig}
                  disabled={savingConfig || fetchingConfig}
                >
                  {savingConfig ? t('saving') : t('saveStyling')}
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
