import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const AppSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
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

const CategorySection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  padding-bottom: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const CategoryTitle = styled.h4`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.md};
  text-transform: capitalize;
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

  &:read-only {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.secondary};
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

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &:read-only {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.secondary};
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
  margin-top: ${props => props.theme.spacing.lg};
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

  &:hover:not(:disabled) {
    background: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.surface};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SettingItem = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SettingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingKey = styled.h5`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const SettingDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const SettingValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
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

const AppSettings = ({ settings, onSave, loading }) => {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    setting_type: 'string',
    category: 'general',
    description: '',
    is_public: false,
    is_editable: true
  });

  const [groupedSettings, setGroupedSettings] = useState({});
  const [editingSettings, setEditingSettings] = useState({});

  const settingTypes = [
    { value: 'string', label: 'String' },
    { value: 'integer', label: 'Integer' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'json', label: 'JSON' }
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'security', label: 'Security' },
    { value: 'limits', label: 'Limits' },
    { value: 'email', label: 'Email' },
    { value: 'system', label: 'System' },
    { value: 'ui', label: 'User Interface' }
  ];

  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const grouped = settings.reduce((groups, setting) => {
        if (!groups[setting.category]) {
          groups[setting.category] = [];
        }
        groups[setting.category].push(setting);
        return groups;
      }, {});
      setGroupedSettings(grouped);
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    
    try {
      const result = await onSave(formData);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        resetForm();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save application setting' });
    }
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      setting_type: 'string',
      category: 'general',
      description: '',
      is_public: false,
      is_editable: true
    });
    setShowForm(false);
  };

  const handleEditSetting = (setting) => {
    setEditingSettings(prev => ({
      ...prev,
      [setting.key]: setting.value
    }));
  };

  const handleSaveSetting = async (key, value, type) => {
    try {
      const settingData = {
        key: key,
        value: value,
        setting_type: type
      };
      
      const result = await onSave(settingData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Setting saved successfully!' });
        setEditingSettings(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save setting' });
    }
  };

  const handleCancelEdit = (key) => {
    setEditingSettings(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const renderSettingInput = (setting) => {
    const isEditing = editingSettings.hasOwnProperty(setting.key);
    const currentValue = isEditing ? editingSettings[setting.key] : setting.value;

    if (!setting.is_editable && !isEditing) {
      return (
        <SettingValue>
          <Input
            type="text"
            value={setting.value}
            readOnly
          />
        </SettingValue>
      );
    }

    if (isEditing) {
      let inputElement;
      switch (setting.setting_type) {
        case 'boolean':
          inputElement = (
            <Checkbox
              type="checkbox"
              checked={currentValue === 'true' || currentValue === true}
              onChange={(e) => setEditingSettings(prev => ({
                ...prev,
                [setting.key]: e.target.checked.toString()
              }))}
            />
          );
          break;
        case 'integer':
          inputElement = (
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => setEditingSettings(prev => ({
                ...prev,
                [setting.key]: e.target.value
              }))}
            />
          );
          break;
        case 'json':
          inputElement = (
            <TextArea
              value={currentValue}
              onChange={(e) => setEditingSettings(prev => ({
                ...prev,
                [setting.key]: e.target.value
              }))}
              rows="3"
            />
          );
          break;
        default:
          inputElement = (
            <Input
              type="text"
              value={currentValue}
              onChange={(e) => setEditingSettings(prev => ({
                ...prev,
                [setting.key]: e.target.value
              }))}
            />
          );
      }

      return (
        <SettingValue>
          {inputElement}
          <Button
            primary
            onClick={() => handleSaveSetting(setting.key, editingSettings[setting.key], setting.setting_type)}
            disabled={loading}
          >
            Save
          </Button>
          <Button
            onClick={() => handleCancelEdit(setting.key)}
            disabled={loading}
          >
            Cancel
          </Button>
        </SettingValue>
      );
    }

    return (
      <SettingValue>
        <Input
          type="text"
          value={setting.value}
          readOnly
        />
        {setting.is_editable && (
          <Button onClick={() => handleEditSetting(setting)}>
            Edit
          </Button>
        )}
      </SettingValue>
    );
  };

  return (
    <AppSettingsContainer>
      {message.text && (
        message.type === 'success' ? (
          <SuccessMessage>{message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>{message.text}</ErrorMessage>
        )
      )}

      <Section>
        <SectionTitle>
          ⚙️ Application Configuration
          <Button 
            primary 
            onClick={() => setShowForm(!showForm)}
            style={{ marginLeft: 'auto' }}
          >
            {showForm ? 'Cancel' : '+ Add New Setting'}
          </Button>
        </SectionTitle>

        {showForm && (
          <div>
            <FormGrid>
              <FormGroup>
                <Label>Setting Key *</Label>
                <Input
                  type="text"
                  value={formData.key}
                  onChange={(e) => handleInputChange('key', e.target.value)}
                  placeholder="e.g., max_users, app_name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Setting Value *</Label>
                <Input
                  type="text"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  placeholder="Enter value"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Data Type</Label>
                <Select
                  value={formData.setting_type}
                  onChange={(e) => handleInputChange('setting_type', e.target.value)}
                >
                  {settingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this setting..."
                />
              </FormGroup>

              <div>
                <FormGroup>
                  <CheckboxGroup>
                    <Checkbox
                      type="checkbox"
                      checked={formData.is_public}
                      onChange={(e) => handleInputChange('is_public', e.target.checked)}
                    />
                    <Label>Public Setting</Label>
                  </CheckboxGroup>
                </FormGroup>

                <FormGroup>
                  <CheckboxGroup>
                    <Checkbox
                      type="checkbox"
                      checked={formData.is_editable}
                      onChange={(e) => handleInputChange('is_editable', e.target.checked)}
                    />
                    <Label>Editable</Label>
                  </CheckboxGroup>
                </FormGroup>
              </div>
            </FormGrid>

            <ButtonGroup>
              <Button
                primary
                onClick={handleSave}
                disabled={loading || !formData.key || !formData.value}
              >
                {loading ? 'Saving...' : '💾 Save Application Setting'}
              </Button>
              <Button onClick={resetForm}>
                Cancel
              </Button>
            </ButtonGroup>
          </div>
        )}
      </Section>

      <Section>
        <SectionTitle>📋 Current Settings</SectionTitle>
        
        {Object.keys(groupedSettings).length > 0 ? (
          Object.keys(groupedSettings).map(category => (
            <CategorySection key={category}>
              <CategoryTitle>{category} Settings</CategoryTitle>
              
              {groupedSettings[category].map((setting, index) => (
                <SettingItem key={index}>
                  <SettingHeader>
                    <SettingInfo>
                      <SettingKey>{setting.key}</SettingKey>
                      <SettingDescription>
                        {setting.description || 'No description provided'}
                      </SettingDescription>
                    </SettingInfo>
                  </SettingHeader>
                  
                  {renderSettingInput(setting)}
                </SettingItem>
              ))}
            </CategorySection>
          ))
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No application settings configured yet. Add your first setting above.
          </p>
        )}
      </Section>
    </AppSettingsContainer>
  );
};

export default AppSettings;
