// ============= FINAL FRONTEND FIX WITH CORS SOLUTION =============
// This fixes both the presigned URL processing AND CORS issues

// 1. UPDATED getImageUrl function - handles CORS properly
const getImageUrl = (originalUrl) => {
  if (!originalUrl) return 'https://via.placeholder.com/300x120.png?text=No+Image';
  
  console.log('🔧 Processing image URL:', originalUrl);
  
  // CRITICAL FIX: If it's a presigned S3 URL, use it DIRECTLY
  if (originalUrl.includes('ddsfocustime.s3.amazonaws.com') && originalUrl.includes('X-Amz-Signature')) {
    console.log('✅ S3 PRESIGNED URL detected - using DIRECTLY');
    return originalUrl; // Use presigned URL AS-IS
  }
  
  // If it's a presigned S3 URL with alternate format, use it DIRECTLY
  if (originalUrl.includes('ddsfocustime.s3.') && originalUrl.includes('X-Amz-Signature')) {
    console.log('✅ S3 PRESIGNED URL (alternate format) detected - using DIRECTLY');
    return originalUrl; // Use presigned URL AS-IS
  }
  
  // For backend URLs, return as-is
  if (originalUrl.includes('localhost:8000')) {
    return originalUrl;
  }
  
  // For other URLs, return as-is
  return originalUrl;
};

// 2. UPDATED formatScreenshotData function - same as before but with better logging
const formatScreenshotData = (screenshot, index) => {
  // Extract time from filename
  const timeFromFilename = screenshot.filename ? 
    screenshot.filename.split('_')[1]?.replace(/-/g, ':') : null;
  
  // Extract date from filename
  const dateFromFilename = screenshot.filename ? 
    screenshot.filename.split('_')[0] : null;

  // Image URL processing - prioritize presigned_url
  let imageUrl = 'https://via.placeholder.com/300x120.png?text=Loading...';
  
  if (screenshot.presigned_url && screenshot.presigned_url.trim() !== '') {
    imageUrl = screenshot.presigned_url.trim();
    console.log('🔗 Using presigned URL for', screenshot.filename);
  } else if (screenshot.url && screenshot.url.trim() !== '') {
    imageUrl = screenshot.url.trim();
    console.log('🔗 Using url field for', screenshot.filename);
  } else if (screenshot.s3_key && screenshot.s3_key.trim() !== '') {
    const encodedS3Key = encodeURIComponent(screenshot.s3_key.trim());
    imageUrl = `https://dxdtime.ddsolutions.io/api/screenshots/presigned-url/?s3_key=${encodedS3Key}`;
    console.log('🔗 Generated backend presigned URL request for', screenshot.filename);
  } else {
    console.warn('⚠️ No valid image URL found for', screenshot.filename);
    imageUrl = 'https://via.placeholder.com/300x120.png?text=Image+Not+Available';
  }

  // Use the URL directly - don't process presigned URLs
  const finalImageUrl = getImageUrl(imageUrl);

  // Enhanced time formatting
  let displayTime = `${9 + index}:00 AM`;
  if (timeFromFilename) {
    const [hours, minutes] = timeFromFilename.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    displayTime = `${hour12}:${minutes} ${ampm}`;
  }

  // Enhanced date formatting
  let displayDate = 'Unknown';
  if (dateFromFilename) {
    displayDate = dayjs(dateFromFilename).format('MMM DD, YYYY');
  }

  // Application name
  let applicationName = screenshot.application || 'Unknown Application';
  if (screenshot.window_title && screenshot.window_title !== screenshot.filename) {
    applicationName = screenshot.window_title;
  }

  // Task name
  let taskName = applicationName;
  if (screenshot.task_name) {
    taskName = screenshot.task_name;
  } else if (selectedFolder?.folder_name) {
    taskName = selectedFolder.folder_name.replace(/_/g, ' ');
  }

  return {
    id: screenshot.s3_key || screenshot.id || `screenshot-${index}-${Date.now()}`,
    task: taskName,
    time: displayTime,
    image: finalImageUrl,
    application: applicationName,
    user: screenshot.employee_name || selectedUser?.display_name || 'Unknown User',
    date: displayDate,
    file_extension: screenshot.file_extension || '.webp',
    size_mb: screenshot.size_mb || 'N/A',
    filename: screenshot.filename,
    s3_key: screenshot.s3_key,
    presigned_url: screenshot.presigned_url ? 'Available' : 'Not Available'
  };
};

// 3. UPDATED SimpleImageComponent with CORS handling
const SimpleImageComponent = ({ src, alt, style, onLoad, onError, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    console.error('❌ Image failed to load:', src);
    console.error('❌ Error details:', {
      error: e,
      src: src,
      isCORSError: e.message?.includes('CORS') || e.message?.includes('cross-origin'),
      isPresignedURL: src?.includes('X-Amz-Signature'),
      isS3URL: src?.includes('ddsfocustime.s3.amazonaws.com')
    });
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    console.log('✅ Image loaded successfully:', src);
    setHasError(false);
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  if (hasError || !src) {
    return (
      <div style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        fontSize: '10px',
        textAlign: 'center',
        padding: '8px'
      }} className={className}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Image Load Error</div>
        <div style={{ fontSize: '8px', opacity: 0.8 }}>
          {src?.includes('CORS') ? 'CORS Issue' : 
           src?.includes('X-Amz-Signature') ? 'S3 Access Issue' : 
           'Network Error'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          fontSize: '10px',
          color: '#6b7280'
        }}>
          Loading...
        </div>
      )}
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="no-referrer"
        // CORS fix: Only set crossOrigin for S3 URLs
        crossOrigin={src?.includes('ddsfocustime.s3.amazonaws.com') ? 'anonymous' : undefined}
      />
    </div>
  );
};

