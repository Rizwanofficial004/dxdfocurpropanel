import React, { useState } from 'react';
import liveTrackingService from '../../services/liveTrackingService';

/**
 * Live Tracking API Demo Component
 * Demonstrates how to use the Live Tracking Service
 */
const LiveTrackingAPIDemo = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [date, setDate] = useState('2025-09-04');
  const [limit, setLimit] = useState(10);
  const [screenshots, setScreenshots] = useState([]);
  const [summary, setSummary] = useState(null);

  /**
   * Fetch screenshots with default settings
   */
  const fetchDefaultScreenshots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await liveTrackingService.getScreenshots();
      setResponse(data);
      
      // Parse and display
      const parsed = liveTrackingService.parseScreenshots(data);
      const summaryData = liveTrackingService.getSummary(data);
      
      setScreenshots(parsed);
      setSummary(summaryData);
      
      console.log('✅ Fetched screenshots:', parsed);
      console.log('📊 Summary:', summaryData);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch screenshots by date
   */
  const fetchByDate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await liveTrackingService.getScreenshotsByDate(date, {
        limit_screenshots: parseInt(limit)
      });
      setResponse(data);
      
      const parsed = liveTrackingService.parseScreenshots(data);
      const summaryData = liveTrackingService.getSummary(data);
      
      setScreenshots(parsed);
      setSummary(summaryData);
      
      console.log(`✅ Fetched screenshots for ${date}:`, parsed);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch metadata only (faster)
   */
  const fetchMetadataOnly = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await liveTrackingService.getMetadataOnly();
      setResponse(data);
      
      const summaryData = liveTrackingService.getSummary(data);
      setSummary(summaryData);
      setScreenshots([]);
      
      console.log('✅ Fetched metadata only');
      console.log('📊 Summary:', summaryData);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test S3 connection
   */
  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await liveTrackingService.testS3Connection();
      setResponse(result);
      console.log('✅ S3 Connection Test:', result);
    } catch (err) {
      setError(err.message);
      console.error('❌ S3 Connection Test Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch with custom filters
   */
  const fetchFiltered = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await liveTrackingService.getFilteredScreenshots({
        page: 1,
        limit: parseInt(limit),
        date: date || null,
        sort_by: 'latest_date',
        order: 'desc'
      });
      setResponse(data);
      
      const parsed = liveTrackingService.parseScreenshots(data);
      const summaryData = liveTrackingService.getSummary(data);
      
      setScreenshots(parsed);
      setSummary(summaryData);
      
      console.log('✅ Fetched filtered screenshots:', parsed);
    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🛰️ Live Tracking API Demo</h1>
      <p>This component demonstrates how to use the Live Tracking Service.</p>

      {/* Controls */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Controls</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label>Date (YYYY-MM-DD):</label>
            <input 
              type="text" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              placeholder="2025-09-04"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div>
            <label>Limit:</label>
            <input 
              type="number" 
              value={limit} 
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              max="100"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={fetchDefaultScreenshots} disabled={loading}>
            📸 Fetch Default
          </button>
          <button onClick={fetchByDate} disabled={loading}>
            📅 Fetch by Date
          </button>
          <button onClick={fetchMetadataOnly} disabled={loading}>
            📋 Metadata Only
          </button>
          <button onClick={fetchFiltered} disabled={loading}>
            🔍 Fetch Filtered
          </button>
          <button onClick={testConnection} disabled={loading}>
            🧪 Test S3
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>⏳ Loading...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div style={{ 
          background: '#e8f5e9', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>📊 Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <strong>Total Users:</strong> {summary.totalUsers}
            </div>
            <div>
              <strong>Total Files:</strong> {summary.totalFiles}
            </div>
            <div>
              <strong>Total Size:</strong> {summary.totalSize?.toFixed(2)} MB
            </div>
            <div>
              <strong>Region:</strong> {summary.region}
            </div>
            <div>
              <strong>Bucket:</strong> {summary.bucket}
            </div>
            <div>
              <strong>Last Updated:</strong> {new Date(summary.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div>
          <h3>📸 Screenshots ({screenshots.length})</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '15px' 
          }}>
            {screenshots.map((screenshot, index) => (
              <div 
                key={screenshot.id || index}
                style={{ 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  padding: '10px'
                }}
              >
                <img 
                  src={screenshot.url} 
                  alt={screenshot.fileName}
                  style={{ 
                    width: '100%', 
                    height: '150px', 
                    objectFit: 'cover',
                    borderRadius: '4px',
                    marginBottom: '10px'
                  }}
                  onError={(e) => {
                    if (screenshot.fallbackUrl) {
                      e.target.src = screenshot.fallbackUrl;
                    } else {
                      e.target.style.display = 'none';
                    }
                  }}
                />
                <div style={{ fontSize: '12px' }}>
                  <div><strong>Email:</strong> {screenshot.email}</div>
                  <div><strong>Time:</strong> {new Date(screenshot.timestamp).toLocaleString()}</div>
                  <div><strong>Size:</strong> {(screenshot.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                  <div><strong>Files:</strong> {screenshot.metadata.totalFiles}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Response */}
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3>🔍 Raw API Response</h3>
          <details>
            <summary style={{ cursor: 'pointer', padding: '10px', background: '#f5f5f5' }}>
              Click to view raw JSON response
            </summary>
            <pre style={{ 
              background: '#282c34', 
              color: '#61dafb', 
              padding: '15px', 
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Usage Examples */}
      <div style={{ marginTop: '30px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h3>💡 Usage Examples</h3>
        <pre style={{ background: '#282c34', color: '#61dafb', padding: '15px', borderRadius: '8px', overflow: 'auto' }}>
{`// Import the service
import liveTrackingService from './services/liveTrackingService';

// Basic usage
const data = await liveTrackingService.getScreenshots();

// By date
const dateData = await liveTrackingService.getScreenshotsByDate('2025-09-04');

// Metadata only
const metadata = await liveTrackingService.getMetadataOnly();

// With custom options
const custom = await liveTrackingService.getScreenshots({
  limit_screenshots: 20,
  sort_by: 'latest_date',
  order: 'desc'
});

// Parse data
const screenshots = liveTrackingService.parseScreenshots(data);
const summary = liveTrackingService.getSummary(data);`}
        </pre>
      </div>
    </div>
  );
};

export default LiveTrackingAPIDemo;
