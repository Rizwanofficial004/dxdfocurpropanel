// Browser Console Test Script for Settings API
// Copy and paste this into the browser console when on the Settings page

console.log('🧪 Settings API Test Script Loaded');
console.log('====================================');

// Test data objects
const testData = {
  ui: {
    setting_name: "console_test_theme",
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
  },
  openai: {
    name: "console_test_openai",
    credential_type: "openai",
    description: "Console test OpenAI configuration",
    api_key: "sk-console_test_123456789",
    is_active: true,
    is_production: false,
    additional_config: {
      model: "gpt-4",
      max_tokens: 4000,
      temperature: 0.7
    }
  },
  database: {
    name: "console_test_database",
    credential_type: "database",
    description: "Console test database configuration",
    is_active: true,
    is_production: false,
    additional_config: {
      host: "localhost",
      port: 5432,
      database: "console_test_db",
      username: "console_test_user",
      password: "console_test_password",
      ssl_mode: "prefer",
      connection_timeout: 30
    }
  },
  aws: {
    name: "console_test_aws",
    credential_type: "aws",
    description: "Console test AWS configuration",
    is_active: true,
    is_production: false,
    additional_config: {
      access_key_id: "AKIACONSOLETEST123456",
      secret_access_key: "consoleTestSecretKey123456789",
      region: "eu-north-1",
      storage_bucket_name: "console-test-bucket",
      default_acl: "private",
      custom_domain: ""
    }
  }
};

// Test function
async function testSettingsAPI(endpoint, data, description) {
  console.log(`\n🚀 Testing ${description}...`);
  console.log(`📤 Sending to: http://127.0.0.1:8000/api/settings/${endpoint}/`);
  console.log('📋 Data:', data);
  
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/settings/${endpoint}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const result = await response.json();
    console.log('📥 Response:', result);
    
    if (response.ok && result.success) {
      console.log(`✅ ${description} - SUCCESS`);
      return { success: true, data: result };
    } else {
      console.log(`❌ ${description} - FAILED`);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`🚨 ${description} - ERROR:`, error);
    return { success: false, error: error.message };
  }
}

// Individual test functions
async function testUI() {
  return await testSettingsAPI('ui', testData.ui, 'UI Settings');
}

async function testOpenAI() {
  return await testSettingsAPI('credentials', testData.openai, 'OpenAI Credentials');
}

async function testDatabase() {
  return await testSettingsAPI('credentials', testData.database, 'Database Credentials');
}

async function testAWS() {
  return await testSettingsAPI('credentials', testData.aws, 'AWS Credentials');
}

// Run all tests
async function testAll() {
  console.log('\n🔥 Running all Settings API tests...');
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'UI Settings', fn: testUI },
    { name: 'OpenAI Credentials', fn: testOpenAI },
    { name: 'Database Credentials', fn: testDatabase },
    { name: 'AWS Credentials', fn: testAWS }
  ];
  
  const results = {};
  let passed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}:`);
    results[test.name] = await test.fn();
    if (results[test.name].success) passed++;
    console.log('-'.repeat(30));
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`Tests Run: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${tests.length - passed}`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  return results;
}

// Form submission test (simulates actual form submission)
function testFormSubmission(formType) {
  console.log(`\n🎯 Testing ${formType} form submission...`);
  
  const forms = {
    ui: document.getElementById('themeSettingsForm'),
    openai: document.getElementById('openaiCredentialsForm'),
    database: document.getElementById('databaseCredentialsForm'),
    aws: document.getElementById('awsCredentialsForm')
  };
  
  const form = forms[formType];
  if (form) {
    console.log(`📝 Found ${formType} form, triggering submission...`);
    
    // Fill form with test data if needed
    if (formType === 'ui') {
      const inputs = form.querySelectorAll('input, select');
      inputs.forEach(input => {
        if (input.name === 'settingName') input.value = 'test_form_submission';
        if (input.name === 'fontFamily') input.value = 'Arial, sans-serif';
        if (input.name === 'fontSize') input.value = '16px';
        if (input.name === 'primaryColor') input.value = '#3498db';
        if (input.name === 'secondaryColor') input.value = '#2ecc71';
        if (input.name === 'backgroundColor') input.value = '#ffffff';
        if (input.name === 'textColor') input.value = '#2c3e50';
        if (input.name === 'themeMode') input.value = 'light';
        if (input.name === 'isGlobal') input.checked = true;
      });
    }
    
    // Trigger form submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    console.log(`✅ ${formType} form submission triggered`);
  } else {
    console.log(`❌ ${formType} form not found`);
  }
}

// Available commands
console.log('\n📚 Available Commands:');
console.log('- testUI()         : Test UI Settings API');
console.log('- testOpenAI()     : Test OpenAI Credentials API');
console.log('- testDatabase()   : Test Database Credentials API');
console.log('- testAWS()        : Test AWS Credentials API');
console.log('- testAll()        : Run all API tests');
console.log('- testFormSubmission("ui"|"openai"|"database"|"aws") : Test form submission');
console.log('\nExample: testAll().then(results => console.log(results))');
