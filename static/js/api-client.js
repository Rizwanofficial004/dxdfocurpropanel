/**
 * DDS Focus Time API Client
 * Professional JavaScript client for interacting with the APIs
 */

class DDSFocusTimeAPI {
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
        this.isAuthenticated = false;
        this.userInfo = null;
    }

    /**
     * Make an authenticated API request
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            credentials: 'include', // Include cookies for session authentication
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * Login to the application
     */
    async login(username, password) {
        try {
            const response = await this.makeRequest('/auth/login/', {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (response.success) {
                this.isAuthenticated = true;
                this.userInfo = response.data.user;
                console.log('Login successful:', this.userInfo);
                return response;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            this.isAuthenticated = false;
            this.userInfo = null;
            throw error;
        }
    }

    /**
     * Get screenshots with optional filters
     */
    async getScreenshots(options = {}) {
        const {
            email,
            date,
            limit = 50,
            page = 1,
            usePost = false,
            dateRange,
            taskFilter
        } = options;

        try {
            if (usePost) {
                // Use POST for advanced filtering
                const body = {
                    limit,
                    page
                };

                if (email) body.email = email;
                if (date) body.date = date;
                if (dateRange) body.date_range = dateRange;
                if (taskFilter) body.task_filter = taskFilter;

                return await this.makeRequest('/screenshots/', {
                    method: 'POST',
                    body: JSON.stringify(body)
                });
            } else {
                // Use GET for simple filtering
                const params = new URLSearchParams({
                    limit: limit.toString(),
                    page: page.toString()
                });

                if (email) params.append('email', email);
                if (date) params.append('date', date);

                return await this.makeRequest(`/screenshots/?${params}`);
            }
        } catch (error) {
            console.error('Error fetching screenshots:', error);
            throw error;
        }
    }

    /**
     * Get logs with optional filters
     */
    async getLogs(options = {}) {
        const {
            email,
            staffid,
            date,
            search,
            limit = 20,
            page = 1
        } = options;

        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                page: page.toString()
            });

            if (email) params.append('email', email);
            if (staffid) params.append('staffid', staffid.toString());
            if (date) params.append('date', date);
            if (search) params.append('search', search);

            return await this.makeRequest(`/logs/?${params}`);
        } catch (error) {
            console.error('Error fetching logs:', error);
            throw error;
        }
    }

    /**
     * Create a new log entry
     */
    async createLog(staffid, email, jsonlog, date) {
        try {
            return await this.makeRequest('/logs/', {
                method: 'POST',
                body: JSON.stringify({
                    staffid,
                    email,
                    jsonlog,
                    date
                })
            });
        } catch (error) {
            console.error('Error creating log:', error);
            throw error;
        }
    }

    /**
     * Utility method to format date for API
     */
    formatDate(date) {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return date;
    }

    /**
     * Get current user info
     */
    getCurrentUser() {
        return this.userInfo;
    }

    /**
     * Check if user is authenticated
     */
    isLoggedIn() {
        return this.isAuthenticated;
    }
}

// Usage Examples
async function exampleUsage() {
    const api = new DDSFocusTimeAPI();

    try {
        // Login
        await api.login('user@example.com', 'password123');
        console.log('Logged in as:', api.getCurrentUser());

        // Get recent screenshots
        const screenshots = await api.getScreenshots({
            limit: 10,
            page: 1
        });
        console.log('Screenshots:', screenshots);

        // Get screenshots for a specific date
        const todayScreenshots = await api.getScreenshots({
            date: api.formatDate(new Date()),
            limit: 20
        });
        console.log('Today\'s screenshots:', todayScreenshots);

        // Get logs with search
        const logs = await api.getLogs({
            search: 'screenshot',
            limit: 15
        });
        console.log('Logs:', logs);

        // Create a new log
        const newLog = await api.createLog(
            123,
            'user@example.com',
            {
                activity: 'frontend_test',
                timestamp: new Date().toISOString(),
                details: 'Testing API from frontend'
            },
            api.formatDate(new Date())
        );
        console.log('Created log:', newLog);

    } catch (error) {
        console.error('API Error:', error);
    }
}

