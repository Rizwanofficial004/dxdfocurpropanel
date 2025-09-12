// S3 URL Diagnostic Tool
// Add this temporarily to your ActivityPattern component to debug the URLs

export const debugS3Url = (url, fileName) => {
  console.group(`🔍 S3 URL Debug for: ${fileName}`);
  
  console.log('📎 Full URL:', url);
  
  // Parse URL components
  try {
    const urlObj = new URL(url);
    console.log('🏗️ Base URL:', `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`);
    console.log('🔗 Domain:', urlObj.hostname);
    
    // Check for AWS signature parameters
    const params = new URLSearchParams(urlObj.search);
    
    console.log('📋 Query Parameters:');
    for (const [key, value] of params) {
      if (key.includes('Signature') || key.includes('Algorithm') || key.includes('Credential')) {
        console.log(`   🔐 ${key}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`   📝 ${key}: ${value}`);
      }
    }
    
    // Check signature version
    if (params.has('X-Amz-Algorithm')) {
      const algorithm = params.get('X-Amz-Algorithm');
      console.log('✅ Signature Version:', algorithm);
      
      if (algorithm !== 'AWS4-HMAC-SHA256') {
        console.warn('⚠️ WARNING: Using old signature version! Should be AWS4-HMAC-SHA256');
      }
    } else if (params.has('AWSAccessKeyId')) {
      console.warn('⚠️ WARNING: Using Signature V2 (deprecated)! Should use Signature V4');
    } else {
      console.error('❌ ERROR: No AWS signature parameters found!');
    }
    
    // Check expiration
    if (params.has('X-Amz-Expires')) {
      const expires = parseInt(params.get('X-Amz-Expires'));
      console.log(`⏰ URL expires in: ${expires} seconds`);
    } else if (params.has('Expires')) {
      const expires = new Date(parseInt(params.get('Expires')) * 1000);
      console.log(`⏰ URL expires at: ${expires.toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to parse URL:', error);
  }
  
  console.groupEnd();
};

// Usage: Add this line in your handleDownload function right after getting the downloadUrl:
// debugS3Url(downloadUrl, log.file_name);
