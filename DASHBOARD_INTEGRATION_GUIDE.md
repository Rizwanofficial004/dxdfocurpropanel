# Dashboard Integration Guide - Settings Management APIs

## 🎯 Overview
This guide explains how to send data from your dashboard to manage UI settings, system credentials, and application configurations. Perfect for admin panels controlling client-side appearance and system behavior.

---

## 🚀 How to Send Data from Dashboard

### 1. Basic Data Sending Pattern

```javascript
// Standard function to send data to any settings endpoint
async function sendSettingsData(endpoint, data) {
    try {
        const response = await fetch(`http://127.0.0.1:8000/api/settings/${endpoint}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed
                // 'Authorization': 'Bearer your-token-here'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Settings saved successfully:', result.message);
            return result.data;
        } else {
            console.error('❌ Error saving settings:', result.message);
            return null;
        }
    } catch (error) {
        console.error('❌ Network error:', error);
        return null;
    }
}
```

### 2. Dashboard UI Form Examples

#### A. UI Settings Form (Theme Configuration)
```html
<!-- Dashboard Theme Settings Form -->
<form id="themeSettingsForm">
    <h3>🎨 Theme Settings</h3>
    
    <label>Setting Name:</label>
    <input type="text" id="settingName" value="dashboard_theme" required>
    
    <label>Font Family:</label>
    <select id="fontFamily">
        <option value="Arial, sans-serif">Arial</option>
        <option value="Roboto, sans-serif">Roboto</option>
        <option value="Open Sans, sans-serif">Open Sans</option>
        <option value="Lato, sans-serif">Lato</option>
        <option value="Montserrat, sans-serif">Montserrat</option>
    </select>
    
    <label>Font Size:</label>
    <select id="fontSize">
        <option value="12px">12px (Extra Small)</option>
        <option value="14px">14px (Small)</option>
        <option value="16px">16px (Medium)</option>
        <option value="18px">18px (Large)</option>
        <option value="20px">20px (Extra Large)</option>
        <option value="24px">24px (XXL)</option>
    </select>
    
    <label>Primary Color:</label>
    <input type="color" id="primaryColor" value="#3498db">
    
    <label>Secondary Color:</label>
    <input type="color" id="secondaryColor" value="#2ecc71">
    
    <label>Background Color:</label>
    <input type="color" id="backgroundColor" value="#ffffff">
    
    <label>Text Color:</label>
    <input type="color" id="textColor" value="#2c3e50">
    
    <label>Theme Mode:</label>
    <select id="themeMode">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
    
    <label>
        <input type="checkbox" id="sidebarCollapsed"> Collapse Sidebar
    </label>
    
    <label>
        <input type="checkbox" id="isGlobal" checked> Apply Globally
    </label>
    
    <button type="submit">💾 Save Theme Settings</button>
</form>

