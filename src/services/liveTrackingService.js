/**
 * Live Tracking Service
 * Handles API calls for live tracking screenshots and metadata
 * API Endpoint: https://dxdtime.ddsolutions.io/api/live-tracking/fast-screenshots/
 */

import axios from 'axios';
import { getApiBaseURL } from '../config/api';

/**
 * Live Tracking Service Class
 */
class LiveTrackingService {
  constructor() {
    this.baseUrl = `${getApiBaseURL()}/live-tracking/fast-screenshots/`;
    this.defaultParams = {
      aws_region: 'eu-north-1',
      bucket_name: 'ddsfocustime'
    };
  }

  /**
   * Build API URL with query parameters
   * @param {Object} params - Query parameters
   * @returns {string} Complete API URL
   */
  buildUrl(params = {}) {
    const allParams = { ...this.defaultParams, ...params };
    const urlParams = new URLSearchParams();
    
    Object.entries(allParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlParams.append(key, value);
      }
    });
    
    return `${this.baseUrl}?${urlParams.toString()}`;
  }

  /**
   * Fetch live tracking screenshots
   * @param {Object} options - Request options
   * @param {string} options.date - Date filter (format: YYYY-MM-DD)
   * @param {number} options.limit_screenshots - Limit number of screenshots (default: 10)
   * @param {boolean} options.include_metadata_only - Return only metadata without image data (default: false)
   * @param {string} options.sort_by - Sort field (latest_date, oldest_date)
   * @param {string} options.order - Sort order (asc, desc)
   * @param {string} options.aws_region - AWS region (default: eu-north-1)
   * @param {string} options.bucket_name - S3 bucket name (default: ddsfocustime)
   * @param {number} options.timeout - Request timeout in milliseconds (default: 90000)
   * @returns {Promise<Object>} API response data
   */
  async getScreenshots(options = {}) {
    const {
      date = null,
      limit_screenshots = 10,
      include_metadata_only = false,
      sort_by = 'latest_date',
      order = 'desc',
      aws_region = 'eu-north-1',
      bucket_name = 'ddsfocustime',
      timeout = 90000,
      force_refresh = true
    } = options;

    try {
      const params = {
        limit_screenshots,
        include_metadata_only,
        sort_by,
        order,
        aws_region,
        bucket_name,
        _t: Date.now() // Cache buster
      };

      // Add date filter if provided
      if (date) {
        params.date = date;
      }

      // Add force_refresh if specified
      if (force_refresh) {
        params.force_refresh = true;
      }

      const url = this.buildUrl(params);
      console.log('🔄 Fetching live tracking data from:', url);

      const response = await axios.get(url, {
        timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-AWS-Region': aws_region,
          'X-S3-Bucket': bucket_name
        },
        withCredentials: false
      });

      console.log('✅ Live tracking API response:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Live tracking API error:', error);
      
      // Enhanced error handling
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - S3 operation took too long');
      }
      
      if (error.response) {
        // Server responded with error status
        throw new Error(
          error.response.data?.message || 
          error.response.data?.detail || 
          `API Error: ${error.response.status}`
        );
      }
      
      if (error.request) {
        // Request made but no response
        throw new Error('No response from server - please check your connection');
      }
      
      throw error;
    }
  }

  /**
   * Fetch screenshots for a specific date
   * @param {string} date - Date in format YYYY-MM-DD
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response data
   */
  async getScreenshotsByDate(date, options = {}) {
    return this.getScreenshots({ ...options, date });
  }

  /**
   * Fetch only metadata without screenshot data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response data with metadata only
   */
  async getMetadataOnly(options = {}) {
    return this.getScreenshots({ 
      ...options, 
      include_metadata_only: true 
    });
  }

  /**
   * Test S3 connection
   * @returns {Promise<Object>} S3 connection test results
   */
  async testS3Connection() {
    try {
      console.log('🔍 Testing S3 connection...');
      
      const url = this.buildUrl({ 
        test_s3: true,
        limit_screenshots: 1
      });
      
      const response = await axios.get(url, { 
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ S3 Test Response:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ S3 Connection Test Failed:', error);
      throw error;
    }
  }

  /**
   * Get screenshots with custom filters and pagination
   * @param {Object} filters - Filter parameters
   * @param {number} filters.page - Page number (for pagination)
   * @param {number} filters.limit - Items per page
   * @param {string} filters.date - Date filter
   * @param {string} filters.sort_by - Sort field
   * @param {string} filters.order - Sort order
   * @returns {Promise<Object>} Filtered API response
   */
  async getFilteredScreenshots(filters = {}) {
    const {
      page = 1,
      limit = 10,
      date = null,
      sort_by = 'latest_date',
      order = 'desc'
    } = filters;

    return this.getScreenshots({
      limit_screenshots: limit,
      date,
      sort_by,
      order
    });
  }

  /**
   * Parse and format screenshot data from API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Array} Formatted screenshot array
   */
  parseScreenshots(apiResponse) {
    if (!apiResponse?.data?.s3_users_sample) {
      console.warn('⚠️ No screenshots data in API response');
      return [];
    }

    const screenshots = [];
    
    apiResponse.data.s3_users_sample.forEach(user => {
      // Get the latest screenshot from user's screenshots array
      let screenshotUrl = null;
      let fallbackUrl = null;
      let latestScreenshot = null;
      
      if (user.screenshots && Array.isArray(user.screenshots) && user.screenshots.length > 0) {
        // Sort by last_modified and take the first 3 for performance
        const sortedScreenshots = user.screenshots
          .sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified))
          .slice(0, 3);
        
        latestScreenshot = sortedScreenshots[0];
        screenshotUrl = latestScreenshot.direct_url;
        fallbackUrl = latestScreenshot.file_url;
      }
      
      // Fallback to user-level URLs if no screenshots found
      if (!screenshotUrl) {
        screenshotUrl = user.direct_file_url || user.latest_file_url;
        fallbackUrl = user.latest_file_url || user.direct_file_url;
      }
      
      screenshots.push({
        id: `${user.user_email}_${latestScreenshot?.last_modified || Date.now()}`,
        email: user.user_email,
        timestamp: latestScreenshot?.last_modified || user.last_modified,
        url: screenshotUrl,
        fallbackUrl: fallbackUrl,
        fileSize: latestScreenshot?.size || user.latest_file_size,
        fileName: latestScreenshot?.name || user.latest_file,
        metadata: {
          userEmail: user.user_email,
          totalFiles: user.total_files,
          totalSize: user.total_size,
          latestFileDate: user.latest_file_date,
          screenshotCount: user.screenshots?.length || 0
        }
      });
    });
    
    console.log(`📸 Parsed ${screenshots.length} screenshots from API response`);
    return screenshots;
  }

  /**
   * Get summary statistics from API response
   * @param {Object} apiResponse - Raw API response
   * @returns {Object} Summary statistics
   */
  getSummary(apiResponse) {
    if (!apiResponse?.data) {
      return null;
    }

    return {
      totalUsers: apiResponse.data.s3_users_sample?.length || 0,
      totalSize: apiResponse.data.total_size_mb || 0,
      totalFiles: apiResponse.data.summary?.s3_files || 0,
      lastUpdated: apiResponse.data.summary?.last_updated || new Date().toISOString(),
      dataSource: apiResponse.data.data_sources?.s3_status || 'unknown',
      region: apiResponse.data.aws_region || 'eu-north-1',
      bucket: apiResponse.data.bucket_name || 'ddsfocustime'
    };
  }
}

// Create and export singleton instance
const liveTrackingService = new LiveTrackingService();
export default liveTrackingService;
