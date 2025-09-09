# 📋 Postman Testing Guide - Global Styling API

## 🎯 Quick Setup Instructions

### Step 1: Create New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it: "Global Styling API"
4. Click "Create"

### Step 2: Add POST Request - Create Styling Theme

1. **Right-click your collection** → "Add Request"
2. **Name**: "Create Custom Theme"
3. **Method**: POST
4. **URL**: `https://dxdtime.ddsolutions.io/api/styling/global/`

5. **Headers**:
   - Click "Headers" tab
   - Add: `Content-Type` = `application/json`

6. **Body**:
   - Click "Body" tab
   - Select "raw"
   - Choose "JSON" from dropdown
   - Paste this JSON:

```json
{
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
```

7. **Click "Send"**

### Step 3: Add GET Request - Get Active Theme

1. **Right-click your collection** → "Add Request"
2. **Name**: "Get Active Theme"
3. **Method**: GET
4. **URL**: `https://dxdtime.ddsolutions.io/api/styling/global/`
5. **No headers or body needed**
6. **Click "Send"**

---

## 🎯 Expected Results

### POST Request Response (Status: 201 Created)
```json
{
  "status": "success",
  "message": "Styling configuration 'My Custom Theme pagal' created successfully",
  "data": {
    "id": 13,
    "theme_name": "My Custom Theme pagal",
    "description": "My custom styling theme",
    "background_color": "#1f2937",
    "button_color": "#fff",
    "text_color": "#000",
    "heading_font_size": "28px",
    "body_font_size": "16px",
    "font_family": "Arial, sans-serif",
    "border_radius": "8px",
    "is_active": true,
    "css_variables": {
      "--background-color": "#1f2937",
      "--button-color": "#fff",
      "--text-color": "#000",
      "--heading-font-size": "28px",
      "--body-font-size": "16px",
      "--font-family": "Arial, sans-serif",
      "--border-radius": "8px"
    }
  }
}
```

### GET Request Response (Status: 200 OK)
```json
{
  "status": "success",
  "message": "Active styling configuration retrieved successfully",
  "data": {
    "id": 13,
    "theme_name": "My Custom Theme pagal",
    "description": "My custom styling theme",
    "is_active": true,
    "css_variables": {
      "--background-color": "#1f2937",
      "--button-color": "#fff",
      "--text-color": "#000",
      "--heading-font-size": "28px",
      "--body-font-size": "16px",
      "--font-family": "Arial, sans-serif",
      "--border-radius": "8px"
    }
  }
}
```

---

## 🧪 Additional Test Cases

### Test Case 1: Dark Mode Theme
**POST Request Body**:
```json
{
  "theme_name": "Dark Mode Professional",
  "description": "Professional dark theme",
  "header-color": "#1A1A1A",
  "footer-color": "#2D2D2D",
  "text_color": "#FFFFFF",
  "background_color": "#121212",
  "button_color": "#BB86FC",
  "button-text_color": "#000000",
  "heading_font_size": "26px",
  "body_font_size": "15px",
  "font_family": "Inter, sans-serif",
  "border_radius": "4px"
}
```

### Test Case 2: Light Mode Theme
**POST Request Body**:
```json
{
  "theme_name": "Clean Light Theme",
  "description": "Clean and modern light theme",
  "header-color": "#FFFFFF",
  "footer-color": "#F8F9FA",
  "text_color": "#333333",
  "background_color": "#FFFFFF",
  "button_color": "#007BFF",
  "button-text_color": "#FFFFFF",
  "heading_font_size": "24px",
  "body_font_size": "16px",
  "font_family": "System UI, -apple-system, sans-serif",
  "border_radius": "8px"
}
```

---

## 🔍 What to Look For

### ✅ Success Indicators:
- **Status Code**: 201 (POST) or 200 (GET)
- **Response contains**: `"status": "success"`
- **Theme ID**: New incremental ID for each theme
- **CSS Variables**: Available in response for frontend use
- **is_active**: true for newly created themes

### ❌ Common Issues:
- **400 Bad Request**: Invalid JSON format
- **404 Not Found**: Wrong URL
- **500 Server Error**: Server issue (rare)

---

## 💡 Pro Tips

1. **Save Responses**: Use Postman's "Save Response" to keep examples
2. **Environment Variables**: Create variables for the base URL
3. **Tests Tab**: Add assertions to verify responses
4. **Collection Variables**: Store theme IDs for reference

---

## 🎯 Quick Test Checklist

- [ ] Import collection file OR create requests manually
- [ ] Test POST request with your JSON
- [ ] Verify 201 status code and success message
- [ ] Test GET request
- [ ] Verify 200 status code and active theme data
- [ ] Check CSS variables in response
- [ ] Try creating multiple themes
- [ ] Confirm each new theme becomes active

**Ready to test!** 🚀