<script>
document.getElementById('themeSettingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const themeData = {
        setting_name: document.getElementById('settingName').value,
        font_family: document.getElementById('fontFamily').value,
        font_size: document.getElementById('fontSize').value,
        primary_color: document.getElementById('primaryColor').value,
        secondary_color: document.getElementById('secondaryColor').value,
        background_color: document.getElementById('backgroundColor').value,
        text_color: document.getElementById('textColor').value,
        theme_mode: document.getElementById('themeMode').value,
        sidebar_collapsed: document.getElementById('sidebarCollapsed').checked,
        is_global: document.getElementById('isGlobal').checked,
        user_id: null  // null for global settings
    };
    
    const result = await sendSettingsData('ui', themeData);
    if (result) {
        alert('✅ Theme settings saved successfully!');
        // Apply settings immediately to current page
        applyThemeSettings(themeData);
    }
});
</script>
```

#### B. Credentials Form (OpenAI Configuration)
```html
<!-- OpenAI Credentials Form -->
<form id="openaiCredentialsForm">
    <h3>🔐 OpenAI Configuration</h3>
    
    <label>Configuration Name:</label>
    <input type="text" id="credentialName" value="openai_production" required>
    
    <label>Description:</label>
    <input type="text" id="credentialDescription" value="Main OpenAI API for dashboard" required>
    
    <label>API Key:</label>
    <input type="password" id="apiKey" placeholder="sk-..." required>
    
    <label>AI Model:</label>
    <select id="aiModel">
        <option value="gpt-4">GPT-4</option>
        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        <option value="gpt-4-turbo">GPT-4 Turbo</option>
    </select>
    
    <label>Max Tokens:</label>
    <input type="number" id="maxTokens" value="4000" min="1" max="32000">
    
    <label>Temperature:</label>
    <input type="range" id="temperature" min="0" max="2" step="0.1" value="0.7">
    <span id="tempValue">0.7</span>
    
    <label>
        <input type="checkbox" id="isActive" checked> Active
    </label>
    
    <label>
        <input type="checkbox" id="isProduction"> Production Environment
    </label>
    
    <button type="submit">🔑 Save OpenAI Credentials</button>
</form>

<script>
document.getElementById('temperature').addEventListener('input', function() {
    document.getElementById('tempValue').textContent = this.value;
});

document.getElementById('openaiCredentialsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const credentialData = {
        name: document.getElementById('credentialName').value,
        credential_type: 'openai',
        description: document.getElementById('credentialDescription').value,
        api_key: document.getElementById('apiKey').value,
        is_active: document.getElementById('isActive').checked,
        is_production: document.getElementById('isProduction').checked,
        additional_config: {
            model: document.getElementById('aiModel').value,
            max_tokens: parseInt(document.getElementById('maxTokens').value),
            temperature: parseFloat(document.getElementById('temperature').value)
        }
    };
    
    const result = await sendSettingsData('credentials', credentialData);
    if (result) {
        alert('✅ OpenAI credentials saved successfully!');
        document.getElementById('apiKey').value = ''; // Clear sensitive data
    }
});
</script>
```

#### C. Application Settings Form
```html
<!-- Application Settings Form -->
<form id="appSettingsForm">
    <h3>⚙️ Application Configuration</h3>
    
    <label>Setting Key:</label>
    <input type="text" id="settingKey" placeholder="e.g., max_users, app_name" required>
    
    <label>Setting Value:</label>
    <input type="text" id="settingValue" placeholder="Enter value" required>
    
    <label>Data Type:</label>
    <select id="settingType">
        <option value="string">String</option>
        <option value="integer">Integer</option>
        <option value="boolean">Boolean</option>
        <option value="json">JSON</option>
    </select>
    
    <label>Category:</label>
    <select id="settingCategory">
        <option value="general">General</option>
        <option value="security">Security</option>
        <option value="limits">Limits</option>
        <option value="email">Email</option>
        <option value="system">System</option>
        <option value="ui">User Interface</option>
    </select>
    
    <label>Description:</label>
    <textarea id="settingDescription" placeholder="Describe this setting..."></textarea>
    
    <label>
        <input type="checkbox" id="isPublic"> Public Setting
    </label>
    
    <label>
        <input type="checkbox" id="isEditable" checked> Editable
    </label>
    
    <button type="submit">💾 Save Application Setting</button>
</form>

<script>
document.getElementById('appSettingsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const appData = {
        key: document.getElementById('settingKey').value,
        value: document.getElementById('settingValue').value,
        setting_type: document.getElementById('settingType').value,
        category: document.getElementById('settingCategory').value,
        description: document.getElementById('settingDescription').value,
        is_public: document.getElementById('isPublic').checked,
        is_editable: document.getElementById('isEditable').checked
    };
    
    const result = await sendSettingsData('app', appData);
    if (result) {
        alert('✅ Application setting saved successfully!');
        document.getElementById('appSettingsForm').reset();
    }
});
</script>
```

### 3. Real-time Settings Application

```javascript
// Function to apply theme settings immediately
function applyThemeSettings(settings) {
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--primary-color', settings.primary_color);
    root.style.setProperty('--secondary-color', settings.secondary_color);
    root.style.setProperty('--background-color', settings.background_color);
    root.style.setProperty('--text-color', settings.text_color);
    root.style.setProperty('--font-family', settings.font_family);
    root.style.setProperty('--font-size', settings.font_size);
    
    // Apply theme mode
    document.body.className = `theme-${settings.theme_mode}`;
    
    // Handle sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed', settings.sidebar_collapsed);
    }
}

