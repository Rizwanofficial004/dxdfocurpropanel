import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: false // Changed to false since we're using proxy
});

// Axios request interceptor
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authService = {
    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/auth/register/', {
                email: userData.email,
                username: userData.username,
                password: userData.password,
                organization_name: userData.organizationName,
                country: userData.country
            });
            return response.data;
        } catch (error) {
            console.error('❌ API registration error:', error);
            if (error.response) {
                throw error.response.data;
            } else if (error.request) {
                throw {
                    success: false,
                    message: 'No response from server. Please check your internet connection.',
                    errors: {
                        network: ['Unable to reach the server']
                    }
                };
            } else {
                throw {
                    success: false,
                    message: 'Registration failed. Please try again.',
                    errors: {
                        request: [error.message]
                    }
                };
            }
        }
    },

    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/auth/login/', {
                username: credentials.username.includes('@') ? credentials.username : `${credentials.username}@test.com`,
                password: credentials.password
            });
            
            if (response.data.success) {
                // Store the token if provided in the response
                if (response.data.token) {
                    localStorage.setItem('auth_token', response.data.token);
                }

                // Store user data
                const userData = {
                    id: response.data.data.id,
                    username: response.data.data.username,
                    email: response.data.data.email,
                    firstName: response.data.data.first_name,
                    lastName: response.data.data.last_name,
                    role: response.data.data.role,
                    isStaff: response.data.data.is_staff,
                    isActive: response.data.data.is_active,
                    permissions: response.data.data.permissions,
                    lastLogin: response.data.data.last_login,
                    dateJoined: response.data.data.date_joined
                };
                localStorage.setItem('user_data', JSON.stringify(userData));
            }
            
            return response.data;
        } catch (error) {
            console.error('❌ API login error:', error);
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                throw error.response.data;
            } else if (error.request) {
                // The request was made but no response was received
                throw {
                    success: false,
                    message: 'No response from server. Please check your internet connection.',
                    errors: {
                        network: ['Unable to reach the server']
                    }
                };
            } else {
                // Something happened in setting up the request that triggered an Error
                throw {
                    success: false,
                    message: 'Request failed. Please try again.',
                    errors: {
                        request: [error.message]
                    }
                };
            }
        }
    },

    logout: async () => {
        try {
            // Clear all auth-related data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            
            // Optional: Call logout endpoint if your API has one
            // await axios.post(`${API_BASE_URL}/auth/logout/`);
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // Helper method to check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('auth_token');
    },

    // Helper method to get current user data
    getCurrentUser: () => {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }
};
