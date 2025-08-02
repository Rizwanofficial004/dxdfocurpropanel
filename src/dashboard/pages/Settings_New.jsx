import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { gsap } from 'gsap';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { configurationAPI, uploadConfigAPI, databaseConfigAPI, awsConfigAPI } from '../../services/configurationAPI';
import {
  SettingsWrapper,
  SettingsContainer,
  SettingsHeader,
  SettingsTitle,
  SettingsSubtitle,
  TabsContainer,
  TabsList,
  Tab,
  ContentGrid,
  MainContent,
  RightSidebar,
  Section,
  SectionTitle,
  ConfigCard,
  ConfigHeader,
  ConfigInfo,
  ConfigName,
  ConfigDescription,
  ConfigActions,
  ConfigButton,
  ConfigData,
  SidebarCard,
  SidebarTitle,
  FormContainer,
  FormTitle,
  FormGrid,
  FormField,
  Label,
  Input,
  ActionButton,
  CheckboxField,
  StatusIndicator,
  MessageBox,
  LoadingMessage,
  EmptyMessage,
  ApiEndpoint,
  CategoryItem
} from '../components/settings/Settings.styles';

const Settings = () => {
  const { theme, isDarkMode } = useTheme();
  const settingsRef = useRef(null);
  const cardsRef = useRef([]);
  const tabsRef = useRef([]);

  // State management
  const [activeTab, setActiveTab] = useState('ui');
  const [message, setMessage] = useState('');
  const [configLoading, setConfigLoading] = useState(false);
  const [newConfigType, setNewConfigType] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);

  // Configuration states
  const [uploadConfigs, setUploadConfigs] = useState([]);
  const [databaseConfigs, setDatabaseConfigs] = useState([]);
  const [awsConfigs, setAwsConfigs] = useState([]);

  // Tab configuration
  const tabs = [
    { id: 'ui', label: '🎨 UI Settings', icon: '🎨' },
    { id: 'credentials', label: '🔐 Credentials', icon: '🔐' },
    { id: 'upload', label: '📤 Upload Config', icon: '📤' },
    { id: 'database', label: '🗄️ Database Config', icon: '🗄️' },
    { id: 'aws', label: '☁️ AWS Config', icon: '☁️' }
  ];

  // GSAP Animations
  useEffect(() => {
    if (settingsRef.current) {
      // Animate main container entrance
      gsap.fromTo(settingsRef.current, 
        { 
          opacity: 0,
          y: 50,
          rotationX: 45,
          transformPerspective: 1000
        },
        { 
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.2,
          ease: "power3.out"
        }
      );

      // Animate tabs
      tabsRef.current.forEach((tab, index) => {
        if (tab) {
          gsap.fromTo(tab,
            {
              opacity: 0,
              y: -30,
              rotationX: 90,
              transformPerspective: 1000
            },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.8,
              delay: 0.1 * index,
              ease: "back.out(1.7)"
            }
          );
        }
      });

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
  }, [activeTab]);

  // Fetch configurations
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    setConfigLoading(true);
    try {
      const [uploadData, databaseData, awsData] = await Promise.all([
        uploadConfigAPI.getAll().catch(() => []),
        databaseConfigAPI.getAll().catch(() => []),
        awsConfigAPI.getAll().catch(() => [])
      ]);
      
      setUploadConfigs(uploadData);
      setDatabaseConfigs(databaseData);
      setAwsConfigs(awsData);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      setMessage('❌ Error loading configurations');
    } finally {
      setConfigLoading(false);
    }
  };

  const handleCreateConfig = async (type, data) => {
    try {
      let response;
      if (type === 'upload') {
        response = await uploadConfigAPI.create(data);
        setUploadConfigs(prev => [...prev, response]);
      } else if (type === 'database') {
        response = await databaseConfigAPI.create(data);
        setDatabaseConfigs(prev => [...prev, response]);
      } else if (type === 'aws') {
        response = await awsConfigAPI.create(data);
        setAwsConfigs(prev => [...prev, response]);
      }
      
      setMessage(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} configuration created successfully!`);
      setNewConfigType(null);
      
      // Animate new card entrance
      setTimeout(() => {
        const newCard = cardsRef.current[cardsRef.current.length - 1];
        if (newCard) {
          gsap.fromTo(newCard,
            {
              opacity: 0,
              scale: 0.5,
              rotationY: 180,
              transformPerspective: 1000
            },
            {
              opacity: 1,
              scale: 1,
              rotationY: 0,
              duration: 0.8,
              ease: "back.out(1.7)"
            }
          );
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating configuration:', error);
      setMessage('❌ Error creating configuration');
    }
  };

  const handleUpdateConfig = async (id, data) => {
    try {
      if (editingConfig.type === 'upload') {
        await uploadConfigAPI.update(id, data);
        setUploadConfigs(prev => prev.map(config => 
          config.id === id ? { ...config, ...data } : config
        ));
      } else if (editingConfig.type === 'database') {
        await databaseConfigAPI.update(id, data);
        setDatabaseConfigs(prev => prev.map(config => 
          config.id === id ? { ...config, ...data } : config
        ));
      } else if (editingConfig.type === 'aws') {
        await awsConfigAPI.update(id, data);
        setAwsConfigs(prev => prev.map(config => 
          config.id === id ? { ...config, ...data } : config
        ));
      }
      
      setMessage('✅ Configuration updated successfully!');
      setEditingConfig(null);
    } catch (error) {
      console.error('Error updating configuration:', error);
      setMessage('❌ Error updating configuration');
    }
  };

  const handleDeleteConfig = async (id) => {
    try {
      // Determine which type to delete from based on the id
      const uploadConfig = uploadConfigs.find(config => config.id === id);
      const databaseConfig = databaseConfigs.find(config => config.id === id);
      const awsConfig = awsConfigs.find(config => config.id === id);

      if (uploadConfig) {
        await uploadConfigAPI.delete(id);
        setUploadConfigs(prev => prev.filter(config => config.id !== id));
      } else if (databaseConfig) {
        await databaseConfigAPI.delete(id);
        setDatabaseConfigs(prev => prev.filter(config => config.id !== id));
      } else if (awsConfig) {
        await awsConfigAPI.delete(id);
        setAwsConfigs(prev => prev.filter(config => config.id !== id));
      }
      
      setMessage('✅ Configuration deleted successfully!');
    } catch (error) {
      console.error('Error deleting configuration:', error);
      setMessage('❌ Error deleting configuration');
    }
  };

  const handleTabChange = (tabId) => {
    // Animate tab transition
    const currentContent = document.querySelector('.tab-content');
    if (currentContent) {
      gsap.to(currentContent, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
          setActiveTab(tabId);
          gsap.fromTo(currentContent, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.3 }
          );
        }
      });
    } else {
      setActiveTab(tabId);
    }
  };

  // Upload Configuration Render
  const renderUploadConfiguration = () => (
    <Section isDarkMode={isDarkMode} index={0} ref={el => cardsRef.current[0] = el}>
      <SectionTitle isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📤 Upload Configuration</span>
          <ActionButton 
            onClick={() => setNewConfigType('upload')}
            className="primary"
            isDarkMode={isDarkMode}
          >
            + Add Upload Config
          </ActionButton>
        </div>
      </SectionTitle>
      
      {configLoading ? (
        <LoadingMessage isDarkMode={isDarkMode}>Loading configurations...</LoadingMessage>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          {uploadConfigs.length === 0 ? (
            <EmptyMessage isDarkMode={isDarkMode}>
              No upload configurations found. Click "Add Upload Config" to create one.
            </EmptyMessage>
          ) : (
            uploadConfigs.map((config, index) => (
              <ConfigCard key={config.id} isDarkMode={isDarkMode} index={index} ref={el => cardsRef.current[index] = el}>
                <ConfigHeader>
                  <ConfigInfo>
                    <ConfigName isDarkMode={isDarkMode}>
                      {config.name}
                    </ConfigName>
                    <ConfigDescription isDarkMode={isDarkMode}>
                      {config.description}
                    </ConfigDescription>
                  </ConfigInfo>
                  <ConfigActions>
                    <ConfigButton
                      onClick={() => setEditingConfig(config)}
                      isDarkMode={isDarkMode}
                    >
                      ✏️ Edit
                    </ConfigButton>
                    <ConfigButton
                      onClick={() => handleDeleteConfig(config.id)}
                      variant="danger"
                      isDarkMode={isDarkMode}
                    >
                      🗑️ Delete
                    </ConfigButton>
                  </ConfigActions>
                </ConfigHeader>
                <ConfigData isDarkMode={isDarkMode}>
                  <strong>Configuration Data:</strong>
                  <pre>
                    {JSON.stringify(config.config_data, null, 2)}
                  </pre>
                </ConfigData>
              </ConfigCard>
            ))
          )}
        </div>
      )}

      {newConfigType === 'upload' && (
        <UploadConfigForm 
          onSubmit={(data) => handleCreateConfig('upload', data)}
          onCancel={() => setNewConfigType(null)}
          isDarkMode={isDarkMode}
        />
      )}
      
      {editingConfig && editingConfig.type === 'upload' && (
        <EditConfigForm
          config={editingConfig}
          onSubmit={(data) => handleUpdateConfig(editingConfig.id, data)}
          onCancel={() => setEditingConfig(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </Section>
  );

  // Database Configuration Render
  const renderDatabaseConfiguration = () => (
    <Section isDarkMode={isDarkMode} index={1} ref={el => cardsRef.current[1] = el}>
      <SectionTitle isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🗄️ Database Configuration</span>
          <ActionButton 
            onClick={() => setNewConfigType('database')}
            className="primary"
            isDarkMode={isDarkMode}
          >
            + Add Database Config
          </ActionButton>
        </div>
      </SectionTitle>
      
      {configLoading ? (
        <LoadingMessage isDarkMode={isDarkMode}>Loading configurations...</LoadingMessage>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          {databaseConfigs.length === 0 ? (
            <EmptyMessage isDarkMode={isDarkMode}>
              No database configurations found. Click "Add Database Config" to create one.
            </EmptyMessage>
          ) : (
            databaseConfigs.map((config, index) => (
              <ConfigCard key={config.id} isDarkMode={isDarkMode} index={index}>
                <ConfigHeader>
                  <ConfigInfo>
                    <ConfigName isDarkMode={isDarkMode}>
                      {config.name}
                    </ConfigName>
                    <ConfigDescription isDarkMode={isDarkMode}>
                      {config.description}
                    </ConfigDescription>
                  </ConfigInfo>
                  <ConfigActions>
                    <ConfigButton
                      onClick={() => setEditingConfig(config)}
                      isDarkMode={isDarkMode}
                    >
                      ✏️ Edit
                    </ConfigButton>
                    <ConfigButton
                      onClick={() => handleDeleteConfig(config.id)}
                      variant="danger"
                      isDarkMode={isDarkMode}
                    >
                      🗑️ Delete
                    </ConfigButton>
                  </ConfigActions>
                </ConfigHeader>
                <ConfigData isDarkMode={isDarkMode}>
                  <strong>Configuration Data:</strong>
                  <pre>
                    {JSON.stringify(config.config_data, null, 2)}
                  </pre>
                </ConfigData>
              </ConfigCard>
            ))
          )}
        </div>
      )}

      {newConfigType === 'database' && (
        <DatabaseConfigForm 
          onSubmit={(data) => handleCreateConfig('database', data)}
          onCancel={() => setNewConfigType(null)}
          isDarkMode={isDarkMode}
        />
      )}
      
      {editingConfig && editingConfig.type === 'database' && (
        <EditConfigForm
          config={editingConfig}
          onSubmit={(data) => handleUpdateConfig(editingConfig.id, data)}
          onCancel={() => setEditingConfig(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </Section>
  );

  // AWS Configuration Render
  const renderAwsConfiguration = () => (
    <Section isDarkMode={isDarkMode} index={2} ref={el => cardsRef.current[2] = el}>
      <SectionTitle isDarkMode={isDarkMode}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>☁️ AWS Configuration</span>
          <ActionButton 
            onClick={() => setNewConfigType('aws')}
            className="primary"
            isDarkMode={isDarkMode}
          >
            + Add AWS Config
          </ActionButton>
        </div>
      </SectionTitle>
      
      {configLoading ? (
        <LoadingMessage isDarkMode={isDarkMode}>Loading configurations...</LoadingMessage>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          {awsConfigs.length === 0 ? (
            <EmptyMessage isDarkMode={isDarkMode}>
              No AWS configurations found. Click "Add AWS Config" to create one.
            </EmptyMessage>
          ) : (
            awsConfigs.map((config, index) => (
              <ConfigCard key={config.id} isDarkMode={isDarkMode} index={index}>
                <ConfigHeader>
                  <ConfigInfo>
                    <ConfigName isDarkMode={isDarkMode}>
                      {config.name}
                    </ConfigName>
                    <ConfigDescription isDarkMode={isDarkMode}>
                      {config.description}
                    </ConfigDescription>
                  </ConfigInfo>
                  <ConfigActions>
                    <ConfigButton
                      onClick={() => setEditingConfig(config)}
                      isDarkMode={isDarkMode}
                    >
                      ✏️ Edit
                    </ConfigButton>
                    <ConfigButton
                      onClick={() => handleDeleteConfig(config.id)}
                      variant="danger"
                      isDarkMode={isDarkMode}
                    >
                      🗑️ Delete
                    </ConfigButton>
                  </ConfigActions>
                </ConfigHeader>
                <ConfigData isDarkMode={isDarkMode}>
                  <strong>Configuration Data:</strong>
                  <pre>
                    {JSON.stringify(config.config_data, null, 2)}
                  </pre>
                </ConfigData>
              </ConfigCard>
            ))
          )}
        </div>
      )}

      {newConfigType === 'aws' && (
        <AwsConfigForm 
          onSubmit={(data) => handleCreateConfig('aws', data)}
          onCancel={() => setNewConfigType(null)}
          isDarkMode={isDarkMode}
        />
      )}
      
      {editingConfig && editingConfig.type === 'aws' && (
        <EditConfigForm
          config={editingConfig}
          onSubmit={(data) => handleUpdateConfig(editingConfig.id, data)}
          onCancel={() => setEditingConfig(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </Section>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return renderUploadConfiguration();
      case 'database':
        return renderDatabaseConfiguration();
      case 'aws':
        return renderAwsConfiguration();
      default:
        return (
          <Section isDarkMode={isDarkMode} index={0} ref={el => cardsRef.current[0] = el}>
            <SectionTitle isDarkMode={isDarkMode}>🎨 UI Settings</SectionTitle>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 style={{ color: isDarkMode ? '#f1f5f9' : '#1e293b', marginBottom: '1rem' }}>
                UI Configuration Panel
              </h3>
              <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                Theme and interface customization options coming soon...
              </p>
            </div>
          </Section>
        );
    }
  };

  return (
    <DashboardLayout headerTitle="Settings Management" headerBreadcrumb="Settings › Configuration">
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>Settings Management</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              Configure UI themes and manage API credentials with advanced 3D interface
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

          <TabsContainer>
            <TabsList>
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  isDarkMode={isDarkMode}
                  index={index}
                  ref={el => tabsRef.current[index] = el}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabsList>
          </TabsContainer>

          <ContentGrid>
            <MainContent className="tab-content">
              {renderTabContent()}
            </MainContent>

            <RightSidebar>
              <SidebarCard isDarkMode={isDarkMode} index={0} ref={el => cardsRef.current[10] = el}>
                <SidebarTitle isDarkMode={isDarkMode}>API Configuration</SidebarTitle>
                <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Settings API Integration
                </p>
                <p style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  All settings are saved to the backend API and applied in real-time.
                </p>
                <div style={{ fontSize: '0.75rem', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  <ApiEndpoint isDarkMode={isDarkMode}><strong>Base URL:</strong> http://localhost:8000api/</ApiEndpoint>
                  <ApiEndpoint isDarkMode={isDarkMode}><strong>UI Endpoint:</strong> /api/settings/ui/</ApiEndpoint>
                  <ApiEndpoint isDarkMode={isDarkMode}><strong>Credentials:</strong> /api/settings/credentials/</ApiEndpoint>
                </div>
              </SidebarCard>

              <SidebarCard isDarkMode={isDarkMode} index={1} ref={el => cardsRef.current[11] = el}>
                <SidebarTitle isDarkMode={isDarkMode}>Settings Categories</SidebarTitle>
                <div style={{ fontSize: '0.875rem' }}>
                  <CategoryItem isDarkMode={isDarkMode}>
                    <span style={{ color: '#3b82f6' }}>🎨</span>
                    <strong>UI Settings</strong>
                    <p>
                      Themes, colors, fonts, layout preferences
                    </p>
                  </CategoryItem>
                  <CategoryItem isDarkMode={isDarkMode}>
                    <span style={{ color: '#10b981' }}>🔐</span>
                    <strong>OpenAI</strong>
                    <p>
                      API keys, models, temperature, tokens
                    </p>
                  </CategoryItem>
                  <CategoryItem isDarkMode={isDarkMode}>
                    <span style={{ color: '#f59e0b' }}>🗄️</span>
                    <strong>Database</strong>
                    <p>
                      Connection strings, SSL, timeouts
                    </p>
                  </CategoryItem>
                  <CategoryItem isDarkMode={isDarkMode}>
                    <span style={{ color: '#8b5cf6' }}>☁️</span>
                    <strong>AWS</strong>
                    <p>
                      S3 storage, access keys, regions, buckets
                    </p>
                  </CategoryItem>
                </div>
              </SidebarCard>

              <SidebarCard isDarkMode={isDarkMode} index={2} ref={el => cardsRef.current[12] = el}>
                <SidebarTitle isDarkMode={isDarkMode}>Status Monitor</SidebarTitle>
                <div style={{ fontSize: '0.875rem' }}>
                  <StatusIndicator status="connected" isDarkMode={isDarkMode}>
                    <span>●</span>
                    <span>API Connected</span>
                  </StatusIndicator>
                  <StatusIndicator status="ready" isDarkMode={isDarkMode}>
                    <span>●</span>
                    <span>Ready for Configuration</span>
                  </StatusIndicator>
                </div>
              </SidebarCard>
            </RightSidebar>
          </ContentGrid>
        </SettingsContainer>
      </SettingsWrapper>
    </DashboardLayout>
  );
};

// Form Components for Configuration Management
const UploadConfigForm = ({ onSubmit, onCancel, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    config_data: {
      max_file_size: '10MB',
      allowed_types: ['jpg', 'png', 'pdf'],
      upload_path: '/uploads/',
      auto_resize: true
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContainer type="upload" isDarkMode={isDarkMode}>
      <FormTitle isDarkMode={isDarkMode}>New Upload Configuration</FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGrid columns="1fr 1fr">
          <FormField>
            <Label isDarkMode={isDarkMode}>Configuration Name</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Default Upload Settings"
              required
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Description</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Configuration description"
              required
            />
          </FormField>
        </FormGrid>

        <FormGrid columns="1fr 1fr">
          <FormField>
            <Label isDarkMode={isDarkMode}>Max File Size</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.config_data.max_file_size}
              onChange={(e) => setFormData({
                ...formData, 
                config_data: {...formData.config_data, max_file_size: e.target.value}
              })}
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Upload Path</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.config_data.upload_path}
              onChange={(e) => setFormData({
                ...formData, 
                config_data: {...formData.config_data, upload_path: e.target.value}
              })}
            />
          </FormField>
        </FormGrid>

        <CheckboxField>
          <input
            type="checkbox"
            checked={formData.config_data.auto_resize}
            onChange={(e) => setFormData({
              ...formData, 
              config_data: {...formData.config_data, auto_resize: e.target.checked}
            })}
          />
          <Label isDarkMode={isDarkMode}>Auto Resize Images</Label>
        </CheckboxField>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ActionButton type="submit" className="primary" isDarkMode={isDarkMode}>Create Configuration</ActionButton>
          <ActionButton type="button" onClick={onCancel} isDarkMode={isDarkMode}>Cancel</ActionButton>
        </div>
      </form>
    </FormContainer>
  );
};

const DatabaseConfigForm = ({ onSubmit, onCancel, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    config_data: {
      host: 'localhost',
      port: 5432,
      database: '',
      username: '',
      ssl_enabled: false,
      connection_timeout: 30
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContainer type="database" isDarkMode={isDarkMode}>
      <FormTitle isDarkMode={isDarkMode}>New Database Configuration</FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGrid columns="1fr 1fr">
          <FormField>
            <Label isDarkMode={isDarkMode}>Configuration Name</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Production Database"
              required
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Description</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Configuration description"
              required
            />
          </FormField>
        </FormGrid>

        <FormGrid columns="1fr 1fr 1fr">
          <FormField>
            <Label isDarkMode={isDarkMode}>Host</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.config_data.host}
              onChange={(e) => setFormData({
                ...formData, 
                config_data: {...formData.config_data, host: e.target.value}
              })}
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Port</Label>
            <Input
              isDarkMode={isDarkMode}
              type="number"
              value={formData.config_data.port}
              onChange={(e) => setFormData({
                ...formData, 
                config_data: {...formData.config_data, port: parseInt(e.target.value)}
              })}
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Database Name</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.config_data.database}
              onChange={(e) => setFormData({
                ...formData, 
                config_data: {...formData.config_data, database: e.target.value}
              })}
            />
          </FormField>
        </FormGrid>

        <CheckboxField>
          <input
            type="checkbox"
            checked={formData.config_data.ssl_enabled}
            onChange={(e) => setFormData({
              ...formData, 
              config_data: {...formData.config_data, ssl_enabled: e.target.checked}
            })}
          />
          <Label isDarkMode={isDarkMode}>Enable SSL</Label>
        </CheckboxField>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ActionButton type="submit" className="primary" isDarkMode={isDarkMode}>Create Configuration</ActionButton>
          <ActionButton type="button" onClick={onCancel} isDarkMode={isDarkMode}>Cancel</ActionButton>
        </div>
      </form>
    </FormContainer>
  );
};

const AwsConfigForm = ({ onSubmit, onCancel, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    config_data: {
      access_key_id: '',
      secret_access_key: '',
      region: 'us-east-1',
      bucket_name: '',
      encryption_enabled: true
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContainer type="aws" isDarkMode={isDarkMode}>
      <FormTitle isDarkMode={isDarkMode}>New AWS Configuration</FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGrid columns="1fr 1fr">
          <FormField>
            <Label isDarkMode={isDarkMode}>Configuration Name</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Production S3"
              required
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Description</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Configuration description"
              required
            />
          </FormField>
        </FormGrid>

        <FormGrid columns="1fr 1fr">
          <FormField>
            <Label isDarkMode={isDarkMode}>Region</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.config_data.region}
              onChange={(e) => setFormData({
                ...formData, 
                config_data: {...formData.config_data, region: e.target.value}
              })}
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Bucket Name</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.config_data.bucket_name}
              onChange={(e) => setFormData({
                ...formData, 
                config_data: {...formData.config_data, bucket_name: e.target.value}
              })}
            />
          </FormField>
        </FormGrid>

        <CheckboxField>
          <input
            type="checkbox"
            checked={formData.config_data.encryption_enabled}
            onChange={(e) => setFormData({
              ...formData, 
              config_data: {...formData.config_data, encryption_enabled: e.target.checked}
            })}
          />
          <Label isDarkMode={isDarkMode}>Enable Encryption</Label>
        </CheckboxField>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ActionButton type="submit" className="primary" isDarkMode={isDarkMode}>Create Configuration</ActionButton>
          <ActionButton type="button" onClick={onCancel} isDarkMode={isDarkMode}>Cancel</ActionButton>
        </div>
      </form>
    </FormContainer>
  );
};

const EditConfigForm = ({ config, onSubmit, onCancel, isDarkMode }) => {
  const [formData, setFormData] = useState(config);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContainer type="edit" isDarkMode={isDarkMode}>
      <FormTitle isDarkMode={isDarkMode}>Edit Configuration</FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGrid columns="1fr 1fr">
          <FormField>
            <Label isDarkMode={isDarkMode}>Configuration Name</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </FormField>
          <FormField>
            <Label isDarkMode={isDarkMode}>Description</Label>
            <Input
              isDarkMode={isDarkMode}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </FormField>
        </FormGrid>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ActionButton type="submit" className="primary" isDarkMode={isDarkMode}>Update Configuration</ActionButton>
          <ActionButton type="button" onClick={onCancel} isDarkMode={isDarkMode}>Cancel</ActionButton>
        </div>
      </form>
    </FormContainer>
  );
};

export default Settings;