// Auto-load settings on page load
window.addEventListener('load', async function() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/settings/ui/?setting_name=dashboard_theme');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            applyThemeSettings(result.data[0]);
        }
    } catch (error) {
        console.error('Failed to load theme settings:', error);
    }
});
```

---

## 📋 Complete API Endpoints List

### 🎨 UI Settings Endpoints

| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| `POST` | `/api/settings/ui/` | Create/Update UI Settings | Configure fonts, colors, themes |
| `GET` | `/api/settings/ui/` | Retrieve UI Settings | Load current theme configuration |
| `GET` | `/api/settings/ui/?setting_name=theme_name` | Get Specific Theme | Load particular theme settings |
| `GET` | `/api/settings/ui/?user_id=123` | Get User-Specific Settings | Load personalized user themes |

**Use Cases:**
- Dashboard theme management
- Font and color customization  
- Dark/light mode switching
- Sidebar layout control
- User-specific preferences

---

### 🔐 Credentials Management Endpoints

| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| `POST` | `/api/settings/credentials/` | Create/Update Credentials | Store API keys, passwords |
| `GET` | `/api/settings/credentials/` | Retrieve All Credentials | List all stored credentials |
| `GET` | `/api/settings/credentials/?name=openai_prod` | Get Specific Credential | Load particular credential set |
| `GET` | `/api/settings/credentials/?type=openai` | Filter by Type | Get all OpenAI credentials |

**Supported Credential Types:**
- `openai` - OpenAI API Keys
- `aws` - AWS Access/Secret Keys  
- `database` - Database Connection Details
- `smtp` - Email Server Configuration
- `oauth` - OAuth Client Settings
- `api_key` - Generic API Keys
- `storage` - Cloud Storage Credentials
- `payment` - Payment Gateway Settings

---

### ⚙️ Application Settings Endpoints

| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| `POST` | `/api/settings/app/` | Create/Update App Settings | Configure application behavior |
| `GET` | `/api/settings/app/` | Retrieve All Settings | Get all app configurations |
| `GET` | `/api/settings/app/?key=max_users` | Get Specific Setting | Load particular configuration |
| `GET` | `/api/settings/app/?category=security` | Filter by Category | Get settings by category |

**Setting Categories:**
- `general` - Basic app settings
- `security` - Security configurations
- `limits` - Resource and usage limits
- `email` - Email-related settings
- `system` - System-level configurations  
- `ui` - User interface settings

---

### 🔄 Bulk Operations Endpoint

| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| `POST` | `/api/settings/bulk/` | Bulk Create/Update | Save multiple settings at once |

**Use Cases:**
- Initial system setup
- Configuration imports
- Batch updates
- Environment migrations

---

## 💻 Dashboard Integration Examples

### 1. Admin Panel - Theme Manager
```javascript
class ThemeManager {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:8000/api/settings';
        this.init();
    }
    
    async init() {
        await this.loadThemes();
        this.setupEventListeners();
    }
    
    async loadThemes() {
        const response = await fetch(`${this.baseUrl}/ui/`);
        const result = await response.json();
        
        if (result.success) {
            this.populateThemeSelector(result.data);
        }
    }
    
    populateThemeSelector(themes) {
        const selector = document.getElementById('themeSelector');
        selector.innerHTML = '<option value="">Select Theme...</option>';
        
        themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.setting_name;
            option.textContent = theme.setting_name;
            selector.appendChild(option);
        });
    }
    
    async saveTheme(themeData) {
        const response = await fetch(`${this.baseUrl}/ui/`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(themeData)
        });
        
        const result = await response.json();
        return result;
    }
    
    setupEventListeners() {
        // Color change listeners
        document.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('change', () => this.previewChanges());
        });
        
        // Font change listeners  
        document.querySelectorAll('select[data-setting]').forEach(select => {
            select.addEventListener('change', () => this.previewChanges());
        });
    }
    
    previewChanges() {
        // Apply changes in real-time for preview
        const previewData = this.gatherFormData();
        applyThemeSettings(previewData);
    }
    
    gatherFormData() {
        return {
            setting_name: document.getElementById('settingName').value,
            font_family: document.getElementById('fontFamily').value,
            font_size: document.getElementById('fontSize').value,
            primary_color: document.getElementById('primaryColor').value,
            secondary_color: document.getElementById('secondaryColor').value,
            background_color: document.getElementById('backgroundColor').value,
            text_color: document.getElementById('textColor').value,
            theme_mode: document.getElementById('themeMode').value,
            sidebar_collapsed: document.getElementById('sidebarCollapsed').checked,
            is_global: document.getElementById('isGlobal').checked
        };
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();
```

### 2. Credentials Manager
```javascript
class CredentialsManager {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:8000/api/settings/credentials';
        this.loadCredentials();
    }
    
    async loadCredentials() {
        try {
            const response = await fetch(this.baseUrl);
            const result = await response.json();
            
            if (result.success) {
                this.displayCredentials(result.data);
            }
        } catch (error) {
            console.error('Failed to load credentials:', error);
        }
    }
    
    displayCredentials(credentials) {
        const container = document.getElementById('credentialsList');
        container.innerHTML = '';
        
        credentials.forEach(cred => {
            const card = this.createCredentialCard(cred);
            container.appendChild(card);
        });
    }
    
    createCredentialCard(credential) {
        const card = document.createElement('div');
        card.className = 'credential-card';
        card.innerHTML = `
            <div class="credential-header">
                <h4>${credential.name}</h4>
                <span class="credential-type">${credential.credential_type}</span>
                <span class="credential-status ${credential.is_active ? 'active' : 'inactive'}">
                    ${credential.is_active ? '✅ Active' : '❌ Inactive'}
                </span>
            </div>
            <p>${credential.description}</p>
            <div class="credential-actions">
                <button onclick="this.editCredential('${credential.name}')">Edit</button>
                <button onclick="this.testCredential('${credential.name}')">Test</button>
                <button onclick="this.deleteCredential('${credential.name}')">Delete</button>
            </div>
        `;
        return card;
    }
    
    async saveCredential(credentialData) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(credentialData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Credential saved successfully!');
                this.loadCredentials(); // Refresh list
                return true;
            } else {
                alert('❌ Error: ' + result.message);
                return false;
            }
        } catch (error) {
            alert('❌ Network error: ' + error.message);
            return false;
        }
    }
}
```

### 3. Application Settings Manager
```javascript
class AppSettingsManager {
    constructor() {
        this.baseUrl = 'http://127.0.0.1:8000/api/settings/app';
        this.settings = {};
        this.loadSettings();
    }
    
