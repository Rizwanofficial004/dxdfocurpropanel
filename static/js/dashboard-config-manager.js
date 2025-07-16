/**
 * Client-Side Configuration Manager
 * Fetches and applies settings from the admin panel APIs
 */
class DashboardConfigManager {
    constructor(baseUrl = '/api/settings') {
        this.baseUrl = baseUrl;
        this.cache = {};
        this.callbacks = {};
    }

    /**
     * Load all settings from APIs
     */
    async loadAllSettings() {
        try {
            console.log('🔄 Loading dashboard settings from admin panel...');
            
            // Load UI settings
            const uiSettings = await this.loadUISettings();
            
            // Load app settings
            const appSettings = await this.loadAppSettings();
            
            // Load public credentials (masked)
            const credentials = await this.loadCredentials();
            
            // Apply all settings
            this.applyUISettings(uiSettings);
            this.applyAppSettings(appSettings);
            this.applyCredentials(credentials);
            
            console.log('✅ All settings loaded and applied!');
            return { ui: uiSettings, app: appSettings, credentials };
            
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            this.applyDefaultSettings();
        }
    }

    /**
     * Load UI settings (theme, colors, fonts)
     */
    async loadUISettings(settingName = 'dashboard_theme') {
        try {
            const response = await fetch(`${this.baseUrl}/ui/?setting_name=${settingName}`);
            const data = await response.json();
            
            if (data.success) {
                this.cache.ui = data.data;
                return data.data;
            } else {
                console.warn('⚠️ UI settings not found, using defaults');
                return this.getDefaultUISettings();
            }
        } catch (error) {
            console.error('❌ Error loading UI settings:', error);
            return this.getDefaultUISettings();
        }
    }

    /**
     * Load application settings
     */
    async loadAppSettings() {
        try {
            const response = await fetch(`${this.baseUrl}/app/`);
            const data = await response.json();
            
            if (data.success) {
                const settings = {};
                data.data.settings.forEach(setting => {
                    settings[setting.key] = setting.typed_value;
                });
                this.cache.app = settings;
                return settings;
            }
            return {};
        } catch (error) {
            console.error('❌ Error loading app settings:', error);
            return {};
        }
    }

    /**
     * Load credentials (public/masked only)
     */
    async loadCredentials() {
        try {
            const response = await fetch(`${this.baseUrl}/credentials/`);
            const data = await response.json();
            
            if (data.success) {
                const credentials = {};
                data.data.credentials.forEach(cred => {
                    credentials[cred.name] = {
                        type: cred.credential_type,
                        active: cred.is_active,
                        description: cred.description
                    };
                });
                this.cache.credentials = credentials;
                return credentials;
            }
            return {};
        } catch (error) {
            console.error('❌ Error loading credentials:', error);
            return {};
        }
    }

    /**
     * Apply UI settings to the page
     */
    applyUISettings(settings) {
        if (!settings) return;

        console.log('🎨 Applying UI settings:', settings);

        // Apply font settings
        if (settings.font_family) {
            document.body.style.fontFamily = settings.font_family;
        }
        if (settings.font_size) {
            document.body.style.fontSize = settings.font_size;
        }

        // Apply color scheme using CSS variables
        const root = document.documentElement;
        if (settings.primary_color) {
            root.style.setProperty('--primary-color', settings.primary_color);
        }
        if (settings.secondary_color) {
            root.style.setProperty('--secondary-color', settings.secondary_color);
        }
        if (settings.background_color) {
            root.style.setProperty('--background-color', settings.background_color);
            document.body.style.backgroundColor = settings.background_color;
        }
        if (settings.text_color) {
            root.style.setProperty('--text-color', settings.text_color);
            document.body.style.color = settings.text_color;
        }

        // Apply theme mode
        if (settings.theme_mode) {
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(`${settings.theme_mode}-theme`);
            
            // Update meta theme-color for mobile browsers
            let themeColorMeta = document.querySelector('meta[name="theme-color"]');
            if (!themeColorMeta) {
                themeColorMeta = document.createElement('meta');
                themeColorMeta.name = 'theme-color';
                document.head.appendChild(themeColorMeta);
            }
            themeColorMeta.content = settings.primary_color || '#007bff';
        }

        // Apply sidebar settings
        if (settings.sidebar_collapsed !== undefined) {
            const sidebar = document.querySelector('.sidebar, #sidebar, [data-sidebar]');
            if (sidebar) {
                if (settings.sidebar_collapsed) {
                    sidebar.classList.add('collapsed');
                } else {
                    sidebar.classList.remove('collapsed');
                }
            }
        }

        // Trigger custom event for other components to react
        document.dispatchEvent(new CustomEvent('uiSettingsApplied', { 
            detail: settings 
        }));
    }

