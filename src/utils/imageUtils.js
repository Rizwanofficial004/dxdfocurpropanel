// utils/imageUtils.js
export const getOptimalImageProps = (src) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isS3Image = src?.includes('ddsfocustime.s3.amazonaws.com');
  const hasSignature = src?.includes('X-Amz-Signature');
  
  // Only use crossOrigin for signed S3 URLs
  const crossOrigin = isS3Image && hasSignature ? 'anonymous' : undefined;
  
  // Use no-referrer for all external images in production
  const referrerPolicy = isProduction ? 'no-referrer' : 'no-referrer-when-downgrade';
  
  return {
    crossOrigin,
    referrerPolicy,
    // Add loading strategy
    loading: 'lazy',
    // Add decode hint for better performance
    decoding: 'async'
  };
};

export const logImageError = (src, error, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('🖼️ Image Load Error:', {
      src,
      error: error.message || error,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    });
  }
};