    async loadSettings() {
        try {
            const response = await fetch(this.baseUrl);
            const result = await response.json();
            
            if (result.success) {
                this.settings = this.groupByCategory(result.data);
                this.renderSettings();
            }
        } catch (error) {
            console.error('Failed to load app settings:', error);
        }
    }
    
    groupByCategory(settings) {
        return settings.reduce((groups, setting) => {
            if (!groups[setting.category]) {
                groups[setting.category] = [];
            }
            groups[setting.category].push(setting);
            return groups;
        }, {});
    }
    
    renderSettings() {
        const container = document.getElementById('appSettingsContainer');
        container.innerHTML = '';
        
        Object.keys(this.settings).forEach(category => {
            const categorySection = this.createCategorySection(category, this.settings[category]);
            container.appendChild(categorySection);
        });
    }
    
    createCategorySection(category, settings) {
        const section = document.createElement('div');
        section.className = 'settings-category';
        
        const header = document.createElement('h3');
        header.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Settings`;
        section.appendChild(header);
        
        settings.forEach(setting => {
            const settingElement = this.createSettingElement(setting);
            section.appendChild(settingElement);
        });
        
        return section;
    }
    
    createSettingElement(setting) {
        const element = document.createElement('div');
        element.className = 'setting-item';
        
        let inputElement;
        switch (setting.setting_type) {
            case 'boolean':
                inputElement = `<input type="checkbox" ${setting.value === 'true' ? 'checked' : ''} ${!setting.is_editable ? 'disabled' : ''}>`;
                break;
            case 'integer':
                inputElement = `<input type="number" value="${setting.value}" ${!setting.is_editable ? 'readonly' : ''}>`;
                break;
            case 'json':
                inputElement = `<textarea rows="3" ${!setting.is_editable ? 'readonly' : ''}>${setting.value}</textarea>`;
                break;
            default:
                inputElement = `<input type="text" value="${setting.value}" ${!setting.is_editable ? 'readonly' : ''}>`;
        }
        
        element.innerHTML = `
            <div class="setting-info">
                <label>${setting.key}</label>
                <p class="setting-description">${setting.description}</p>
            </div>
            <div class="setting-input">
                ${inputElement}
                ${setting.is_editable ? '<button onclick="this.saveSetting(\'' + setting.key + '\')">Save</button>' : ''}
            </div>
        `;
        
        return element;
    }
    
    async saveSetting(key, value, type) {
        const settingData = {
            key: key,
            value: value,
            setting_type: type
        };
        
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(settingData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Setting saved successfully!');
                this.loadSettings(); // Refresh
            } else {
                alert('❌ Error: ' + result.message);
            }
        } catch (error) {
            alert('❌ Network error: ' + error.message);
        }
    }
}
```

---

## 🔧 Quick Setup Commands

### Database Setup
```bash
# Create database tables
python create_settings_tables.py

# Run Django migrations (if needed)
python manage.py makemigrations dashboard
python manage.py migrate
```

### Testing APIs
```bash
# Test all endpoints
python test_settings_apis.py

# Test specific functionality
python test_dashboard_apis.py
```

### Development Server
```bash
# Start Django development server
python manage.py runserver 127.0.0.1:8000

# Access admin panel (if configured)
# http://127.0.0.1:8000/admin/
```

---

## 🎯 Dashboard Implementation Checklist

### Frontend Setup
- [ ] Include the `sendSettingsData()` function
- [ ] Create forms for UI settings
- [ ] Create forms for credentials management  
- [ ] Create forms for app settings
- [ ] Implement real-time preview
- [ ] Add loading states and error handling

### API Integration
- [ ] Test UI settings endpoint
- [ ] Test credentials endpoint
- [ ] Test app settings endpoint
- [ ] Test bulk operations endpoint
- [ ] Implement error handling
- [ ] Add authentication (production)

### User Experience
- [ ] Live theme preview
- [ ] Form validation
- [ ] Success/error notifications
- [ ] Settings backup/restore
- [ ] Import/export functionality

### Security
- [ ] Add authentication middleware
- [ ] Implement role-based access
- [ ] Encrypt sensitive credentials
- [ ] Add audit logging
- [ ] Validate all inputs

---

## 🚀 Ready to Use!

Your settings management APIs are now fully functional and ready for dashboard integration. Use this guide to implement a professional admin panel that can control every aspect of your application's appearance and behavior.

**All endpoints are live and tested!** 🎉
