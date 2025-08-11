# Settings Management System

A comprehensive settings management system for the DDS Admin Dashboard that allows administrators to configure UI themes, manage credentials, and control application settings.

## 🎯 Features

### 🎨 Theme Settings
- **Color Customization**: Primary, secondary, background, and text colors
- **Typography Control**: Font family and size selection
- **Layout Options**: Sidebar collapse, theme mode (light/dark)
- **Live Preview**: Real-time theme preview before saving
- **Global Application**: Apply themes globally or per user

### 🔐 Credentials Management
- **Multi-Provider Support**: OpenAI, AWS, Database, SMTP, OAuth, and more
- **Secure Storage**: Encrypted credential storage
- **Configuration Management**: Provider-specific settings (API keys, models, etc.)
- **Testing Capabilities**: Test credentials before deployment
- **Environment Support**: Production and development environment flags

### ⚙️ Application Settings
- **Category Organization**: Settings grouped by category (General, Security, Limits, etc.)
- **Data Type Support**: String, Integer, Boolean, and JSON settings
- **Visibility Control**: Public/private and editable/read-only settings
- **Live Editing**: In-place editing for configurable settings

## 🚀 Getting Started

### Navigation
1. Open the dashboard
2. Click on the **Settings** (⚙️) menu item in the sidebar
3. Navigate through the three main tabs:
   - **🎨 Theme Settings**
   - **🔐 Credentials** 
   - **⚙️ Application**

## 📋 Usage Guide

### Theme Settings

#### Basic Configuration
- **Theme Name**: Unique identifier for your theme
- **Theme Mode**: Light or Dark mode

#### Color Customization
- **Primary Color**: Main brand color for buttons and accents
- **Secondary Color**: Supporting color for secondary elements
- **Background Color**: Main background color
- **Text Color**: Primary text color

#### Typography
- **Font Family**: Choose from predefined fonts (Arial, Roboto, Open Sans, etc.)
- **Font Size**: Size from 12px to 24px

#### Layout Settings
- **Sidebar Collapsed**: Default sidebar state
- **Apply Globally**: Apply to all users or current user only

#### Live Preview
- Use the **👁️ Live Preview** button to see changes in real-time
- Click **💾 Save Theme Settings** to apply permanently
- Use **🔄 Reset** to revert to saved settings

### Credentials Management

#### Adding New Credentials
1. Click **+ Add New Credential**
2. Fill in the required information:
   - **Configuration Name**: Unique identifier
   - **Credential Type**: Select from supported types
   - **Description**: Optional description
   - **API Key/Secret**: Your credential
   - **Additional Config**: Provider-specific settings

#### Supported Credential Types
- **OpenAI API**: AI model integration
- **AWS**: Cloud service credentials
- **Database**: Database connection details
- **Email/SMTP**: Email server configuration
- **OAuth**: OAuth client settings
- **Generic API Key**: Custom API integrations
- **Cloud Storage**: File storage credentials
- **Payment Gateway**: Payment processing

#### Managing Existing Credentials
- **✏️ Edit**: Modify credential configuration
- **🔍 Test**: Test credential connectivity
- **⚙️ Config**: View additional configuration

### Application Settings

#### Adding New Settings
1. Click **+ Add New Setting**
2. Configure the setting:
   - **Setting Key**: Unique identifier (e.g., max_users, app_name)
   - **Setting Value**: The actual value
   - **Data Type**: String, Integer, Boolean, or JSON
   - **Category**: Organize by category
   - **Description**: Explain the setting's purpose
   - **Visibility**: Public/private and editable flags

#### Setting Categories
- **General**: Basic application settings
- **Security**: Security-related configurations
- **Limits**: Resource and usage limits
- **Email**: Email-related settings
- **System**: System-level configurations
- **User Interface**: UI-specific settings

#### Editing Settings
- Click **Edit** on any editable setting
- Modify the value in-place
- Click **Save** to apply changes
- Click **Cancel** to discard changes