// DOM Helper Functions for easy integration
class DDSUIHelper {
    static showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
        }
    }

    static hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const loading = element.querySelector('.loading');
            if (loading) loading.remove();
        }
    }

    static displayError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="error">Error: ${message}</div>`;
        }
    }

    static displaySuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="success">Success: ${message}</div>`;
        }
    }

    static createScreenshotCard(screenshot) {
        return `
            <div class="screenshot-card">
                <img src="${screenshot.presigned_url || screenshot.url}" 
                     alt="Screenshot" 
                     class="screenshot-image"
                     onerror="this.src='${screenshot.url}'">
                <div class="screenshot-info">
                    <p><strong>Folder:</strong> ${screenshot.folder}</p>
                    <p><strong>Timestamp:</strong> ${new Date(screenshot.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `;
    }

    static createLogRow(log) {
        return `
            <tr class="log-row">
                <td>${log.id}</td>
                <td>${log.email}</td>
                <td>${log.staffid}</td>
                <td>${log.date}</td>
                <td>
                    <details>
                        <summary>View JSON</summary>
                        <pre>${JSON.stringify(log.jsonlog, null, 2)}</pre>
                    </details>
                </td>
            </tr>
        `;
    }
}

// Example HTML integration
const DDSAppExample = {
    api: new DDSFocusTimeAPI(),

    async init() {
        // Initialize the application
        this.bindEvents();
    },

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Load screenshots button
        const loadScreenshotsBtn = document.getElementById('loadScreenshots');
        if (loadScreenshotsBtn) {
            loadScreenshotsBtn.addEventListener('click', this.loadScreenshots.bind(this));
        }

        // Load logs button
        const loadLogsBtn = document.getElementById('loadLogs');
        if (loadLogsBtn) {
            loadLogsBtn.addEventListener('click', this.loadLogs.bind(this));
        }
    },

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        DDSUIHelper.showLoading('loginStatus');

        try {
            await this.api.login(username, password);
            DDSUIHelper.displaySuccess('loginStatus', 'Login successful!');
            this.showDashboard();
        } catch (error) {
            DDSUIHelper.displayError('loginStatus', error.message);
        }
    },

    async loadScreenshots() {
        DDSUIHelper.showLoading('screenshotsContainer');

        try {
            const response = await this.api.getScreenshots({ limit: 10 });
            const container = document.getElementById('screenshotsContainer');
            
            if (response.data.screenshots.length === 0) {
                container.innerHTML = '<p>No screenshots found.</p>';
                return;
            }

            const screenshotsHtml = response.data.screenshots
                .map(screenshot => DDSUIHelper.createScreenshotCard(screenshot))
                .join('');

            container.innerHTML = `
                <div class="screenshots-grid">
                    ${screenshotsHtml}
                </div>
                <div class="pagination">
                    Page ${response.data.pagination.current_page} of ${response.data.pagination.total_pages}
                    (${response.data.pagination.total_count} total)
                </div>
            `;
        } catch (error) {
            DDSUIHelper.displayError('screenshotsContainer', error.message);
        }
    },

    async loadLogs() {
        DDSUIHelper.showLoading('logsContainer');

        try {
            const response = await this.api.getLogs({ limit: 10 });
            const container = document.getElementById('logsContainer');
            
            if (response.data.logs.length === 0) {
                container.innerHTML = '<p>No logs found.</p>';
                return;
            }

            const logsHtml = response.data.logs
                .map(log => DDSUIHelper.createLogRow(log))
                .join('');

            container.innerHTML = `
                <table class="logs-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Staff ID</th>
                            <th>Date</th>
                            <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logsHtml}
                    </tbody>
                </table>
                <div class="pagination">
                    Page ${response.data.pagination.current_page} of ${response.data.pagination.total_pages}
                    (${response.data.pagination.total_count} total)
                </div>
            `;
        } catch (error) {
            DDSUIHelper.displayError('logsContainer', error.message);
        }
    },

    showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
    }
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        DDSAppExample.init();
    });
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DDSFocusTimeAPI, DDSUIHelper, DDSAppExample };
}