    /**
     * Apply application settings
     */
    applyAppSettings(settings) {
        if (!settings) return;

        console.log('⚙️ Applying app settings:', settings);

        // Apply app name
        if (settings.app_name) {
            document.title = settings.app_name;
            const appNameElements = document.querySelectorAll('[data-app-name]');
            appNameElements.forEach(el => el.textContent = settings.app_name);
        }

        // Handle maintenance mode
        if (settings.maintenance_mode) {
            this.showMaintenanceMode();
        }

        // Handle notifications
        if (settings.enable_notifications) {
            this.enableNotifications();
        }

        // Handle max users or other limits
        if (settings.max_users) {
            window.APP_CONFIG = window.APP_CONFIG || {};
            window.APP_CONFIG.maxUsers = settings.max_users;
        }

        // Session timeout
        if (settings.session_timeout) {
            this.setSessionTimeout(settings.session_timeout);
        }

        // Trigger custom event
        document.dispatchEvent(new CustomEvent('appSettingsApplied', { 
            detail: settings 
        }));
    }

    /**
     * Apply credential configurations
     */
    applyCredentials(credentials) {
        if (!credentials) return;

        console.log('🔐 Processing credentials:', Object.keys(credentials));

        // Make available globally but safely
        window.CREDENTIALS_STATUS = {};
        
        Object.keys(credentials).forEach(name => {
            const cred = credentials[name];
            window.CREDENTIALS_STATUS[name] = {
                active: cred.active,
                type: cred.type
            };
        });

        // Trigger custom event
        document.dispatchEvent(new CustomEvent('credentialsApplied', { 
            detail: credentials 
        }));
    }

    /**
     * Get default UI settings
     */
    getDefaultUISettings() {
        return {
            font_family: 'Arial, sans-serif',
            font_size: '16px',
            primary_color: '#007bff',
            secondary_color: '#6c757d',
            background_color: '#ffffff',
            text_color: '#333333',
            theme_mode: 'light',
            sidebar_collapsed: false
        };
    }

    /**
     * Apply default settings as fallback
     */
    applyDefaultSettings() {
        console.log('🔄 Applying default settings...');
        this.applyUISettings(this.getDefaultUISettings());
    }

    /**
     * Show maintenance mode
     */
    showMaintenanceMode() {
        const maintenanceBanner = document.createElement('div');
        maintenanceBanner.id = 'maintenance-banner';
        maintenanceBanner.innerHTML = `
            <div style="background: #ff6b6b; color: white; padding: 10px; text-align: center; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;">
                🚧 System is in maintenance mode. Some features may be limited.
            </div>
        `;
        document.body.insertBefore(maintenanceBanner, document.body.firstChild);
        document.body.style.paddingTop = '50px';
    }

    /**
     * Enable notifications
     */
    enableNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * Set session timeout
     */
    setSessionTimeout(seconds) {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            alert('Session expired. Please login again.');
            // Redirect to login or refresh
            window.location.reload();
        }, seconds * 1000);
    }

    /**
     * Refresh settings from server
     */
    async refreshSettings() {
        return await this.loadAllSettings();
    }

    /**
     * Get cached setting value
     */
    getSetting(category, key) {
        if (category === 'ui') {
            return this.cache.ui?.[key];
        } else if (category === 'app') {
            return this.cache.app?.[key];
        } else if (category === 'credentials') {
            return this.cache.credentials?.[key];
        }
        return null;
    }

    /**
     * Watch for setting changes (polling)
     */
    startWatching(interval = 30000) {
        this.watchInterval = setInterval(() => {
            this.refreshSettings();
        }, interval);
    }

    /**
     * Stop watching for changes
     */
    stopWatching() {
        if (this.watchInterval) {
            clearInterval(this.watchInterval);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Create global config manager
    window.dashboardConfig = new DashboardConfigManager();
    
    // Load all settings
    await window.dashboardConfig.loadAllSettings();
    
    // Optional: Start watching for changes every 30 seconds
    window.dashboardConfig.startWatching(30000);
    
    console.log('🎉 Dashboard configuration manager initialized!');
});

// Add CSS for theme support
const style = document.createElement('style');
style.textContent = `
    /* Theme CSS Variables */
    :root {
        --primary-color: #007bff;
        --secondary-color: #6c757d;
        --background-color: #ffffff;
        --text-color: #333333;
    }

    /* Dark Theme */
    .dark-theme {
        --background-color: #2c3e50;
        --text-color: #ecf0f1;
    }

    /* Light Theme */
    .light-theme {
        --background-color: #ffffff;
        --text-color: #333333;
    }

    /* Sidebar collapsed state */
    .sidebar.collapsed {
        width: 60px !important;
        overflow: hidden;
    }

    .sidebar.collapsed .sidebar-text {
        display: none;
    }

    /* Apply CSS variables */
    .btn-primary {
        background-color: var(--primary-color);
        border-color: var(--primary-color);
    }

    .btn-secondary {
        background-color: var(--secondary-color);
        border-color: var(--secondary-color);
    }

    .bg-primary {
        background-color: var(--primary-color) !important;
    }

    .text-primary {
        color: var(--primary-color) !important;
    }
`;
document.head.appendChild(style);
