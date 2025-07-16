// ============= COMPLETE WORKING FRONTEND FIX =============
// Copy this EXACT code into your React component

// 1. FIXED getImageUrl function - DO NOT process presigned URLs!
const getImageUrl = (originalUrl) => {
  if (!originalUrl) return 'https://via.placeholder.com/300x120.png?text=No+Image';
  
  // CRITICAL FIX: If it's a presigned S3 URL, use it DIRECTLY without ANY processing
  if (originalUrl.includes('ddsfocustime.s3.amazonaws.com') && originalUrl.includes('X-Amz-Signature')) {
    return originalUrl; // Use presigned URL AS-IS - don't modify it!
  }
  
  // If it's a presigned S3 URL with alternate format, use it DIRECTLY
  if (originalUrl.includes('ddsfocustime.s3.') && originalUrl.includes('X-Amz-Signature')) {
    return originalUrl; // Use presigned URL AS-IS - don't modify it!
  }
  
  // For backend URLs, return as-is
  if (originalUrl.includes('localhost:8000')) {
    return originalUrl;
  }
  
  // For other URLs, return as-is
  return originalUrl;
};

// 2. FIXED formatScreenshotData function
const formatScreenshotData = (screenshot, index) => {
  // Extract time from filename
  const timeFromFilename = screenshot.filename ? 
    screenshot.filename.split('_')[1]?.replace(/-/g, ':') : null;
  
  // Extract date from filename
  const dateFromFilename = screenshot.filename ? 
    screenshot.filename.split('_')[0] : null;

  // FIXED: Image URL processing - prioritize presigned_url and don't process it
  let imageUrl = 'https://via.placeholder.com/300x120.png?text=Loading...';
  
  if (screenshot.presigned_url && screenshot.presigned_url.trim() !== '') {
    // PRIORITY 1: Use presigned URL directly - it's already perfect!
    imageUrl = screenshot.presigned_url.trim();
  } else if (screenshot.url && screenshot.url.trim() !== '') {
    // PRIORITY 2: Use url field
    imageUrl = screenshot.url.trim();
  } else if (screenshot.s3_key && screenshot.s3_key.trim() !== '') {
    // PRIORITY 3: Generate backend request for S3 key
    const encodedS3Key = encodeURIComponent(screenshot.s3_key.trim());
    imageUrl = `https://dxdtime.ddsolutions.io/api/screenshots/presigned-url/?s3_key=${encodedS3Key}`;
  } else {
    imageUrl = 'https://via.placeholder.com/300x120.png?text=Image+Not+Available';
  }

  // CRITICAL: Use the URL directly - don't process presigned URLs
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
    image: finalImageUrl, // Use the final URL
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

// 3. FIXED SimpleImageComponent - no complex processing needed
const SimpleImageComponent = ({ src, alt, style, onLoad, onError, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    console.error('❌ Image failed to load:', src);
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
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        fontSize: '10px',
        textAlign: 'center'
      }} className={className}>
        <div>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
          <div>Image Load Error</div>
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
        crossOrigin={src?.includes('ddsfocustime.s3.amazonaws.com') ? 'anonymous' : undefined}
      />
    </div>
  );
};

// 4. FIXED Card rendering in your component
// Replace your Card rendering with this:
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
        onError={() => {
          console.error('❌ Level 3 image failed to load:', screenshot.filename);
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

// ============= INSTRUCTIONS =============
/*
1. Replace your getImageUrl function with the version above
2. Replace your formatScreenshotData function with the version above  
3. Replace your SimpleImageComponent with the version above
4. Update your Card rendering to use the pattern above

The key fix is: DO NOT process presigned URLs - use them directly!
Your Level 3 API is working perfectly, the frontend just needs to stop modifying the URLs.
*/
