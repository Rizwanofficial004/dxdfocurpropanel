import React, { useState } from 'react';

const ImageTest = () => {
  const [testUrl] = useState('https://ddsfocustime.s3.eu-north-1.amazonaws.com/users_screenshots/2025-09-09/haseebcodejourney_at_gmail.com/Wordpress_Website_TRNCNews/2025-09-09_14-33-24.webp');
  const [loadStatus, setLoadStatus] = useState({});
  
  // Get current host for full URLs
  const currentHost = 'http://localhost:5174';

  const testUrls = [
    {
      name: 'Direct S3 URL',
      url: testUrl
    },
    {
      name: 'Direct Path Proxy (/users_screenshots/...)',
      url: `${currentHost}/users_screenshots/2025-09-09/haseebcodejourney_at_gmail.com/Wordpress_Website_TRNCNews/2025-09-09_14-33-24.webp`
    },
    {
      name: 'Image Proxy (/image-proxy/...)',
      url: `${currentHost}/image-proxy/users_screenshots/2025-09-09/haseebcodejourney_at_gmail.com/Wordpress_Website_TRNCNews/2025-09-09_14-33-24.webp`
    },
    {
      name: 'S3 Proxy (filename only)',
      url: `${currentHost}/s3-proxy/2025-09-09_14-33-24.webp`
    }
  ];

  const handleImageLoad = (name) => {
    setLoadStatus(prev => ({ ...prev, [name]: 'loaded' }));
    console.log(`✅ ${name} loaded successfully`);
  };

  const handleImageError = (name) => {
    setLoadStatus(prev => ({ ...prev, [name]: 'failed' }));
    console.log(`❌ ${name} failed to load`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>S3 Image Loading Test</h2>
      <p>Testing different approaches to load S3 images:</p>
      
      {testUrls.map(({ name, url }) => (
        <div key={name} style={{ 
          marginBottom: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '16px' 
        }}>
          <h3>{name}</h3>
          <p style={{ fontSize: '12px', color: '#666', wordBreak: 'break-all' }}>
            URL: {url}
          </p>
          <p>Status: 
            <span style={{ 
              color: loadStatus[name] === 'loaded' ? 'green' : 
                     loadStatus[name] === 'failed' ? 'red' : 'orange',
              fontWeight: 'bold',
              marginLeft: '8px'
            }}>
              {loadStatus[name] || 'loading...'}
            </span>
          </p>
          
          <div style={{ 
            width: '300px', 
            height: '200px', 
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <img
              src={url}
              alt={`Test ${name}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onLoad={() => handleImageLoad(name)}
              onError={() => handleImageError(name)}
            />
          </div>
        </div>
      ))}
      
      <div style={{ marginTop: '30px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Debug Information</h3>
        <p><strong>Original S3 URL:</strong></p>
        <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{testUrl}</code>
        
        <p style={{ marginTop: '16px' }}><strong>Proxy Endpoints:</strong></p>
        <ul>
          <li><code>/image-proxy/</code> - Full path proxy to S3</li>
          <li><code>/s3-proxy/</code> - Filename-only proxy to S3</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageTest;
