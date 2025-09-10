# Postman API Examples for Styling API

## POST Request to Create/Update Global Styling

### Endpoint
```
POST https://dxdtime.ddsolutions.io/api/styling/global/
```

### Headers
```
Content-Type: application/json
```

### Body (JSON) - Complete Example with All New Fields

```json
{
  "theme_name": "Modern Dark Theme",
  "description": "A modern dark theme with vibrant accents",
  "primary_color": "#2563eb",
  "secondary_color": "#10b981",
  "background_color": "#1f2937",
  "button_color": "#3b82f6",
  "text_color": "#f9fafb",
  "submit_button_bg_color": "#059669",
  "submit_button_text_color": "#ffffff",
  "primary_button_bg_color": "#2563eb",
  "primary_button_text_color": "#ffffff",
  "secondary_button_bg_color": "#6b7280",
  "secondary_button_text_color": "#ffffff",
  "drawer_background_color": "#374151",
  "drawer_text_color": "#f3f4f6",
  "icon_color": "#9ca3af",
  "top_color": "#111827",
  "heading_font_size": "32px",
  "body_font_size": "16px",
  "font_family": "Inter, sans-serif",
  "border_radius": "8px"
}
```

### Body (JSON) - Minimal Example

```json
{
  "theme_name": "Quick Test Theme",
  "primary_color": "#ff6b6b",
  "secondary_color": "#4ecdc4",
  "background_color": "#ffe66d",
  "submit_button_bg_color": "#a8e6cf",
  "submit_button_text_color": "#2d3436"
}
```

### Body (JSON) - Testing Custom Field Mapping

```json
{
  "theme_name": "Custom Field Test",
  "header-color": "#e17055",
  "footer-color": "#fdcb6e",
  "button-text_color": "#2d3436",
  "submit_button_bg_color": "#00b894",
  "primary_button_bg_color": "#0984e3",
  "drawer_background_color": "#ddd"
}
```

## Expected Response

### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Styling configuration 'Modern Dark Theme' created successfully",
  "data": {
    "id": 5,
    "theme_name": "Modern Dark Theme",
    "description": "A modern dark theme with vibrant accents",
    "primary_color": "#2563eb",
    "secondary_color": "#10b981",
    "background_color": "#1f2937",
    "button_color": "#3b82f6",
    "text_color": "#f9fafb",
    "submit_button_bg_color": "#059669",
    "submit_button_text_color": "#ffffff",
    "primary_button_bg_color": "#2563eb",
    "primary_button_text_color": "#ffffff",
    "secondary_button_bg_color": "#6b7280",
    "secondary_button_text_color": "#ffffff",
    "drawer_background_color": "#374151",
    "drawer_text_color": "#f3f4f6",
    "icon_color": "#9ca3af",
    "top_color": "#111827",
    "heading_font_size": "32px",
    "body_font_size": "16px",
    "font_family": "Inter, sans-serif",
    "border_radius": "8px",
    "is_active": true,
    "is_default": false,
    "created_at": "2025-09-10T15:30:00Z",
    "updated_at": "2025-09-10T15:30:00Z",
    "css_variables": {
      "--primary-color": "#2563eb",
      "--secondary-color": "#10b981",
      "--background-color": "#1f2937",
      "--button-color": "#3b82f6",
      "--text-color": "#f9fafb",
      "--submit-button-bg-color": "#059669",
      "--submit-button-text-color": "#ffffff",
      "--primary-button-bg-color": "#2563eb",
      "--primary-button-text-color": "#ffffff",
      "--secondary-button-bg-color": "#6b7280",
      "--secondary-button-text-color": "#ffffff",
      "--drawer-background-color": "#374151",
      "--drawer-text-color": "#f3f4f6",
      "--icon-color": "#9ca3af",
      "--top-color": "#111827",
      "--heading-font-size": "32px",
      "--body-font-size": "16px",
      "--font-family": "Inter, sans-serif",
      "--border-radius": "8px"
    }
  },
  "custom_format": {
    "theme_name": "Modern Dark Theme",
    "description": "A modern dark theme with vibrant accents",
    "header-color": "#2563eb",
    "footer-color": "#10b981",
    "text_color": "#f9fafb",
    "background_color": "#1f2937",
    "button_color": "#3b82f6",
    "button-text_color": "#f9fafb",
    "submit_button_bg_color": "#059669",
    "submit_button_text_color": "#ffffff",
    "primary_button_bg_color": "#2563eb",
    "primary_button_text_color": "#ffffff",
    "secondary_button_bg_color": "#6b7280",
    "secondary_button_text_color": "#ffffff",
    "drawer_background_color": "#374151",
    "drawer_text_color": "#f3f4f6",
    "icon_color": "#9ca3af",
    "top_color": "#111827",
    "heading_font_size": "32px",
    "body_font_size": "16px",
    "font_family": "Inter, sans-serif",
    "border_radius": "8px"
  }
}
```

## GET Request to Retrieve Current Styling

### Endpoint
```
GET https://dxdtime.ddsolutions.io/api/styling/global/
```

### Expected Response
```json
{
  "status": "success",
  "message": "Active styling configuration retrieved successfully",
  "data": {
    "theme_name": "Modern Dark Theme",
    "description": "A modern dark theme with vibrant accents",
    "header-color": "#2563eb",
    "footer-color": "#10b981",
    "text_color": "#f9fafb",
    "background_color": "#1f2937",
    "button_color": "#3b82f6",
    "button-text_color": "#f9fafb",
    "submit_button_bg_color": "#059669",
    "submit_button_text_color": "#ffffff",
    "primary_button_bg_color": "#2563eb",
    "primary_button_text_color": "#ffffff",
    "secondary_button_bg_color": "#6b7280",
    "secondary_button_text_color": "#ffffff",
    "drawer_background_color": "#374151",
    "drawer_text_color": "#f3f4f6",
    "icon_color": "#9ca3af",
    "top_color": "#111827",
    "heading_font_size": "32px",
    "body_font_size": "16px",
    "font_family": "Inter, sans-serif",
    "border_radius": "8px"
  },
  "css_variables": {
    "--primary-color": "#2563eb",
    "--secondary-color": "#10b981",
    "--background-color": "#1f2937",
    "--button-color": "#3b82f6",
    "--text-color": "#f9fafb",
    "--submit-button-bg-color": "#059669",
    "--submit-button-text-color": "#ffffff",
    "--primary-button-bg-color": "#2563eb",
    "--primary-button-text-color": "#ffffff",
    "--secondary-button-bg-color": "#6b7280",
    "--secondary-button-text-color": "#ffffff",
    "--drawer-background-color": "#374151",
    "--drawer-text-color": "#f3f4f6",
    "--icon-color": "#9ca3af",
    "--top-color": "#111827",
    "--heading-font-size": "32px",
    "--body-font-size": "16px",
    "--font-family": "Inter, sans-serif",
    "--border-radius": "8px"
  }
}
```

## All Available Fields

### Color Fields
- `primary_color` - Main brand color
- `secondary_color` - Secondary accent color  
- `background_color` - Main background color
- `button_color` - Default button color
- `text_color` - Main text color
- `submit_button_bg_color` - Submit button background color
- `submit_button_text_color` - Submit button text color
- `primary_button_bg_color` - Primary button background color
- `primary_button_text_color` - Primary button text color
- `secondary_button_bg_color` - Secondary button background color
- `secondary_button_text_color` - Secondary button text color
- `drawer_background_color` - Drawer/sidebar background color
- `drawer_text_color` - Drawer/sidebar text color
- `icon_color` - Icon color
- `top_color` - Top navigation/header color

### Typography Fields
- `heading_font_size` - Size for headings (e.g., "32px", "2rem")
- `body_font_size` - Size for body text (e.g., "16px", "1rem")
- `font_family` - Font family (e.g., "Arial, sans-serif")

### Layout Fields
- `border_radius` - Border radius for elements (e.g., "8px", "0.5rem")

### Meta Fields
- `theme_name` - Name for the theme (required)
- `description` - Optional description of the theme

### Custom Field Mapping Support
The API also supports these custom field names that map to existing fields:
- `header-color` → maps to `primary_color`
- `footer-color` → maps to `secondary_color`
- `button-text_color` → maps to `text_color`

## Tips for Testing in Postman

1. **Set Content-Type Header**: Make sure to set `Content-Type: application/json`

2. **Test with Different Field Combinations**: Try sending only a few fields to test defaults

3. **Test Custom Field Mapping**: Use the custom field names to verify mapping works

4. **Check Response Structure**: The API returns both database format and custom format

5. **Verify CSS Variables**: Check that CSS variables are generated correctly

6. **Test Color Formats**: Try different color formats (HEX, RGB, RGBA)

7. **Test Font Sizes**: Try different units (px, rem, em, %)

## Error Responses

### 400 Bad Request - Invalid Data
```json
{
  "status": "error",
  "message": "Invalid styling data provided",
  "errors": {
    "primary_color": ["Invalid color format"]
  }
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Error creating styling configuration: [error details]"
}
```
