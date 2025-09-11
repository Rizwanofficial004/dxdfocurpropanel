# 🎨 DDS Focus Pro Complete Theme API - Postman Testing Guide

## 🚀 API Endpoint
```
https://dxdtime.ddsolutions.io/api/styling/global/
```

---

## 📥 GET Request - Retrieve Current Theme

### Method: `GET`
### URL: `https://dxdtime.ddsolutions.io/api/styling/global/`
### Headers: 
```
(No headers required)
```

### Expected Response:
```json
{
  "theme_name": "DDS Focus Pro Complete Theme",
  "description": "Complete color configuration for DDS Focus Pro",
  "primary_color": "#006039",
  "secondary_color": "#6c757d",
  "background_color": "#ECF0F1",
  "button_color": "#007bff",
  "text_color": "#2C3E50",
  "header_color": "#003366",
  "footer_color": "#003366",
  "button_text_color": "#ffffff",
  "submit_button_bg_color": "#28a745",
  "submit_button_text_color": "#ffffff",
  "primary_button_bg_color": "#007bff",
  "primary_button_text_color": "#ffffff",
  "secondary_button_bg_color": "#6c757d",
  "secondary_button_text_color": "#ffffff",
  "drawer_background_color": "#f8f9fa",
  "drawer_text_color": "#212529",
  "icon_color": "#6c757d",
  "top_color": "#006039",
  "primary_dark": "#004d2e",
  "primary_darker": "#003d24",
  "primary_light": "#00804d",
  "primary_hover": "#005530",
  "primary_active": "#004426",
  "secondary_dark": "#5a6268",
  "secondary_light": "#adb5bd",
  "success_color": "#28a745",
  "warning_color": "#ffc107",
  "danger_color": "#dc3545",
  "danger_dark": "#c82333",
  "info_color": "#17a2b8",
  "text_light": "#6c757d",
  "text_dark": "#212529",
  "background_light": "#f8f9fa",
  "background_dark": "#343a40",
  "border_color": "#dee2e6",
  "button_hover": "#0056b3",
  "button_dark": "#004085",
  "button_light": "#66b3ff",
  "state_idle": "#6c757d",
  "state_work": "#006039",
  "state_break": "#ffc107",
  "state_meeting": "#17a2b8",
  "drawer_overlay": "rgba(0, 0, 0, 0.6)",
  "drawer_border": "rgba(0, 96, 57, 0.1)",
  "drawer_shadow": "rgba(0, 96, 57, 0.15)",
  "modal_background": "#ffffff",
  "modal_overlay": "rgba(0, 0, 0, 0.6)",
  "modal_border": "#dee2e6",
  "input_background": "#ffffff",
  "input_border": "#ced4da",
  "input_focus": "#80bdff",
  "input_text": "#495057",
  "nav_background": "#003366",
  "nav_text": "#ffffff",
  "nav_hover": "rgba(255, 255, 255, 0.1)",
  "nav_active": "#0056b3",
  "white": "#ffffff",
  "black": "#000000",
  "gray_100": "#f8f9fa",
  "gray_200": "#e9ecef",
  "gray_300": "#dee2e6",
  "gray_400": "#ced4da",
  "gray_500": "#adb5bd",
  "gray_600": "#6c757d",
  "gray_700": "#495057",
  "gray_800": "#343a40",
  "gray_900": "#212529",
  "heading_font_size": "36px",
  "body_font_size": "18px",
  "font_family": "Segoe UI, sans-serif",
  "border_radius": "10px"
}
```

---

## 📤 POST Request - Create/Update Theme

### Method: `POST`
### URL: `https://dxdtime.ddsolutions.io/api/styling/global/`
### Headers:
```
Content-Type: application/json
```

---

## 🎯 POST Body Examples

