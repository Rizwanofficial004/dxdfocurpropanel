import axios from 'axios';

// Configuration API for Django backend
const CONFIG_API_BASE = '/api';

// Create axios instance for configuration API
const configClient = axios.create({
  baseURL: CONFIG_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
configClient.interceptors.response.use(
  (response) => {
    console.log('Configuration API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Configuration API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Configuration API functions
export const configurationAPI = {
  // GET all configurations
  getAllConfigurations: async () => {
    const response = await configClient.get('/configurations/');
    return response.data;
  },

  // GET configuration by ID
  getConfigurationById: async (id) => {
    const response = await configClient.get(`/configurations/${id}/`);
    return response.data;
  },

  // GET configurations by type (upload, database, aws)
  getConfigurationsByType: async (type) => {
    const response = await configClient.get(`/configurations/type/${type}/`);
    return response.data;
  },

  // GET configuration by name
  getConfigurationByName: async (name) => {
    const encodedName = encodeURIComponent(name);
    const response = await configClient.get(`/configurations/name/${encodedName}/`);
    return response.data;
  },

  // POST create new configuration
  createConfiguration: async (configData) => {
    const response = await configClient.post('/configurations/', configData);
    return response.data;
  },

  // PUT update configuration
  updateConfiguration: async (id, configData) => {
    const response = await configClient.put(`/configurations/${id}/`, configData);
    return response.data;
  },

  // DELETE configuration
  deleteConfiguration: async (id) => {
    const response = await configClient.delete(`/configurations/${id}/`);
    return response.data;
  },
};

// Utility functions for specific configuration types
export const uploadConfigAPI = {
  getAll: () => configurationAPI.getConfigurationsByType('upload'),
  create: (data) => configurationAPI.createConfiguration({ ...data, type: 'upload' }),
  update: (id, data) => configurationAPI.updateConfiguration(id, data),
  delete: (id) => configurationAPI.deleteConfiguration(id),
};

export const databaseConfigAPI = {
  getAll: () => configurationAPI.getConfigurationsByType('database'),
  create: (data) => configurationAPI.createConfiguration({ ...data, type: 'database' }),
  update: (id, data) => configurationAPI.updateConfiguration(id, data),
  delete: (id) => configurationAPI.deleteConfiguration(id),
};

export const awsConfigAPI = {
  getAll: () => configurationAPI.getConfigurationsByType('aws'),
  create: (data) => configurationAPI.createConfiguration({ ...data, type: 'aws' }),
  update: (id, data) => configurationAPI.updateConfiguration(id, data),
  delete: (id) => configurationAPI.deleteConfiguration(id),
};

export default configurationAPI;
