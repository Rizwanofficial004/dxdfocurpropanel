const getImageUrl = (originalUrl) => {
  if (!originalUrl) return 'https://via.placeholder.com/300x120.png?text=No+Image';
  
  // If it's a presigned S3 URL, extract the S3 key and use proxy
  if (originalUrl.includes('ddsfocustime.s3.amazonaws.com') && originalUrl.includes('X-Amz-Signature')) {
    const urlParts = originalUrl.split('?')[0];
    const s3Key = urlParts.replace('https://ddsfocustime.s3.amazonaws.com/', '');
    return `https://dxdtime.ddsolutions.io/api/proxy-image/${encodeURIComponent(s3Key)}/`;
  }
  
  // If it's a presigned S3 URL with alternate format, convert to proxy
  if (originalUrl.includes('ddsfocustime.s3.') && originalUrl.includes('X-Amz-Signature')) {
    const urlParts = originalUrl.split('?')[0];
    const s3Key = urlParts.replace(/https:\/\/ddsfocustime\.s3\.[^\/]+\.amazonaws\.com\//, '');
    return `https://dxdtime.ddsolutions.io/api/proxy-image/${encodeURIComponent(s3Key)}/`;
  }
  
  // For backend URLs, return as-is
  if (originalUrl.includes('localhost:8000')) {
    return originalUrl;
  }
  
  return originalUrl;
};

const formatScreenshotData = (screenshot, index) => {
  const timeFromFilename = screenshot.filename ? 
    screenshot.filename.split('_')[1]?.replace(/-/g, ':') : null;
  
  const dateFromFilename = screenshot.filename ? 
    screenshot.filename.split('_')[0] : null;

  let imageUrl = 'https://via.placeholder.com/300x120.png?text=Loading...';
  
  if (screenshot.presigned_url && screenshot.presigned_url.trim() !== '') {
    imageUrl = screenshot.presigned_url.trim();
  } else if (screenshot.url && screenshot.url.trim() !== '') {
    imageUrl = screenshot.url.trim();
  } else if (screenshot.s3_key && screenshot.s3_key.trim() !== '') {
    imageUrl = `https://dxdtime.ddsolutions.io/api/proxy-image/${encodeURIComponent(screenshot.s3_key.trim())}/`;
  } else {
    imageUrl = 'https://via.placeholder.com/300x120.png?text=Image+Not+Available';
  }

  const finalImageUrl = getImageUrl(imageUrl);

  let displayTime = `${9 + index}:00 AM`;
  if (timeFromFilename) {
    const [hours, minutes] = timeFromFilename.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    displayTime = `${hour12}:${minutes} ${ampm}`;
  }

  let displayDate = 'Unknown';
  if (dateFromFilename) {
    displayDate = dayjs(dateFromFilename).format('MMM DD, YYYY');
  }

  let applicationName = screenshot.application || 'Unknown Application';
  if (screenshot.window_title && screenshot.window_title !== screenshot.filename) {
    applicationName = screenshot.window_title;
  }

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

const SimpleImageComponent = ({ src, alt, style, onLoad, onError, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
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
          {src?.includes('localhost:8000/api/proxy-image/') ? 'Backend Proxy Error' : 
           src?.includes('localhost:8000') ? 'Backend Error' : 
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
      />
    </div>
  );
};

const renderFolderScreenshotsView = () => {
  return (
    <>
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
                  console.log('Image loaded successfully:', screenshot.filename);
                }}
                onError={(e) => {
                  console.error('Image failed to load:', screenshot.filename);
                }}
              />
              <TaskName>{formattedData.task}</TaskName>
              <TaskTime>{formattedData.time}</TaskTime>
              <ImageUrl>🔗 Proxy URL: {formattedData.image}</ImageUrl>
              <BackendStatusBadge status="connected">
                ✅ Proxied S3 Screenshot ({screenshot.file_extension || '.webp'})
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
    </>
  );
};

const ProxyTestButton = () => (
  <Button 
    size="small" 
    onClick={async () => {
      console.log('Testing Image Proxy...');
      
      const testEmail = 'haseebcodejourney@gmail.com';
      const testFolder = 'Create_UI_for_YouTube_AI_Automation_';
      const apiUrl = `https://dxdtime.ddsolutions.io/api/screenshots/employee/${testEmail}/folder/${testFolder}/?page=1&limit=1`;
      
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success && data.data.screenshots.length > 0) {
          const screenshot = data.data.screenshots[0];
          const s3Key = screenshot.s3_key;
          const proxyUrl = `https://dxdtime.ddsolutions.io/api/proxy-image/${encodeURIComponent(s3Key)}/`;
          
          try {
            const proxyResponse = await fetch(proxyUrl);
            
            if (proxyResponse.ok) {
              const blob = await proxyResponse.blob();
              alert('✅ Image proxy is working! Images should load now.');
            } else {
              alert('❌ Proxy issue. Check console for details.');
            }
          } catch (proxyError) {
            alert('❌ Proxy request failed: ' + proxyError.message);
          }
          
        } else {
          alert('❌ No screenshots found to test proxy');
        }
      } catch (apiError) {
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
    🧪 Test Image Proxy
  </Button>
);


