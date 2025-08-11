// 🔍 COMPREHENSIVE DEBUG TEST FOR CONSOLE
// Copy and paste this entire code block into your browser console

console.log('🚀 STARTING COMPREHENSIVE DEBUG TEST');
console.log('🚀 Timestamp:', new Date().toISOString());

// Test 1: Basic console functionality
console.log('✅ Test 1: Console is working');

// Test 2: Check for React app
const reactRoot = document.querySelector('[data-reactroot]') || document.querySelector('#root');
console.log('✅ Test 2: React app found:', !!reactRoot);

// Test 3: Check for ActivityStream component
const activityElements = document.querySelectorAll('*').length;
console.log('✅ Test 3: Total DOM elements:', activityElements);

// Test 4: Look for screenshot cards
const cards = document.querySelectorAll('[style*="position: relative"]');
console.log('✅ Test 4: Found potential screenshot cards:', cards.length);

// Test 5: Check for specific debug buttons
const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent.includes('🔑') || 
  btn.textContent.includes('Log S3') ||
  btn.textContent.includes('Test API')
);
console.log('✅ Test 5: Found debug buttons:', buttons.length);
buttons.forEach((btn, i) => console.log(`  Button ${i + 1}:`, btn.textContent.trim()));

// Test 6: Check for console patterns from our code
const consoleLogs = [];
const originalLog = console.log;
console.log = function(...args) {
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('🔑') || args[0].includes('📸') || args[0].includes('🚀'))) {
    consoleLogs.push(args);
  }
  originalLog.apply(console, args);
};

setTimeout(() => {
  console.log('✅ Test 6: ActivityStream console logs captured:', consoleLogs.length);
  consoleLogs.forEach((log, i) => console.log(`  Log ${i + 1}:`, log));
  
  // Restore original console.log
  console.log = originalLog;
}, 1000);

// Test 7: Check for specific text patterns
const bodyText = document.body.textContent || '';
const hasS3Text = bodyText.includes('S3 Key') || bodyText.includes('s3_key');
const hasScreenshotText = bodyText.includes('screenshot') || bodyText.includes('Screenshot');
const hasProxyText = bodyText.includes('Proxy');

console.log('✅ Test 7: Text content analysis:');
console.log('  - Contains S3 references:', hasS3Text);
console.log('  - Contains screenshot references:', hasScreenshotText);  
console.log('  - Contains proxy references:', hasProxyText);

// Test 8: Try to trigger a debug button if it exists
const debugButton = Array.from(document.querySelectorAll('button')).find(btn => 
  btn.textContent.includes('🔑 Log S3 Keys')
);

if (debugButton) {
  console.log('✅ Test 8: Found "Log S3 Keys" button, attempting to click...');
  debugButton.click();
} else {
  console.log('❌ Test 8: "Log S3 Keys" button not found');
}

// Test 9: Check current URL and path
console.log('✅ Test 9: Current page info:');
console.log('  - URL:', window.location.href);
console.log('  - Path:', window.location.pathname);
console.log('  - Hash:', window.location.hash);

// Test 10: Look for folderScreenshots data in any global scope
console.log('✅ Test 10: Searching for folderScreenshots data...');
const possibleDataSources = ['folderScreenshots', 'screenshots', 'data'];
possibleDataSources.forEach(prop => {
  if (window[prop]) {
    console.log(`  - Found window.${prop}:`, window[prop]);
  }
});

console.log('🚀 COMPREHENSIVE DEBUG TEST COMPLETED');
console.log('📋 Summary: Check the results above to see what is working and what is not');
