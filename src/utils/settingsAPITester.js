// API Test Utility for Settings
// This file helps test the Settings API endpoints

class SettingsAPITester {
  constructor() {
    this.baseURL = 'https://dxdtime.ddsolutions.io/api/settings';
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message };
    this.results.push(logEntry);
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  async testEndpoint(endpoint, data, description) {
    this.log(`Testing ${description}...`, 'test');
    
    try {
      const response = await fetch(`${this.baseURL}/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (response.ok) {
        this.log(`✅ ${description} - SUCCESS`, 'success');
        this.log(`Response: ${JSON.stringify(result, null, 2)}`, 'response');
        return { success: true, data: result };
      } else {
        this.log(`❌ ${description} - FAILED (${response.status})`, 'error');
        this.log(`Error: ${JSON.stringify(result, null, 2)}`, 'error');
        return { success: false, error: result };
      }
    } catch (error) {
      this.log(`❌ ${description} - NETWORK ERROR`, 'error');
      this.log(`Error: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testUISettings() {
    const testData = {
      setting_name: "test_dashboard_theme",
      font_family: "Arial, sans-serif",
      font_size: "16px",
      primary_color: "#3498db",
      secondary_color: "#2ecc71",
      background_color: "#ffffff",
      text_color: "#2c3e50",
      theme_mode: "light",
      sidebar_collapsed: false,
      is_global: true,
      user_id: null
    };

    return await this.testEndpoint('ui', testData, 'UI Settings API');
  }

  async testOpenAICredentials() {
    const testData = {
      name: "test_openai_config",
      credential_type: "openai",
      description: "Test OpenAI API configuration",
      api_key: "sk-test123456789",
      is_active: true,
      is_production: false,
      additional_config: {
        model: "gpt-4",
        max_tokens: 4000,
        temperature: 0.7
      }
    };

    return await this.testEndpoint('credentials', testData, 'OpenAI Credentials API');
  }

  async testDatabaseCredentials() {
    const testData = {
      name: "test_database_config",
      credential_type: "database",
      description: "Test database configuration",
      is_active: true,
      is_production: false,
      additional_config: {
        host: "localhost",
        port: 5432,
        database: "test_db",
        username: "test_user",
        password: "test_password",
        ssl_mode: "prefer",
        connection_timeout: 30
      }
    };

    return await this.testEndpoint('credentials', testData, 'Database Credentials API');
  }

  async testAWSCredentials() {
    const testData = {
      name: "test_aws_config",
      credential_type: "aws",
      description: "Test AWS S3 storage configuration",
      is_active: true,
      is_production: false,
      additional_config: {
        access_key_id: "AKIATEST123456789",
        secret_access_key: "testSecretKey123456789",
        region: "eu-north-1",
        storage_bucket_name: "test-bucket",
        default_acl: "private",
        custom_domain: ""
      }
    };

    return await this.testEndpoint('credentials', testData, 'AWS Credentials API');
  }

  async runAllTests() {
    this.log('🚀 Starting Settings API Tests...', 'start');
    this.log('=' * 50, 'separator');

    const tests = [
      { name: 'UI Settings', method: () => this.testUISettings() },
      { name: 'OpenAI Credentials', method: () => this.testOpenAICredentials() },
      { name: 'Database Credentials', method: () => this.testDatabaseCredentials() },
      { name: 'AWS Credentials', method: () => this.testAWSCredentials() }
    ];

    const results = {};
    let successCount = 0;

    for (const test of tests) {
      this.log(`\n📋 Running ${test.name} test...`, 'test');
      results[test.name] = await test.method();
      if (results[test.name].success) {
        successCount++;
      }
      this.log(`${'='.repeat(50)}`, 'separator');
    }

    // Summary
    this.log('\n📊 TEST SUMMARY', 'summary');
    this.log(`Total Tests: ${tests.length}`, 'summary');
    this.log(`Passed: ${successCount}`, 'summary');
    this.log(`Failed: ${tests.length - successCount}`, 'summary');
    this.log(`Success Rate: ${((successCount / tests.length) * 100).toFixed(1)}%`, 'summary');

    return results;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        total: this.results.filter(r => r.type === 'test').length,
        passed: this.results.filter(r => r.type === 'success').length,
        failed: this.results.filter(r => r.type === 'error').length
      }
    };

    this.log('\n📄 Generating test report...', 'info');
    return report;
  }
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.SettingsAPITester = SettingsAPITester;
} else if (typeof module !== 'undefined') {
  module.exports = SettingsAPITester;
}

// Usage example:
/*
// In browser console or HTML page:
const tester = new SettingsAPITester();
tester.runAllTests().then(results => {
  console.log('All tests completed:', results);
  const report = tester.generateReport();
  console.log('Full report:', report);
});

// Or test individual endpoints:
const tester = new SettingsAPITester();
tester.testUISettings();
tester.testOpenAICredentials();
*/
