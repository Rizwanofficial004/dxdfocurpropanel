import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { settingsAPI } from '../../../services/settingsAPI';

const CredentialsContainer = styled.div`
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

  &[type="password"] {
    font-family: monospace;
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

const RangeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const RangeInput = styled.input`
  width: 100%;
  accent-color: ${props => props.theme.colors.primary};
`;

const RangeValue = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
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

const CredentialsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const CredentialCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
`;

const CredentialHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const CredentialInfo = styled.div`
  flex: 1;
`;

const CredentialName = styled.h4`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CredentialType = styled.span`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
`;

const CredentialStatus = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background: ${props => props.active ? props.theme.colors.success + '20' : props.theme.colors.error + '20'};
  color: ${props => props.active ? props.theme.colors.success : props.theme.colors.error};
`;

const CredentialDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin: ${props => props.theme.spacing.sm} 0;
`;

const CredentialActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.surface};
  }
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

const CredentialsSettings = ({ settings, onSave, loading }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    credential_type: 'openai',
    description: '',
    api_key: '',
    is_active: true,
    is_production: false,
    additional_config: {
      model: 'gpt-4',
      max_tokens: 4000,
      temperature: 0.7
    }
  });

  const credentialTypes = [
    { value: 'openai', label: 'OpenAI API' },
    { value: 'aws', label: 'AWS' },
    { value: 'database', label: 'Database' },
    { value: 'smtp', label: 'Email/SMTP' },
    { value: 'oauth', label: 'OAuth' },
    { value: 'api_key', label: 'Generic API Key' },
    { value: 'storage', label: 'Cloud Storage' },
    { value: 'payment', label: 'Payment Gateway' }
  ];

  const openAiModels = [
    'gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo', 'gpt-4o'
  ];

  useEffect(() => {
    if (editingCredential) {
      setFormData(editingCredential);
      setShowForm(true);
    }
  }, [editingCredential]);

  const handleInputChange = (field, value) => {
    if (field.startsWith('config.')) {
      const configField = field.replace('config.', '');
      setFormData(prev => ({
        ...prev,
        additional_config: {
          ...prev.additional_config,
          [configField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
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
      setMessage({ type: 'error', text: 'Failed to save credentials' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      credential_type: 'openai',
      description: '',
      api_key: '',
      is_active: true,
      is_production: false,
      additional_config: {
        model: 'gpt-4',
        max_tokens: 4000,
        temperature: 0.7
      }
    });
    setShowForm(false);
    setEditingCredential(null);
  };

  const handleEdit = (credential) => {
    setEditingCredential(credential);
  };

  const handleTest = async (credentialName) => {
    try {
      const result = await settingsAPI.testCredential(credentialName);
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message || (result.success ? 'Credential test successful!' : 'Credential test failed!')
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test credential' });
    }
  };

  const renderAdditionalConfig = () => {
    if (formData.credential_type === 'openai') {
      return (
        <>
          <FormGroup>
            <Label>AI Model</Label>
            <Select
              value={formData.additional_config.model}
              onChange={(e) => handleInputChange('config.model', e.target.value)}
            >
              {openAiModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Max Tokens</Label>
            <Input
              type="number"
              min="1"
              max="32000"
              value={formData.additional_config.max_tokens}
              onChange={(e) => handleInputChange('config.max_tokens', parseInt(e.target.value))}
            />
          </FormGroup>

          <FormGroup>
            <Label>Temperature</Label>
            <RangeGroup>
              <RangeInput
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.additional_config.temperature}
                onChange={(e) => handleInputChange('config.temperature', parseFloat(e.target.value))}
              />
              <RangeValue>{formData.additional_config.temperature}</RangeValue>
            </RangeGroup>
          </FormGroup>
        </>
      );
    }
    return null;
  };

  return (
    <CredentialsContainer>
      {message.text && (
        message.type === 'success' ? (
          <SuccessMessage>{message.text}</SuccessMessage>
        ) : (
          <ErrorMessage>{message.text}</ErrorMessage>
        )
      )}

      <Section>
        <SectionTitle>
          🔐 Credentials Management
          <Button 
            primary 
            onClick={() => setShowForm(!showForm)}
            style={{ marginLeft: 'auto' }}
          >
            {showForm ? 'Cancel' : '+ Add New Credential'}
          </Button>
        </SectionTitle>

        {showForm && (
          <div>
            <FormGrid>
              <FormGroup>
                <Label>Configuration Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., openai_production"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Credential Type *</Label>
                <Select
                  value={formData.credential_type}
                  onChange={(e) => handleInputChange('credential_type', e.target.value)}
                >
                  {credentialTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this credential configuration..."
                />
              </FormGroup>

              <FormGroup>
                <Label>API Key / Secret *</Label>
                <Input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => handleInputChange('api_key', e.target.value)}
                  placeholder="Enter your API key or secret"
                  required
                />
              </FormGroup>

              {renderAdditionalConfig()}

              <FormGroup>
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                  <Label>Active</Label>
                </CheckboxGroup>
              </FormGroup>

              <FormGroup>
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    checked={formData.is_production}
                    onChange={(e) => handleInputChange('is_production', e.target.checked)}
                  />
                  <Label>Production Environment</Label>
                </CheckboxGroup>
              </FormGroup>
            </FormGrid>

            <ButtonGroup>
              <Button
                primary
                onClick={handleSave}
                disabled={loading || !formData.name || !formData.api_key}
              >
                {loading ? 'Saving...' : '🔑 Save Credential'}
              </Button>
              <Button onClick={resetForm}>
                Cancel
              </Button>
            </ButtonGroup>
          </div>
        )}
      </Section>

      <Section>
        <SectionTitle>📋 Existing Credentials</SectionTitle>
        
        {settings && settings.length > 0 ? (
          <CredentialsList>
            {settings.map((credential, index) => (
              <CredentialCard key={index}>
                <CredentialHeader>
                  <CredentialInfo>
                    <CredentialName>{credential.name}</CredentialName>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <CredentialType>{credential.credential_type}</CredentialType>
                      <CredentialStatus active={credential.is_active}>
                        {credential.is_active ? '✅ Active' : '❌ Inactive'}
                      </CredentialStatus>
                      {credential.is_production && (
                        <CredentialStatus active="true">🔴 Production</CredentialStatus>
                      )}
                    </div>
                  </CredentialInfo>
                </CredentialHeader>
                
                <CredentialDescription>
                  {credential.description || 'No description provided'}
                </CredentialDescription>

                <CredentialActions>
                  <ActionButton onClick={() => handleEdit(credential)}>
                    ✏️ Edit
                  </ActionButton>
                  <ActionButton onClick={() => handleTest(credential.name)}>
                    🔍 Test
                  </ActionButton>
                  {credential.additional_config && (
                    <ActionButton onClick={() => console.log(credential.additional_config)}>
                      ⚙️ Config
                    </ActionButton>
                  )}
                </CredentialActions>
              </CredentialCard>
            ))}
          </CredentialsList>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No credentials configured yet. Add your first credential above.
          </p>
        )}
      </Section>
    </CredentialsContainer>
  );
};

export default CredentialsSettings;