### Example 1: Complete DDS Focus Pro Theme
```json
{
  "theme_name": "DDS Focus Pro Complete Theme",
  "description": "Complete color configuration for DDS Focus Pro",
  
  "primary_color": "#006039",
  "secondary_color": "#6c757d",
  "background_color": "#ECF0F1",
  "button_color": "#007bff",
  "text_color": "#2C3E50",
  
  "header_color": "#003366",
  "footer_color": "#003366",
  "button_text_color": "#ffffff",
  
  "submit_button_bg_color": "#28a745",
  "submit_button_text_color": "#ffffff",
  "primary_button_bg_color": "#007bff",
  "primary_button_text_color": "#ffffff",
  "secondary_button_bg_color": "#6c757d",
  "secondary_button_text_color": "#ffffff",
  
  "drawer_background_color": "#f8f9fa",
  "drawer_text_color": "#212529",
  "icon_color": "#6c757d",
  "top_color": "#006039",
  
  "primary_dark": "#004d2e",
  "primary_darker": "#003d24",
  "primary_light": "#00804d",
  "primary_hover": "#005530",
  "primary_active": "#004426",
  
  "secondary_dark": "#5a6268",
  "secondary_light": "#adb5bd",
  
  "success_color": "#28a745",
  "warning_color": "#ffc107",
  "danger_color": "#dc3545",
  "danger_dark": "#c82333",
  "info_color": "#17a2b8",
  
  "text_light": "#6c757d",
  "text_dark": "#212529",
  "background_light": "#f8f9fa",
  "background_dark": "#343a40",
  "border_color": "#dee2e6",
  
  "button_hover": "#0056b3",
  "button_dark": "#004085",
  "button_light": "#66b3ff",
  
  "state_idle": "#6c757d",
  "state_work": "#006039",
  "state_break": "#ffc107",
  "state_meeting": "#17a2b8",
  
  "drawer_overlay": "rgba(0, 0, 0, 0.6)",
  "drawer_border": "rgba(0, 96, 57, 0.1)",
  "drawer_shadow": "rgba(0, 96, 57, 0.15)",
  
  "modal_background": "#ffffff",
  "modal_overlay": "rgba(0, 0, 0, 0.6)",
  "modal_border": "#dee2e6",
  
  "input_background": "#ffffff",
  "input_border": "#ced4da",
  "input_focus": "#80bdff",
  "input_text": "#495057",
  
  "nav_background": "#003366",
  "nav_text": "#ffffff",
  "nav_hover": "rgba(255, 255, 255, 0.1)",
  "nav_active": "#0056b3",
  
  "white": "#ffffff",
  "black": "#000000",
  "gray_100": "#f8f9fa",
  "gray_200": "#e9ecef",
  "gray_300": "#dee2e6",
  "gray_400": "#ced4da",
  "gray_500": "#adb5bd",
  "gray_600": "#6c757d",
  "gray_700": "#495057",
  "gray_800": "#343a40",
  "gray_900": "#212529",
  
  "heading_font_size": "36px",
  "body_font_size": "18px",
  "font_family": "Segoe UI, sans-serif",
  "border_radius": "10px"
}
```

### Example 2: Minimal Theme (Just Key Colors)
```json
{
  "theme_name": "Minimal Test Theme",
  "description": "Testing with minimal colors",
  "primary_color": "#ff6b6b",
  "secondary_color": "#4ecdc4",
  "background_color": "#ffe66d",
  "text_color": "#2d3436",
  "header_color": "#e17055",
  "state_work": "#00b894",
  "state_break": "#fdcb6e"
}
```

### Example 3: Dark Theme
```json
{
  "theme_name": "Dark Mode Theme",
  "description": "Dark theme for DDS Focus Pro",
  "primary_color": "#bb86fc",
  "secondary_color": "#03dac6",
  "background_color": "#121212",
  "text_color": "#ffffff",
  "header_color": "#1f1f1f",
  "footer_color": "#1f1f1f",
  "nav_background": "#1f1f1f",
  "drawer_background_color": "#1e1e1e",
  "modal_background": "#2d2d2d",
  "state_work": "#bb86fc",
  "state_break": "#ff9800",
  "button_color": "#bb86fc",
  "success_color": "#4caf50",
  "warning_color": "#ff9800",
  "danger_color": "#f44336"
}
```

