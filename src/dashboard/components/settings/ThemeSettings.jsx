import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { settingsAPI } from '../../../services/settingsAPI';

const ThemeContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const Section = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  padding-bottom: ${props => props.theme.spacing.xl};
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &[type="color"] {
    width: 60px;
    height: 40px;
    padding: 4px;
    cursor: pointer;
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border: 1px solid ${props => props.primary ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.primary ? props.theme.colors.primary : props.theme.colors.background};
  color: ${props => props.primary ? 'white' : props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  disabled: ${props => props.disabled};

  &:hover:not(:disabled) {
    background: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.surface};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewContainer = styled.div`
  background: ${props => props.previewSettings?.background_color || props.theme.colors.background};
  color: ${props => props.previewSettings?.text_color || props.theme.colors.text.primary};
  font-family: ${props => props.previewSettings?.font_family || props.theme.typography.fontFamily.body};
  font-size: ${props => props.previewSettings?.font_size || props.theme.typography.fontSize.base};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.lg};
`;

const PreviewCard = styled.div`
  background: ${props => props.previewSettings?.primary_color || props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const PreviewButton = styled.div`
  background: ${props => props.previewSettings?.secondary_color || props.theme.colors.secondary};
  color: white;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: inline-block;
  margin-right: ${props => props.theme.spacing.sm};
`;

const SuccessMessage = styled.div`
  background: ${props => props.theme.colors.success}20;
  border: 1px solid ${props => props.theme.colors.success};
  color: ${props => props.theme.colors.success};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ThemeSettings = ({ settings, onSave, loading }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    setting_name: 'dashboard_theme',
    font_family: 'Inter, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    font_size: '16px',
    primary_color: '#3498db',
    secondary_color: '#2ecc71',
    background_color: '#ffffff',
    text_color: '#2c3e50',
    theme_mode: 'light',
    sidebar_collapsed: false,
    is_global: true,
    user_id: null
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings
      }));
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-preview when in preview mode
    if (previewMode) {
      settingsAPI.applyThemeSettings({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    
    try {
      const result = await onSave(formData);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Apply theme immediately
        settingsAPI.applyThemeSettings(formData);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save theme settings' });
    }
  };

  const handlePreviewToggle = () => {
    if (previewMode) {
      // Reset to current theme
      if (settings) {
        settingsAPI.applyThemeSettings(settings);
      }
    } else {
      // Apply preview
      settingsAPI.applyThemeSettings(formData);
    }
    setPreviewMode(!previewMode);
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
      settingsAPI.applyThemeSettings(settings);
    }
    setPreviewMode(false);
  };

  return (
    <ThemeContainer>
      {message.text && (
        message.type === 'success' ? (
          <SuccessMessage>{message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>{message.text}</ErrorMessage>
        )
      )}

      <Section>
        <SectionTitle>🎨 Basic Configuration</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Theme Name</Label>
            <Input
              type="text"
              value={formData.setting_name}
              onChange={(e) => handleInputChange('setting_name', e.target.value)}
              placeholder="e.g., dashboard_theme"
            />
          </FormGroup>

          <FormGroup>
            <Label>Theme Mode</Label>
            <Select
              value={formData.theme_mode}
              onChange={(e) => handleInputChange('theme_mode', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </FormGroup>
        </FormGrid>
      </Section>

      <Section>
        <SectionTitle>🎭 Colors</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Primary Color</Label>
            <Input
              type="color"
              value={formData.primary_color}
              onChange={(e) => handleInputChange('primary_color', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Secondary Color</Label>
            <Input
              type="color"
              value={formData.secondary_color}
              onChange={(e) => handleInputChange('secondary_color', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Background Color</Label>
            <Input
              type="color"
              value={formData.background_color}
              onChange={(e) => handleInputChange('background_color', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Text Color</Label>
            <Input
              type="color"
              value={formData.text_color}
              onChange={(e) => handleInputChange('text_color', e.target.value)}
            />
          </FormGroup>
        </FormGrid>
      </Section>

      <Section>
        <SectionTitle>📝 Typography</SectionTitle>
        <FormGrid>
          <FormGroup>
            <Label>Font Family</Label>
            <Select
              value={formData.font_family}
              onChange={(e) => handleInputChange('font_family', e.target.value)}
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Open Sans, sans-serif">Open Sans</option>
              <option value="Lato, sans-serif">Lato</option>
              <option value="Montserrat, sans-serif">Montserrat</option>
              <option value="Inter, &quot;Segoe UI&quot;, Tahoma, Geneva, Verdana, sans-serif">Inter (Default)</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Font Size</Label>
            <Select
              value={formData.font_size}
              onChange={(e) => handleInputChange('font_size', e.target.value)}
            >
              <option value="12px">12px (Extra Small)</option>
              <option value="14px">14px (Small)</option>
              <option value="16px">16px (Medium)</option>
              <option value="18px">18px (Large)</option>
              <option value="20px">20px (Extra Large)</option>
              <option value="24px">24px (XXL)</option>
            </Select>
          </FormGroup>
        </FormGrid>
      </Section>

      <Section>
        <SectionTitle>⚙️ Layout Settings</SectionTitle>
        <FormGrid>
          <FormGroup>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                checked={formData.sidebar_collapsed}
                onChange={(e) => handleInputChange('sidebar_collapsed', e.target.checked)}
              />
              <Label>Collapse Sidebar by Default</Label>
            </CheckboxGroup>
          </FormGroup>

          <FormGroup>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                checked={formData.is_global}
                onChange={(e) => handleInputChange('is_global', e.target.checked)}
              />
              <Label>Apply Globally (All Users)</Label>
            </CheckboxGroup>
          </FormGroup>
        </FormGrid>
      </Section>

      <Section>
        <SectionTitle>👀 Preview</SectionTitle>
        <PreviewContainer previewSettings={previewMode ? formData : null}>
          <PreviewCard previewSettings={previewMode ? formData : null}>
            <h3>Sample Dashboard Card</h3>
            <p>This is how your dashboard will look with the selected theme.</p>
          </PreviewCard>
          <p>Sample text with the selected font and colors.</p>
          <PreviewButton previewSettings={previewMode ? formData : null}>
            Sample Button
          </PreviewButton>
          <PreviewButton previewSettings={previewMode ? formData : null}>
            Another Button
          </PreviewButton>
        </PreviewContainer>
      </Section>

      <ButtonGroup>
        <Button
          primary
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : '💾 Save Theme Settings'}
        </Button>
        
        <Button
          onClick={handlePreviewToggle}
          disabled={loading}
        >
          {previewMode ? '👁️ Stop Preview' : '👁️ Live Preview'}
        </Button>
        
        <Button
          onClick={handleReset}
          disabled={loading}
        >
          🔄 Reset
        </Button>
      </ButtonGroup>
    </ThemeContainer>
  );
};

export default ThemeSettings;
