# 🎯 GET API Custom Format - Usage Guide

## ✅ Current Status

The GET endpoint at `https://dxdtime.ddsolutions.io/api/styling/global/` **already supports your custom JSON format!**

## 📥 How to Access Your Custom Format

### In the GET Response:

```json
{
  "status": "success",
  "message": "Active styling configuration retrieved successfully",
  "data": {
    // Database format with primary_color, secondary_color, etc.
  },
  "custom_format": {
    "theme_name": "My Custom Theme pagal",
    "description": "My custom styling theme", 
    "header-color": "#008000",
    "footer-color": "#1f2937",
    "text_color": "#000",
    "background_color": "#1f2937",
    "button_color": "#fff",
    "button-text_color": "#000",
    "heading_font_size": "28px",
    "body_font_size": "16px",
    "font_family": "Arial, sans-serif",
    "border_radius": "8px"
  }
}
```

## 🔗 Usage Examples

### JavaScript/Frontend:
```javascript
fetch('https://dxdtime.ddsolutions.io/api/styling/global/')
  .then(response => response.json())
  .then(data => {
    // Use your custom format
    const customStyling = data.custom_format;
    
    // Apply styles
    document.documentElement.style.setProperty('--header-bg', customStyling['header-color']);
    document.documentElement.style.setProperty('--footer-bg', customStyling['footer-color']);
    
    console.log('Theme:', customStyling.theme_name);
    console.log('Header Color:', customStyling['header-color']);
    console.log('Footer Color:', customStyling['footer-color']);
  });
```

### Python/Backend:
```python
import requests

response = requests.get('https://dxdtime.ddsolutions.io/api/styling/global/')
data = response.json()

# Access your custom format
custom_format = data['custom_format']

print(f"Theme: {custom_format['theme_name']}")
print(f"Header Color: {custom_format['header-color']}")
print(f"Footer Color: {custom_format['footer-color']}")
print(f"Button Text Color: {custom_format['button-text_color']}")
```

### cURL:
```bash
curl -X GET https://dxdtime.ddsolutions.io/api/styling/global/ | jq '.custom_format'
```

## 🎨 Available Custom Fields

| Field Name | Description | Example |
|------------|-------------|---------|
| `theme_name` | Theme identifier | "My Custom Theme pagal" |
| `description` | Theme description | "My custom styling theme" |
| `header-color` | Header background color | "#008000" |
| `footer-color` | Footer background color | "#1f2937" |
| `text_color` | Primary text color | "#000" |
| `background_color` | Main background | "#1f2937" |
| `button_color` | Button background | "#fff" |
| `button-text_color` | Button text color | "#000" |
| `heading_font_size` | Heading size | "28px" |
| `body_font_size` | Body text size | "16px" |
| `font_family` | Font family | "Arial, sans-serif" |
| `border_radius` | Border radius | "8px" |

## 📋 Postman Testing

1. **Import Collection**: `Global_Styling_API_Postman_Collection.json`
2. **Use**: "Get Active Styling Theme (Custom Format)" request
3. **Check Response**: Look for `custom_format` field
4. **Test**: "Test Custom Format Access" request

## ✅ Ready to Use!

**Your custom JSON format is already working in production!** 

Use `response.custom_format` to access your exact field structure with `header-color`, `footer-color`, and `button-text_color`.

---

**🚀 No deployment needed - it's live and ready!**
