// ============= FRONTEND FIX FOR LEVEL 3 API IMAGES =============
// Replace your getImageUrl function with this FIXED version

// FIXED: Add image URL processing function (CORRECTED for direct presigned URLs)
const getImageUrl = (originalUrl) => {
  if (!originalUrl) return 'https://via.placeholder.com/300x120.png?text=No+Image';
  
  console.log('🔧 Processing image URL:', originalUrl);
  
  // CRITICAL FIX: If it's a presigned S3 URL (has AWS signature), use it DIRECTLY
  // DO NOT PROCESS IT AT ALL!
  if (originalUrl.includes('ddsfocustime.s3.amazonaws.com') && originalUrl.includes('X-Amz-Signature')) {
    console.log('✅ S3 PRESIGNED URL detected - using DIRECTLY:', originalUrl.substring(0, 100) + '...');
    return originalUrl; // Use presigned URL AS-IS - don't modify it!
  }
  
  // CRITICAL FIX: If it's a presigned S3 URL with .s3. domain, use it DIRECTLY
  if (originalUrl.includes('ddsfocustime.s3.') && originalUrl.includes('X-Amz-Signature')) {
    console.log('✅ S3 PRESIGNED URL (alternate format) detected - using DIRECTLY:', originalUrl.substring(0, 100) + '...');
    return originalUrl; // Use presigned URL AS-IS - don't modify it!
  }
  
  // If it's a backend presigned URL request, return it as-is
  if (originalUrl.includes('localhost:8000/api/screenshots/presigned-url/')) {
    console.log('🔗 Backend presigned URL request detected:', originalUrl);
    return originalUrl;
  }
  
  // For direct backend URLs, use them as-is
  if (originalUrl.includes('localhost:8000')) {
    console.log('🔗 Backend URL detected:', originalUrl);
    return originalUrl;
  }
  
  // For non-S3 URLs, return as-is
  console.log('🔗 Using direct URL:', originalUrl);
  return originalUrl;
};

// ============= ALSO FIX THE formatScreenshotData FUNCTION =============
// Replace the image URL processing section in formatScreenshotData with this:

const formatScreenshotData = (screenshot, index) => {
  // ... your existing code for time, date, etc. ...
  
  // FIXED: Determine the best image URL - prioritize presigned_url
  let imageUrl = 'https://via.placeholder.com/300x120.png?text=Loading...';
  
  console.log('🔍 Screenshot data:', {
    filename: screenshot.filename,
    has_presigned_url: !!screenshot.presigned_url,
    has_url: !!screenshot.url,
    has_s3_key: !!screenshot.s3_key
  });
  
  if (screenshot.presigned_url && screenshot.presigned_url.trim() !== '') {
    // PRIORITY 1: Use presigned URL directly - it's already perfect!
    imageUrl = screenshot.presigned_url.trim();
    console.log('✅ SUCCESS: Using presigned URL directly:', imageUrl.substring(0, 100) + '...');
  } else if (screenshot.url && screenshot.url.trim() !== '') {
    // PRIORITY 2: Use url field
    imageUrl = screenshot.url.trim();
    console.log('✅ Using URL field:', imageUrl.substring(0, 100) + '...');
  } else if (screenshot.s3_key && screenshot.s3_key.trim() !== '') {
    // PRIORITY 3: Generate backend request for S3 key
    const encodedS3Key = encodeURIComponent(screenshot.s3_key.trim());
    imageUrl = `https://dxdtime.ddsolutions.io/api/screenshots/presigned-url/?s3_key=${encodedS3Key}`;
    console.log('✅ Generated backend presigned URL request:', imageUrl);
  } else {
    console.warn('⚠️ No valid image URL found for screenshot:', screenshot);
    imageUrl = 'https://via.placeholder.com/300x120.png?text=Image+Not+Available';
  }

  // CRITICAL: DO NOT process presigned URLs - use them directly!
  const finalImageUrl = getImageUrl(imageUrl);
  
  console.log('🔧 Final image URL decision:', {
    original: imageUrl.substring(0, 100) + '...',
    final: finalImageUrl.substring(0, 100) + '...',
    isPresigned: finalImageUrl.includes('X-Amz-Signature'),
    shouldWork: finalImageUrl.includes('ddsfocustime.s3.') && finalImageUrl.includes('X-Amz-Signature')
  });

  return {
    // ... your existing return object ...
    image: finalImageUrl, // Use the final URL
    // ... rest of your return object ...
  };
};

// ============= SIMPLIFIED IMAGE COMPONENT =============
// Replace your SimpleImageComponent with this version:

const SimpleImageComponent = ({ src, alt, style, onLoad, onError, className, crossOrigin }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = (e) => {
    console.error('❌ Image failed to load:', imageSrc);
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    console.log('✅ Image loaded successfully:', imageSrc);
    setHasError(false);
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  if (hasError || !imageSrc) {
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
        src={imageSrc}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onLoad={handleLoad}
        onError={handleError}
        referrerPolicy="no-referrer"
        crossOrigin={imageSrc?.includes('ddsfocustime.s3.amazonaws.com') ? 'anonymous' : undefined}
      />
    </div>
  );
};

// ============= USAGE INSTRUCTIONS =============
/*
1. Replace your getImageUrl function with the fixed version above
2. Update your formatScreenshotData function to use the corrected image URL logic
3. Replace your SimpleImageComponent with the simplified version
4. The key fix is: DO NOT process presigned URLs - use them directly!
5. Your Level 3 API is working correctly, the frontend just needs to stop "processing" the URLs

The main issue was that your frontend was trying to proxy/process URLs that were already valid presigned URLs.
*/
