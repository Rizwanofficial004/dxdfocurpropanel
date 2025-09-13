import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { settingsAPI } from '../services/settingsAPI';

const TestContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.md};
`;

const Title = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2rem;
  text-align: center;
`;

const TestSection = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  margin: 0.25rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.pre`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
`;

const SettingsAPITester = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      console.log(`🧪 Running test: ${testName}`);
      const result = await testFunction();
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error(`❌ Test failed: ${testName}`, error);
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const tests = {
    // UI Settings Tests
    'Get UI Settings': () => settingsAPI.getUISettings(),
    'Save UI Settings': () => settingsAPI.saveUISettings({
      setting_name: 'test_theme',
      font_family: 'Arial, sans-serif',
      font_size: '16px',
      primary_color: '#ff6b6b',
      secondary_color: '#4ecdc4',
      background_color: '#f8f9fa',
      text_color: '#343a40',
      theme_mode: 'light',
      sidebar_collapsed: false,
      is_global: true,
      user_id: null
    }),
    'Get Theme by Name': () => settingsAPI.getThemeByName('dashboard_theme'),

    // Credentials Tests
    'Get Credentials': () => settingsAPI.getCredentials(),
    'Save OpenAI Credential': () => settingsAPI.saveCredentials({
      name: 'test_openai',
      credential_type: 'openai',
      description: 'Test OpenAI API credential',
      api_key: 'sk-test123456789',
      is_active: true,
      is_production: false,
      additional_config: {
        model: 'gpt-4',
        max_tokens: 2000,
        temperature: 0.8
      }
    }),
    'Test Credential': () => settingsAPI.testCredential('openai_production'),

    // App Settings Tests
    'Get App Settings': () => settingsAPI.getAppSettings(),
    'Save App Setting': () => settingsAPI.saveAppSettings({
      key: 'test_setting',
      value: 'test_value',
      setting_type: 'string',
      category: 'general',
      description: 'Test application setting',
      is_public: false,
      is_editable: true
    }),
    'Get Settings by Category': () => settingsAPI.getAppSettingsByCategory('general'),

    // Theme Application Test
    'Apply Current Theme': async () => {
      const themeResponse = await settingsAPI.getUISettings();
      if (themeResponse.success && themeResponse.data.length > 0) {
        settingsAPI.applyThemeSettings(themeResponse.data[0]);
        return { message: 'Theme applied successfully', theme: themeResponse.data[0] };
      }
      throw new Error('No theme found to apply');
    }
  };

  const runAllTests = async () => {
    for (const [testName, testFunction] of Object.entries(tests)) {
      await runTest(testName, testFunction);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <TestContainer>
      <Title>🧪 Settings API Tester</Title>
      
      <TestSection>
        <SectionTitle>🚀 Quick Actions</SectionTitle>
        <Button onClick={runAllTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </Button>
        <Button onClick={clearResults} disabled={loading}>
          Clear Results
        </Button>
      </TestSection>

      <TestSection>
        <SectionTitle>🎨 UI Settings Tests</SectionTitle>
        <Button 
          onClick={() => runTest('Get UI Settings', tests['Get UI Settings'])}
          disabled={loading}
        >
          Get UI Settings
        </Button>
        <Button 
          onClick={() => runTest('Save UI Settings', tests['Save UI Settings'])}
          disabled={loading}
        >
          Save Test Theme
        </Button>
        <Button 
          onClick={() => runTest('Get Theme by Name', tests['Get Theme by Name'])}
          disabled={loading}
        >
          Get Theme by Name
        </Button>
        <Button 
          onClick={() => runTest('Apply Current Theme', tests['Apply Current Theme'])}
          disabled={loading}
        >
          Apply Current Theme
        </Button>
      </TestSection>

      <TestSection>
        <SectionTitle>🔐 Credentials Tests</SectionTitle>
        <Button 
          onClick={() => runTest('Get Credentials', tests['Get Credentials'])}
          disabled={loading}
        >
          Get Credentials
        </Button>
        <Button 
          onClick={() => runTest('Save OpenAI Credential', tests['Save OpenAI Credential'])}
          disabled={loading}
        >
          Save Test Credential
        </Button>
        <Button 
          onClick={() => runTest('Test Credential', tests['Test Credential'])}
          disabled={loading}
        >
          Test Credential
        </Button>
      </TestSection>

      <TestSection>
        <SectionTitle>⚙️ App Settings Tests</SectionTitle>
        <Button 
          onClick={() => runTest('Get App Settings', tests['Get App Settings'])}
          disabled={loading}
        >
          Get App Settings
        </Button>
        <Button 
          onClick={() => runTest('Save App Setting', tests['Save App Setting'])}
          disabled={loading}
        >
          Save Test Setting
        </Button>
        <Button 
          onClick={() => runTest('Get Settings by Category', tests['Get Settings by Category'])}
          disabled={loading}
        >
          Get by Category
        </Button>
      </TestSection>

      <TestSection>
        <SectionTitle>📊 Test Results</SectionTitle>
        {Object.keys(results).length === 0 ? (
          <p>No test results yet. Run some tests to see results here.</p>
        ) : (
          Object.entries(results).map(([testName, result]) => (
            <div key={testName} style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                color: result.success ? '#28a745' : '#dc3545',
                marginBottom: '0.5rem'
              }}>
                {result.success ? '✅' : '❌'} {testName}
              </h4>
              <ResultBox>
                {result.success 
                  ? JSON.stringify(result.data, null, 2)
                  : `Error: ${result.error}`
                }
              </ResultBox>
            </div>
          ))
        )}
      </TestSection>
    </TestContainer>
  );
};

export default SettingsAPITester;