## 🔧 Development Mode

The system includes a mock API for development and testing:

### Mock API Features
- Simulated API responses for all endpoints
- Realistic delay simulation
- Sample data for testing UI components
- Easy toggle between mock and real API

### Switching to Real API
In `src/services/settingsAPI.js`, change:
```javascript
const USE_MOCK_API = false; // Set to false when backend is ready
```

## 🎨 Theme System Integration

### CSS Variables
The theme system automatically applies CSS variables:
```css
--primary-color: #3498db
--secondary-color: #2ecc71
--background-color: #ffffff
--text-color: #2c3e50
--font-family: "Inter, Segoe UI, Tahoma"
--font-size: 16px
```

### Auto-Loading Themes
Themes are automatically loaded on page refresh and applied to the entire application.

## 🔐 Security Considerations

### Credential Security
- API keys are masked in the UI (displayed as `***hidden***`)
- Sensitive data should be encrypted at rest
- Production credentials are clearly marked
- Test functionality validates credentials safely

### Access Control
- Settings access should be restricted to administrators
- Implement role-based access control in production
- Audit logging for settings changes

## 📱 Responsive Design

The settings interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎯 API Integration

### Backend Requirements
The system expects these API endpoints:

#### UI Settings
- `POST /api/settings/ui/` - Save theme settings
- `GET /api/settings/ui/` - Retrieve theme settings
- `GET /api/settings/ui/?setting_name=theme_name` - Get specific theme

#### Credentials
- `POST /api/settings/credentials/` - Save credentials
- `GET /api/settings/credentials/` - Retrieve credentials
- `POST /api/settings/credentials/test/` - Test credentials

#### Application Settings
- `POST /api/settings/app/` - Save app settings
- `GET /api/settings/app/` - Retrieve app settings
- `GET /api/settings/app/?category=general` - Filter by category

### Expected Response Format
```json
{
  "success": true,
  "message": "Settings saved successfully",
  "data": { /* setting object */ }
}
```

## 🔄 State Management

### Local State
- Form data and validation
- UI state (active tabs, edit modes)
- Loading and error states

### API State
- Settings data caching
- Optimistic updates
- Error handling and recovery

## 🎨 Styling

### Styled Components
The interface uses styled-components with theme integration:
- Consistent spacing and colors
- Responsive breakpoints
- Theme-aware styling
- Component-scoped styles

### Theme Variables
All styling respects the current theme and updates dynamically when themes change.

## 📦 Components Structure

```
src/dashboard/pages/Settings.jsx          # Main settings page
src/dashboard/components/settings/
  ├── ThemeSettings.jsx                   # Theme configuration
  ├── CredentialsSettings.jsx             # Credential management
  └── AppSettings.jsx                     # Application settings
src/services/
  ├── settingsAPI.js                      # API integration
  └── mockSettingsAPI.js                  # Development mock API
```

## 🚨 Troubleshooting

### Common Issues
1. **Settings not loading**: Check API endpoint configuration
2. **Theme not applying**: Verify CSS variable support
3. **Mock API not working**: Ensure `USE_MOCK_API = true`
4. **Credentials not saving**: Check form validation

### Debug Mode
Enable console logging by setting:
```javascript
console.log('Settings Debug:', data);
```

## 🔮 Future Enhancements

### Planned Features
- Settings import/export functionality
- Version control for settings
- Settings templates and presets
- Bulk operations interface
- Advanced credential management
- Settings change history
- Multi-environment management

### Extensibility
The system is designed to be easily extensible:
- Add new credential types
- Create custom setting categories
- Implement additional validation
- Add new theme properties

## 📄 License

This settings management system is part of the DDS Admin Dashboard project.

---

**Ready to configure your dashboard!** 🎉

The settings system provides a professional, user-friendly interface for managing all aspects of your application configuration.