### Example 4: Complete Login & Modal Theme
```json
{
  "theme_name": "Complete Authentication Theme",
  "description": "Full theme with login page and modal colors",
  "primary_color": "#006039",
  "secondary_color": "#17a2b8",
  "background_color": "#f8f9fa",
  "text_color": "#212529",
  "header_color": "#003366",
  "footer_color": "#003366",
  "button_color": "#006039",
  
  "login_background": "#e3f2fd",
  "login_header_bg": "#1976d2",
  "login_card_bg": "#ffffff",
  "login_input_bg": "#fafafa",
  "login_input_border": "#2196f3",
  "login_input_focus": "#1976d2",
  "login_button_bg": "#2196f3",
  "login_button_text": "#ffffff",
  "login_button_hover": "#1976d2",
  "login_text_primary": "#1565c0",
  "login_text_secondary": "#757575",
  "login_link_color": "#1976d2",
  "login_error_color": "#f44336",
  "login_success_color": "#4caf50",
  
  "modal_overlay_bg": "rgba(0, 0, 0, 0.7)",
  "modal_content_bg": "#ffffff",
  "modal_header_bg": "#f5f5f5",
  "modal_border_color": "#e0e0e0",
  "modal_shadow": "rgba(0, 0, 0, 0.3)",
  "modal_close_bg": "#f5f5f5",
  "modal_close_hover": "#eeeeee",
  
  "input_valid_border": "#4caf50",
  "input_invalid_border": "#f44336",
  "input_placeholder": "#9e9e9e",
  "checkbox_bg": "#ffffff",
  "checkbox_checked": "#2196f3",
  
  "language_dropdown_bg": "#ffffff",
  "language_option_hover": "#f5f5f5",
  "language_border": "#e0e0e0",
  
  "state_work": "#4caf50",
  "state_break": "#ff9800",
  "state_meeting": "#9c27b0",
  "nav_background": "#1976d2"
}
```

### Example 5: Testing Specific Colors
```json
{
  "theme_name": "Color Test Theme",
  "primary_color": "#000000",
  "state_work": "#ff0000",
  "nav_background": "#00ff00",
  "gray_500": "#0000ff"
}
```

---

## 🧪 Testing Steps in Postman

### Step 1: Test GET (Initial State)
1. Create a new GET request
2. Set URL: `https://dxdtime.ddsolutions.io/api/styling/global/`
3. Click **Send**
4. Check response status (should be 200)
5. Note the current theme values

### Step 2: Test POST (Create New Theme)
1. Create a new POST request
2. Set URL: `https://dxdtime.ddsolutions.io/api/styling/global/`
3. Go to **Headers** tab, add:
   - Key: `Content-Type`
   - Value: `application/json`
4. Go to **Body** tab, select **raw** and **JSON**
5. Paste one of the example JSON bodies above
6. Click **Send**
7. Check response status (should be 201)
8. Verify the response contains your posted values

### Step 3: Test GET (After POST)
1. Use the same GET request from Step 1
2. Click **Send**
3. Verify the response now shows your new theme values
4. Compare with what you posted to ensure it matches

### Step 4: Test Color Changes
1. Use Example 4 (Color Test Theme) to test specific colors
2. POST the test colors
3. GET to verify they were saved correctly
4. Try changing individual colors and test again

---

## ✅ Expected Results

### POST Success (201 Created):
- Response contains all the colors you sent
- theme_name matches what you posted
- All color fields are present (not null)

### GET Success (200 OK):
- Returns the active theme
- All color values match what you last posted
- Contains 75+ color fields

---

## 🚨 Troubleshooting

### If POST returns 400:
- Check JSON syntax (use a JSON validator)
- Ensure Content-Type header is set
- Verify color values are valid (HEX or RGB format)

### If colors show as null in GET:
- The production server may need to be restarted
- Check that POST was successful (201 status)

### If GET returns default values:
- No theme has been created yet
- POST a theme first, then GET

---

## 🎨 Color Format Examples

### Valid Color Formats:
- HEX: `"#006039"`, `"#fff"`, `"#FF5733"`
- RGB: `"rgb(0, 96, 57)"`, `"rgb(255, 255, 255)"`
- RGBA: `"rgba(0, 96, 57, 0.8)"`, `"rgba(0, 0, 0, 0.6)"`

### Invalid Formats:
- Missing #: `"006039"`
- Invalid characters: `"#gggggg"`
- Wrong RGB range: `"rgb(300, 400, 500)"`

---

## 📊 Testing Checklist

- [ ] GET request works (200 response)
- [ ] POST request works (201 response)
- [ ] Posted colors appear in GET response
- [ ] All 75+ color fields are supported
- [ ] Typography fields work (font_size, font_family)
- [ ] Theme name and description are saved
- [ ] Invalid colors return 400 error
- [ ] Multiple themes can be created (latest becomes active)

Happy testing! 🚀