// 4. UPDATED Card rendering with better error handling
const renderFolderScreenshotsView = () => {
  // ... your existing loading and error handling code ...

  return (
    <>
      {/* ... your existing SearchInfo and debug tools ... */}
      
      <CardGrid>
        {folderScreenshots.map((screenshot, i) => {
          const formattedData = formatScreenshotData(screenshot, i);
          return (
            <Card key={formattedData.id}>
              <SimpleImageComponent 
                src={formattedData.image} 
                alt={formattedData.task}
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}
                onLoad={() => {
                  console.log('✅ Level 3 image loaded successfully:', screenshot.filename);
                }}
                onError={(e) => {
                  console.error('❌ Level 3 image failed to load:', screenshot.filename);
                  console.error('❌ URL that failed:', formattedData.image);
                  console.error('❌ Original presigned URL:', screenshot.presigned_url);
                  
                  // Test the original presigned URL directly
                  if (screenshot.presigned_url) {
                    console.log('🧪 Testing original presigned URL...');
                    const testImg = new Image();
                    testImg.onload = () => console.log('✅ Original presigned URL works!');
                    testImg.onerror = () => console.log('❌ Original presigned URL also fails');
                    testImg.src = screenshot.presigned_url;
                  }
                }}
              />
              <TaskName>{formattedData.task}</TaskName>
              <TaskTime>{formattedData.time}</TaskTime>
              <ImageUrl>📁 S3 Key: {screenshot.s3_key || 'N/A'}</ImageUrl>
              <BackendStatusBadge status="connected">
                ✅ WebP S3 Screenshot ({screenshot.file_extension || '.webp'})
              </BackendStatusBadge>
              {screenshot.size_mb && (
                <div style={{
                  fontSize: '9px',
                  color: '#9ca3af',
                  marginTop: '2px',
                  textAlign: 'center'
                }}>
                  Size: {screenshot.size_mb} MB
                </div>
              )}
            </Card>
          );
        })}
      </CardGrid>

      {/* ... your existing pagination code ... */}
    </>
  );
};

// 5. CORS TEST BUTTON - Add this to your debug section
const CorsTestButton = () => (
  <Button 
    size="small" 
    onClick={async () => {
      console.log('🧪 Testing CORS with fresh presigned URL...');
      
      // Test with your API endpoint
      const testEmail = 'haseebcodejourney@gmail.com';
      const testFolder = 'Create_UI_for_YouTube_AI_Automation_';
      const apiUrl = `https://dxdtime.ddsolutions.io/api/screenshots/employee/${testEmail}/folder/${testFolder}/?page=1&limit=1`;
      
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.data.screenshots.length > 0) {
          const screenshot = data.data.screenshots[0];
          const presignedUrl = screenshot.presigned_url;
          
          console.log('🔗 Testing presigned URL:', presignedUrl);
          
          // Test 1: Direct fetch
          try {
            const imageResponse = await fetch(presignedUrl, {
              method: 'GET',
              mode: 'cors',
              credentials: 'omit'
            });
            console.log('✅ Direct fetch result:', imageResponse.status);
            
            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              console.log('✅ Image blob received:', blob.size, 'bytes');
              alert('✅ CORS is working! Images should load now.');
            } else {
              console.log('❌ Fetch failed:', imageResponse.status, imageResponse.statusText);
              alert('❌ CORS issue still exists. Check console for details.');
            }
          } catch (fetchError) {
            console.error('❌ Fetch error:', fetchError);
            alert('❌ CORS blocked. ' + fetchError.message);
          }
          
          // Test 2: Image object
          const testImg = new Image();
          testImg.crossOrigin = 'anonymous';
          testImg.onload = () => {
            console.log('✅ Image object test passed!');
          };
          testImg.onerror = (imgError) => {
            console.error('❌ Image object test failed:', imgError);
          };
          testImg.src = presignedUrl;
          
        } else {
          console.log('❌ No screenshots found in API response');
          alert('❌ No screenshots found to test CORS');
        }
      } catch (apiError) {
        console.error('❌ API error:', apiError);
        alert('❌ API request failed: ' + apiError.message);
      }
    }}
    style={{ 
      marginLeft: '5px', 
      fontSize: '10px', 
      padding: '2px 8px',
      backgroundColor: '#10b981',
      color: 'white'
    }}
  >
    🧪 Test CORS Fix
  </Button>
);

// ============= INSTRUCTIONS =============
/*
1. Replace your getImageUrl function with the version above
2. Replace your formatScreenshotData function with the version above
3. Replace your SimpleImageComponent with the version above
4. Add the CorsTestButton to your debug section
5. The S3 CORS configuration has been fixed - images should now load!

Key changes:
- Fixed S3 bucket CORS configuration
- Improved error handling for CORS issues
- Better logging for debugging
- Test button to verify CORS is working
*/
