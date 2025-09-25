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

  // Credentials Management State
  const [credentialsList, setCredentialsList] = useState([]);
  const [currentCredentialId, setCurrentCredentialId] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Credentials Configuration State
  const [credentialsConfig, setCredentialsConfig] = useState({
    credential_name: 'Production Config - 2025-09-25',
    credential_type: 'general',
    description: 'All production services configuration',
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_region: 'us-west-2',
    aws_bucket_name: 'company-production-bucket',
    db_host: '92.113.22.65',
    db_port: '3306',
    db_name: 'u906714182_sqlrrefdvdv',
    db_username: 'u906714182_root',
    db_password: '',
    db_type: 'mysql',
    openai_api_key: '',
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
  const [servicesStatus, setServicesStatus] = useState({
    aws: false,
    openai: false,
    mysql: false,
    crm: false
  });

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

  //'''''Dynamic update function with change tracking
  const updateCredentialsConfig = (field, value) => {
    console.log(`📝 FORM FIELD UPDATE: ${field} = ${value}`);
    
    setCredentialsConfig(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Check if there are changes from original
      const hasChanges = JSON.stringify(updated) !== JSON.stringify(originalConfig);
      console.log(`🔄 Has changes after ${field} update:`, hasChanges);
      setHasChanges(hasChanges);
      
      console.log(`📊 Updated config:`, updated);
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

  // Set all credentials at once using the new API endpoint
  const setAllCredentials = async () => {
    console.log('🌐 SET ALL CREDENTIALS - Starting bulk credentials operation...');
    console.log('📊 Current credentialsConfig state:', credentialsConfig);
    
    setSavingConfig(true);
    setMessage('🌐 Setting all credentials via bulk API...');
    
    try {
      console.log('📦 Preparing data for set-all-credentials API...');
      
      // Prepare comprehensive data payload for the set-all-credentials endpoint
      const allCredentialsData = {
        // Basic Configuration
        name: credentialsConfig.credential_name || 'Bulk Config - 2025-09-25',
        description: credentialsConfig.description || 'All services credentials set via bulk API',
        environment: credentialsConfig.environment || 'production',
        is_active: credentialsConfig.is_active !== undefined ? credentialsConfig.is_active : true,
        
        // OpenAI Credentials
        openai: {
          api_key: credentialsConfig.openai_api_key || '',
          organization: credentialsConfig.openai_organization || '',
          model: 'gpt-4',
          max_tokens: 4000,
          temperature: 0.7
        },
        
        // AWS Credentials
        aws: {
          access_key_id: credentialsConfig.aws_access_key_id || '',
          secret_access_key: credentialsConfig.aws_secret_access_key || '',
          region: credentialsConfig.aws_region || 'us-west-2',
          bucket_name: credentialsConfig.aws_bucket_name || '',
          default_acl: 'private'
        },
        
        // Database Credentials
        database: {
          type: credentialsConfig.db_type || 'mysql',
          host: credentialsConfig.db_host || '',
          port: parseInt(credentialsConfig.db_port) || 3306,
          name: credentialsConfig.db_name || '',
          username: credentialsConfig.db_username || '',
          password: credentialsConfig.db_password || '',
          ssl_mode: 'prefer',
          connection_timeout: 30
        },
        
        // Additional Settings
        settings: {
          auto_backup: true,
          encryption_enabled: true,
          audit_logging: true,
          credential_rotation_days: 90
        }
      };

      console.log('📤 Bulk API payload being sent:', JSON.stringify(allCredentialsData, null, 2));
      console.log('🌐 Target API URL: http://127.0.0.1:8000/api/set-all-credentials/');
      console.log('📋 Request headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      });

      console.log('🌐 INITIATING BULK API REQUEST...');
      console.log('⏰ Request timestamp:', new Date().toISOString());

      // API call to set all credentials using POST method
      const response = await fetch('http://127.0.0.1:8000/api/set-all-credentials/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(allCredentialsData)
      });

      console.log('📡 BULK API RESPONSE RECEIVED:');
      console.log('🔢 Response Status:', response.status);
      console.log('✅ Response OK:', response.ok);
      console.log('📋 Response Headers:', Object.fromEntries(response.headers));
      console.log('⏰ Response timestamp:', new Date().toISOString());

      const responseData = await response.json();
      console.log('📊 PARSED BULK API RESPONSE:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        console.log('✅ SUCCESS! All credentials set via bulk API');
        setMessage('✅ All credentials successfully set via bulk API!');
        console.log('💾 Bulk API response details:', responseData);
        
        // Update states
        setOriginalConfig({ ...allCredentialsData });
        setHasChanges(false);
        setIsCreatingNew(false);
        console.log('🔄 States updated after bulk operation');
        
        // Auto-refresh to get latest data
        setTimeout(() => {
          console.log('🔄 Auto-refreshing after bulk operation...');
          fetchCredentialsConfig();
          fetchCredentialsList();
        }, 1500);
        
      } else {
        console.error('❌ BULK API FAILED - Response not OK');
        console.error('📊 Error response data:', responseData);
        
        let errorMessage = 'Bulk credentials API failed';
        if (responseData.errors) {
          const errorDetails = Object.entries(responseData.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = `Bulk API validation errors: ${errorDetails}`;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
        
        console.error('🔚 Final bulk API error message:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('🛑 CRITICAL ERROR in setAllCredentials:');
      console.error('🔍 Error Type:', error.constructor.name);
      console.error('💬 Error Message:', error.message);
      console.error('📚 Error Stack:', error.stack);
      
      setMessage(`❌ Failed to set all credentials: ${error.message}`);
      setTimeout(() => setMessage(''), 8000);
    } finally {
      console.log('🏁 BULK CREDENTIALS OPERATION COMPLETED');
      setSavingConfig(false);
      setTimeout(() => setMessage(''), 10000);
    }
  };

  // Save credentials configuration to database using http://127.0.0.1:8000/api/credentials/
  const saveCredentialsConfig = async () => {
    console.log('🚀 SAVE BUTTON CLICKED - Starting SQL save operation...');
    console.log('📊 Current credentialsConfig state:', credentialsConfig);
    console.log('🔄 Has changes?', hasChanges);
    console.log('⚙️ Saving config state:', savingConfig);
    
    setSavingConfig(true);
    setMessage('💾 Saving credentials to SQL database...');
    
    try {
      console.log('📦 Preparing data for SQL API...');
      
      // Prepare data for API - ensure all required fields are present
      const dataToSave = {
        name: credentialsConfig.credential_name || 'Production Config - 2025-09-25',
        credential_type: determineCredentialType(credentialsConfig),
        description: credentialsConfig.description || 'All production services configuration',
        environment: credentialsConfig.environment || 'production',
        is_active: credentialsConfig.is_active !== undefined ? credentialsConfig.is_active : true,
        is_production: credentialsConfig.is_default !== undefined ? credentialsConfig.is_default : true,
        
        // OpenAI Configuration
        openai_api_key: credentialsConfig.openai_api_key || '',
        openai_organization: credentialsConfig.openai_organization || '',
        
        // AWS Configuration  
        aws_access_key_id: credentialsConfig.aws_access_key_id || '',
        aws_secret_access_key: credentialsConfig.aws_secret_access_key || '',
        aws_region: credentialsConfig.aws_region || 'us-west-2',
        aws_bucket_name: credentialsConfig.aws_bucket_name || '',
        
        // Database Configuration
        db_host: credentialsConfig.db_host || '',
        db_port: credentialsConfig.db_port || '3306',
        db_name: credentialsConfig.db_name || '',
        db_username: credentialsConfig.db_username || '',
        db_password: credentialsConfig.db_password || '',
        db_type: credentialsConfig.db_type || 'mysql',
        
        // Additional configuration
        additional_config: {
          model: 'gpt-4',
          max_tokens: 4000,
          temperature: 0.7,
          ssl_mode: 'prefer',
          connection_timeout: 30,
          default_acl: 'private'
        }
      };

      console.log('📤 Final payload being sent to SQL API:', JSON.stringify(dataToSave, null, 2));
      console.log('🌐 Target API URL: http://127.0.0.1:8000/api/credentials/');
      console.log('📋 Request headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      });

      console.log('🌐 INITIATING FETCH REQUEST TO SQL API...');
      console.log('⏰ Request timestamp:', new Date().toISOString());

      // API call to save credentials using POST method to http://127.0.0.1:8000/api/credentials/
      const response = await fetch('http://127.0.0.1:8000/api/credentials/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(dataToSave)
      });

      console.log('📡 RESPONSE RECEIVED FROM SQL API:');
      console.log('🔢 Response Status:', response.status);
      console.log('✅ Response OK:', response.ok);
      console.log('📋 Response Headers:', Object.fromEntries(response.headers));
      console.log('⏰ Response timestamp:', new Date().toISOString());

      const responseData = await response.json();
      console.log('📊 PARSED RESPONSE DATA:', JSON.stringify(responseData, null, 2));

      if (response.ok) {
        console.log('✅ SUCCESS! Credentials saved to SQL database successfully');
        setMessage(isCreatingNew ? 
          '✅ New credentials successfully created and saved to SQL database!' :
          '✅ Credentials successfully updated in SQL database!'
        );
        console.log('💾 Database save response details:', responseData);
        
        // Update original config to reflect saved state
        setOriginalConfig({ ...dataToSave });
        setHasChanges(false);
        setIsCreatingNew(false);
        console.log('🔄 Original config updated, hasChanges set to false');
        
        // If we just created a new credential, update the current ID
        if (isCreatingNew && responseData.data && responseData.data.id) {
          setCurrentCredentialId(responseData.data.id);
          console.log('🆔 New credential ID set:', responseData.data.id);
        }
        
        // Auto-refresh to get latest data from database
        setTimeout(() => {
          console.log('🔄 Auto-refreshing credentials from database...');
          fetchCredentialsConfig();
          fetchCredentialsList(); // Also refresh the list
        }, 1000);
        
        setTimeout(() => setMessage(''), 4000);
      } else {
        console.error('❌ ERROR! SQL Database API returned error status');
        // Enhanced error handling with detailed response
        console.error('🚨 SQL Database API Error Response:', responseData);
        console.error('🔍 Error Analysis:');
        console.error('   - Response Status:', response.status);
        console.error('   - Response Status Text:', response.statusText);
        console.error('   - Response Data:', responseData);
        
        let errorMessage = 'Failed to save credentials to database';
        
        if (responseData.errors) {
          // Handle validation errors
          console.error('📝 Validation Errors Found:', responseData.errors);
          const errorDetails = Object.entries(responseData.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
          errorMessage = `Database validation errors: ${errorDetails}`;
        } else if (responseData.message) {
          console.error('💬 Error Message:', responseData.message);
          errorMessage = responseData.message;
        } else if (responseData.error) {
          console.error('🚨 Error Details:', responseData.error);
          errorMessage = responseData.error;
        }
        
        console.error('🔚 Final error message to show user:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('🛑 CRITICAL ERROR in saveCredentialsConfig:');
      console.error('🔍 Error Type:', error.constructor.name);
      console.error('💬 Error Message:', error.message);
      console.error('📚 Error Stack:', error.stack);
      console.error('🌐 Network Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      setMessage(`❌ Failed to save to SQL database: ${error.message}`);
      setTimeout(() => setMessage(''), 8000);
    } finally {
      console.log('🏁 SAVE OPERATION COMPLETED');
      console.log('⚙️ Setting savingConfig to false');
      setSavingConfig(false);
      console.log('📊 Final state - savingConfig:', false);
    }
  };

  // Wrapper function to handle button click with logging
  const handleSaveButtonClick = () => {
    console.log('🔘 SAVE BUTTON CLICKED!');
    console.log('🕒 Click timestamp:', new Date().toISOString());
    console.log('🔄 Current state before save:');
    console.log('   - savingConfig:', savingConfig);
    console.log('   - fetchingConfig:', fetchingConfig);
    console.log('   - hasChanges:', hasChanges);
    console.log('   - Button disabled?', savingConfig || fetchingConfig);
    
    // Call the actual save function
    saveCredentialsConfig();
  };

  // Create a new empty credential configuration
  const createNewCredential = () => {
    console.log('🆕 Creating new credential configuration...');
    
    const newCredential = {
      credential_name: `New Config - ${new Date().toISOString().split('T')[0]}`,
      credential_type: 'general',
      description: 'New credential configuration',
      aws_access_key_id: '',
      aws_secret_access_key: '',
      aws_region: 'us-west-2',
      aws_bucket_name: '',
      db_host: '',
      db_port: '3306',
      db_name: '',
      db_username: '',
      db_password: '',
      db_type: 'mysql',
      openai_api_key: '',
      openai_organization: '',
      environment: 'development',
      is_active: false,
      is_default: false
    };

    setCredentialsConfig(newCredential);
    setIsCreatingNew(true);
    setCurrentCredentialId(null);
    setHasChanges(true);
    setMessage('📝 New credential configuration created. Fill in the details and save.');
    
    console.log('✅ New credential created:', newCredential);
  };

  // Fetch all credentials from the database
  const fetchCredentialsList = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/credentials/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched credentials list:', data);
        
        if (data.success && Array.isArray(data.data)) {
          setCredentialsList(data.data);
        } else if (data.data && Array.isArray(data.data.credentials)) {
          setCredentialsList(data.data.credentials);
        } else {
          setCredentialsList([]);
        }
      } else {
        console.error('❌ Failed to fetch credentials list');
        setCredentialsList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching credentials list:', error);
      setCredentialsList([]);
    }
  };

  // Load a specific credential configuration
  const loadCredential = (credentialId) => {
    const credential = credentialsList.find(cred => cred.id === credentialId);
    if (credential) {
      console.log('📂 Loading credential:', credential);
      
      setCredentialsConfig({
        credential_name: credential.name || credential.credential_name,
        credential_type: credential.credential_type || 'general',
        description: credential.description || '',
        aws_access_key_id: credential.aws_access_key_id || '',
        aws_secret_access_key: credential.aws_secret_access_key || '',
        aws_region: credential.aws_region || 'us-west-2',
        aws_bucket_name: credential.aws_bucket_name || '',
        db_host: credential.db_host || '',
        db_port: credential.db_port || '3306',
        db_name: credential.db_name || '',
        db_username: credential.db_username || '',
        db_password: credential.db_password || '',
        db_type: credential.db_type || 'mysql',
        openai_api_key: credential.openai_api_key || '',
        openai_organization: credential.openai_organization || '',
        environment: credential.environment || 'production',
        is_active: credential.is_active !== undefined ? credential.is_active : true,
        is_default: credential.is_default !== undefined ? credential.is_default : false
      });
      
      setCurrentCredentialId(credentialId);
      setIsCreatingNew(false);
      setHasChanges(false);
      setMessage(`✅ Loaded credential: ${credential.name || credential.credential_name}`);
    }
  };

  // Determine credential type based on filled fields
  const determineCredentialType = (config) => {
    if (config.openai_api_key) {
      return 'openai';
    } else if (config.aws_access_key_id || config.aws_secret_access_key) {
      return 'aws';
    } else if (config.db_host || config.db_name) {
      return 'database';
    } else {
      return 'general';
    }
  };

  // Fetch current credentials configuration from database using GET method
  const fetchCredentialsConfig = async () => {
    setFetchingConfig(true);
    setMessage('🔄 Loading credentials from SQL database...');
    
    try {
      // API call to fetch credentials using GET method
      const response = await fetch('http://127.0.0.1:8000/api/credentials/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched from SQL database:', data);
        
        if (data.success && data.data && data.data.credentials) {
          // Handle the new response format
          const credentials = data.data.credentials;
          
          const loadedConfig = {
            credential_name: `Loaded Config - ${new Date().toISOString().split('T')[0]}`,
            credential_type: 'general',
            description: `Configuration loaded with ${data.data.services_count} services`,
            
            // AWS Configuration
            aws_access_key_id: credentials.aws?.access_key_id || '',
            aws_secret_access_key: credentials.aws?.secret_access_key || '',
            aws_region: credentials.aws?.region || 'us-west-2',
            aws_bucket_name: credentials.aws?.bucket_name || '',
            
            // Database Configuration (MySQL)
            db_host: credentials.mysql?.host || '',
            db_port: '3306',
            db_name: credentials.mysql?.database || '',
            db_username: credentials.mysql?.user || '',
            db_password: credentials.mysql?.password || '',
            db_type: 'mysql',
            
            // OpenAI Configuration
            openai_api_key: credentials.openai?.api_key || '',
            openai_organization: credentials.openai?.organization || '',
            
            environment: 'production',
            is_active: true,
            is_default: true
          };
          
          setCredentialsConfig(loadedConfig);
          setOriginalConfig({ ...loadedConfig });
          setHasChanges(false);
          
          // Update services status
          setServicesStatus({
            aws: credentials.aws?.configured || false,
            openai: credentials.openai?.configured || false,
            mysql: credentials.mysql?.configured || false,
            crm: credentials.crm?.configured || false
          });
          
          setMessage(`✅ Credentials loaded! Found ${data.data.services_count} configured services.`);
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('📝 No existing credentials found in database. Ready for new configuration.');
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching credentials from SQL database:', error);
      setMessage(`❌ Failed to load from SQL database: ${error.message}`);
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

  // Delete a specific credential
  const deleteCredential = async (credentialId) => {
    if (!credentialId) return;
    
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this credential configuration? This action cannot be undone.'
    );
    
    if (!confirmDelete) return;
    
    setMessage('🗑️ Deleting credential...');
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/credentials/${credentialId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        setMessage('✅ Credential deleted successfully!');
        
        // If we deleted the currently loaded credential, create a new one
        if (currentCredentialId === credentialId) {
          createNewCredential();
        }
        
        // Refresh the credentials list
        setTimeout(() => {
          fetchCredentialsList();
        }, 1000);
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to delete credential: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting credential:', error);
      setMessage(`❌ Error deleting credential: ${error.message}`);
    }
    
    setTimeout(() => setMessage(''), 5000);
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
      db_port: '3306',
      db_name: '',
      db_username: '',
      db_password: '',
      db_type: 'mysql',
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

  // Test the set-all-credentials API with dummy data
  const testBulkCredentialsAPI = async () => {
    console.log('🧪 TESTING BULK CREDENTIALS API with dummy data...');
    setMessage('🧪 Testing bulk credentials API with dummy data...');
    
    setTimeout(async () => {
      try {
        // Comprehensive dummy data for bulk API testing
        const dummyBulkData = {
          name: 'API Test - Bulk Credentials',
          description: 'Testing bulk credentials API endpoint with dummy data',
          environment: 'testing',
          is_active: true,
          
          openai: {
            api_key: 'sk-test1234567890abcdef1234567890abcdef1234567890abcdef',
            organization: 'org-test123456789',
            model: 'gpt-4',
            max_tokens: 4000,
            temperature: 0.7
          },
          
          aws: {
            access_key_id: 'AKIATEST1234567890AB',
            secret_access_key: 'testSecretKey1234567890abcdef1234567890abcdef',
            region: 'us-east-1',
            bucket_name: 'test-bulk-api-bucket',
            default_acl: 'private'
          },
          
          database: {
            type: 'mysql',
            host: '127.0.0.1',
            port: 3306,
            name: 'test_bulk_database',
            username: 'test_bulk_user',
            password: 'test_bulk_password_123',
            ssl_mode: 'prefer',
            connection_timeout: 30
          },
          
          settings: {
            auto_backup: true,
            encryption_enabled: true,
            audit_logging: true,
            credential_rotation_days: 90
          }
        };

        console.log('🧪 Testing bulk API with data:', dummyBulkData);

        const response = await fetch('http://127.0.0.1:8000/api/set-all-credentials/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(dummyBulkData)
        });

        const responseData = await response.json();
        console.log('🧪 Bulk API Test Response:', responseData);

        if (response.ok) {
          setMessage('✅ Bulk Credentials API Test Successful! All credentials set via bulk endpoint.');
          console.log('🎉 Bulk API Success Response:', responseData);
          
          // Auto-refresh after successful bulk test
          setTimeout(() => {
            console.log('🔄 Auto-refreshing after bulk API test...');
            fetchCredentialsConfig();
            fetchCredentialsList();
          }, 1500);
        } else {
          console.error('❌ Bulk API Test Error Response:', responseData);
          let errorMessage = 'Bulk API test failed';
          
          if (responseData.errors) {
            const errorDetails = Object.entries(responseData.errors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            errorMessage = `Bulk API validation errors: ${errorDetails}`;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          }
          
          setMessage(`❌ Bulk API Test Failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error('❌ Bulk API Test Error:', error);
        setMessage(`❌ Bulk API Test Error: ${error.message}`);
      }
    }, 2000);
    
    setTimeout(() => setMessage(''), 15000);
  };

  // Test credentials connection
  const testCredentialsConnection = async () => {
    setMessage('🧪 Testing credentials connection...');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/credentials/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          credential_name: credentialsConfig.credential_name,
          test_type: 'connection'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('✅ Credentials test successful!');
      } else {
        setMessage(`❌ Credentials test failed: ${result.message || result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Test failed: ${error.message}`);
    }
    
    setTimeout(() => setMessage(''), 5000);
  };

  // Fill dummy credentials and test API
  const testWithDummyCredentials = async () => {
    setMessage('🎯 Setting up dummy credentials for API testing...');
    
    // Fill form with dummy data
    const dummyConfig = {
      credential_name: 'Test Config - 2025-09-25',
      credential_type: 'general',
      description: 'Dummy credentials for API testing',
      environment: 'development',
      is_active: true,
      is_default: false,
      
      // Dummy OpenAI Configuration
      openai_api_key: 'sk-proj-dummy123456789abcdef',
      openai_organization: 'org-test123456789',
      
      // Dummy AWS Configuration  
      aws_access_key_id: 'AKIAIOSFODNN7EXAMPLE',
      aws_secret_access_key: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      aws_region: 'us-west-2',
      aws_bucket_name: 'test-dummy-bucket',
      
      // Dummy Database Configuration
      db_host: 'test-db.example.com',
      db_port: '3306',
      db_name: 'test_database',
      db_username: 'test_user',
      db_password: 'test_password_123',
      db_type: 'mysql'
    };
    
    // Update form with dummy data
    setCredentialsConfig(dummyConfig);
    setHasChanges(true);
    
    setMessage('✅ Dummy credentials loaded! Ready to test API...');
    
    // Wait 2 seconds then automatically test the API
    setTimeout(async () => {
      setMessage('🚀 Testing API with dummy credentials...');
      
      try {
        // Prepare data for API - same format as saveCredentialsConfig
        const testData = {
          name: dummyConfig.credential_name,
          credential_type: 'general',
          description: dummyConfig.description,
          environment: dummyConfig.environment,
          is_active: dummyConfig.is_active,
          is_production: dummyConfig.is_default,
          
          // OpenAI Configuration
          openai_api_key: dummyConfig.openai_api_key,
          openai_organization: dummyConfig.openai_organization,
          
          // AWS Configuration  
          aws_access_key_id: dummyConfig.aws_access_key_id,
          aws_secret_access_key: dummyConfig.aws_secret_access_key,
          aws_region: dummyConfig.aws_region,
          aws_bucket_name: dummyConfig.aws_bucket_name,
          
          // Database Configuration
          db_host: dummyConfig.db_host,
          db_port: dummyConfig.db_port,
          db_name: dummyConfig.db_name,
          db_username: dummyConfig.db_username,
          db_password: dummyConfig.db_password,
          db_type: dummyConfig.db_type,
          
          // Additional configuration
          additional_config: {
            model: 'gpt-4',
            max_tokens: 4000,
            temperature: 0.7,
            ssl_mode: 'prefer',
            connection_timeout: 30,
            default_acl: 'private'
          }
        };

        console.log('🧪 Testing API with dummy data:', testData);

        // API call to test credentials using POST method
        const response = await fetch('http://127.0.0.1:8000/api/credentials/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(testData)
        });

        const responseData = await response.json();
        console.log('🧪 API Test Response:', responseData);

        if (response.ok) {
          setMessage('✅ API Test Successful! Dummy credentials saved to SQL database.');
          console.log('🎉 Success Response:', responseData);
        } else {
          console.error('❌ API Test Error Response:', responseData);
          let errorMessage = 'API test failed';
          
          if (responseData.errors) {
            const errorDetails = Object.entries(responseData.errors)
              .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
              .join('; ');
            errorMessage = `API validation errors: ${errorDetails}`;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          }
          
          setMessage(`❌ API Test Failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error('❌ API Test Error:', error);
        setMessage(`❌ API Test Error: ${error.message}`);
      }
    }, 2000);
    
    setTimeout(() => setMessage(''), 10000);
  };

  // Load configuration on component mount
  useEffect(() => {
    fetchCredentialsConfig();
    fetchCredentialsList();
  }, []);

  return (
    <DashboardLayout headerTitle="Credentials Settings" headerBreadcrumb="Settings › Credentials">
      <SettingsWrapper isDarkMode={isDarkMode} ref={settingsRef}>
        <SettingsContainer>
          <SettingsHeader>
            <SettingsTitle isDarkMode={isDarkMode}>🔐 API Keys & Credentials</SettingsTitle>
            <SettingsSubtitle isDarkMode={isDarkMode}>
              Manage OpenAI, AWS, database, and email service credentials securely. Data is saved to SQL database via http://127.0.0.1:8000/api/credentials/
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
                    placeholder="Production Config - 2025-09-25"
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
                    placeholder="org-company123456789"
                    style={{
                      borderColor: credentialsConfig.openai_organization ? '#10b981' : undefined
                    }}
                  />
                  <small style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: '0.8rem' }}>
                    Organization: {credentialsConfig.openai_organization || 'org-company123456789'}
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
                    placeholder="company-production-bucket"
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
                    placeholder="92.113.22.65"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Port</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.db_port}
                    onChange={(e) => updateCredentialsConfig('db_port', e.target.value)}
                    placeholder="3306"
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
                    placeholder="u906714182_sqlrrefdvdv"
                  />
                </FormField>
                <FormField>
                  <Label isDarkMode={isDarkMode}>Database Username</Label>
                  <Input
                    isDarkMode={isDarkMode}
                    value={credentialsConfig.db_username}
                    onChange={(e) => updateCredentialsConfig('db_username', e.target.value)}
                    placeholder="u906714182_root"
                  />
                </FormField>
              </FormGrid>

              <FormGrid columns="1fr">
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
                  
                  {/* Delete button - only show if editing existing credential */}
                  {!isCreatingNew && currentCredentialId && (
                    <Button
                      variant="outline"
                      isDarkMode={isDarkMode}
                      onClick={() => deleteCredential(currentCredentialId)}
                      disabled={savingConfig || fetchingConfig}
                      style={{ 
                        fontSize: '0.875rem', 
                        padding: '0.5rem 1rem',
                        background: '#dc2626',
                        borderColor: '#dc2626',
                        color: 'white'
                      }}
                    >
                      🗑️ Delete
                    </Button>
                  )}
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
                    onClick={handleSaveButtonClick}
                    disabled={savingConfig || fetchingConfig}
                    style={{ 
                      fontSize: '1rem', 
                      padding: '0.75rem 2rem',
                      background: hasChanges ? '#10b981' : undefined,
                      animation: hasChanges ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {savingConfig 
                      ? (isCreatingNew ? '💾 Creating New Credential...' : '💾 Updating Credential...') 
                      : hasChanges 
                        ? (isCreatingNew ? '💾 Create New Credential' : '💾 Update Credential')
                        : '💾 Save Credentials'
                    }
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
                  <div>🤖 OpenAI: {servicesStatus.openai ? '✅ Configured' : (credentialsConfig.openai_api_key ? '⚠️ Local Only' : '❌ Not set')}</div>
                  <div>☁️ AWS: {servicesStatus.aws ? '✅ Configured' : (credentialsConfig.aws_access_key_id ? '⚠️ Local Only' : '❌ Not set')}</div>
                  <div>🗄️ MySQL: {servicesStatus.mysql ? '✅ Configured' : (credentialsConfig.db_host ? '⚠️ Local Only' : '❌ Not set')}</div>
                  <div>📊 CRM: {servicesStatus.crm ? '✅ Configured' : '❌ Not configured'}</div>
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