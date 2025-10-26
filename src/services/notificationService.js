/**
 * Notification Service
 * Handles API calls for folder-message notifications
 * API Endpoint: https://dxdtime.ddsolutions.io/api/folder-message/
 */

import { getApiBaseURL } from '../config/api';

class NotificationService {
  constructor() {
    this.baseUrl = `${getApiBaseURL()}/folder-message/`;
    this.listeners = new Set();
    this.pollingInterval = null;
    this.lastCheck = null;
    this.isPolling = false;
  }

  /**
   * Fetch folder-message data
   * This API call triggers an event on the backend
   * @returns {Promise<Object>} API response
   */
  async checkForNotifications() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📬 Folder-message API response:', data);
      
      // Update last check time
      this.lastCheck = new Date();
      
      // Notify all listeners
      this.notifyListeners(data);
      
      return data;

    } catch (error) {
      console.error('❌ Folder-message API error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notification events
   * @param {Function} callback - Function to call when notification is received
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    console.log('🔔 New notification listener subscribed. Total listeners:', this.listeners.size);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      console.log('🔕 Notification listener unsubscribed. Total listeners:', this.listeners.size);
    };
  }

  /**
   * Notify all subscribed listeners
   * @param {Object} data - Notification data
   */
  notifyListeners(data) {
    console.log(`📢 Notifying ${this.listeners.size} listeners with data:`, data);
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Error in notification listener:', error);
      }
    });
  }

  /**
   * Start polling for notifications
   * @param {number} intervalMs - Polling interval in milliseconds (default: 60000 = 1 minute)
   */
  startPolling(intervalMs = 60000) {
    if (this.isPolling) {
      console.log('⚠️ Polling already started');
      return;
    }

    console.log(`🔄 Starting notification polling every ${intervalMs / 1000} seconds`);
    this.isPolling = true;

    // Initial check
    this.checkForNotifications().catch(err => {
      console.error('❌ Initial notification check failed:', err);
    });

    // Set up interval
    this.pollingInterval = setInterval(() => {
      this.checkForNotifications().catch(err => {
        console.error('❌ Notification polling check failed:', err);
      });
    }, intervalMs);
  }

  /**
   * Stop polling for notifications
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isPolling = false;
      console.log('🛑 Notification polling stopped');
    }
  }

  /**
   * Get last check time
   * @returns {Date|null} Last check time
   */
  getLastCheck() {
    return this.lastCheck;
  }

  /**
   * Check if currently polling
   * @returns {boolean} Polling status
   */
  isPollinging() {
    return this.isPolling;
  }

  /**
   * Manually trigger a notification check
   * @returns {Promise<Object>} API response
   */
  async manualCheck() {
    console.log('🔍 Manual notification check triggered');
    return this.checkForNotifications();
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;
