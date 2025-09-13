# Monthly Screenshots API - Enhanced with Pagination

## 🚀 **Fast Monthly Screenshots API with Pagination**

### **Base URL**
```
http://127.0.0.1:8004/api/users/monthly-screenshots/
```

### **Parameters**

| Parameter | Type    | Required | Default | Description |
|-----------|---------|----------|---------|-------------|
| `year`    | integer | Yes      | -       | Year (e.g., 2025) |
| `month`   | integer | Yes      | -       | Month (1-12, where 6=June/Haziran) |
| `user`    | string  | No       | -       | Filter by specific user email |
| `page`    | integer | No       | 1       | Page number for pagination |

### **Features**

✅ **Pagination**: Fixed 50 users per page  
✅ **Fast Performance**: Multi-threaded S3 operations  
✅ **Turkish Month Support**: Haziran, Temmuz, Ağustos, etc.  
✅ **WebP File Support**: Counts all image formats including .webp  
✅ **Smart Filtering**: Search by user email  
✅ **Optimized S3**: Paginated S3 operations for large folders  

### **Usage Examples**

#### 1. **Get Page 1 for June 2025 (All Users)**
```
GET /api/users/monthly-screenshots/?year=2025&month=6&page=1
```

#### 2. **Get Specific User for June 2025**
```
GET /api/users/monthly-screenshots/?year=2025&month=6&user=begumdamlasen&page=1
```

#### 3. **Get Page 2 for August 2025**
```
GET /api/users/monthly-screenshots/?year=2025&month=8&page=2
```

#### 4. **Get September 2025 Data**
```
GET /api/users/monthly-screenshots/?year=2025&month=9&page=1
```

### **Response Format**

```json
{
  "status": "success",
  "message": "Found X active users with screenshots for June 2025 (Page 1 of 3)",
  "data": {
    "month_info": {
      "year": 2025,
      "month": 6,
      "month_name": "June",
      "days_in_month": 30
    },
    "pagination": {
      "page": 1,
      "page_size": 50,
      "total_pages": 3,
      "total_users": 125,
      "has_next": true,
      "has_previous": false,
      "next_page": 2,
      "previous_page": null
    },
    "summary": {
      "total_users_scanned": 41,
      "active_users": 15,
      "inactive_users": 26,
      "total_screenshots": 2500,
      "avg_screenshots_per_active_user": 166.67,
      "users_on_this_page": 15
    },
    "users": [
      {
        "user": "begumdamlasen_at_gmail.com",
        "user_display": "begumdamlasen@gmail.com",
        "screenshots_count": 999,
        "active_days": 1,
        "daily_data": [
          {
            "folder": "_DDS_Haziran_2025_Sanal_Asistanlik_Süreci",
            "screenshots_count": 999,
            "folder_path": "screenshots/begumdamlasen_at_gmail.com/_DDS_Haziran_2025_Sanal_Asistanlik_Süreci/"
          }
        ],
        "avg_screenshots_per_day": 999.0,
        "matching_folders": ["_DDS_Haziran_2025_Sanal_Asistanlik_Süreci"]
      }
    ],
    "generated_at": "2025-09-13T11:15:45.123456"
  }
}
```

### **Performance Optimizations**

🔧 **Multi-threading**: Processes multiple users simultaneously  
🔧 **S3 Pagination**: Handles large folders efficiently  
🔧 **Memory Efficient**: Limits S3 operations to prevent timeouts  
🔧 **Fast Sorting**: Optimized user sorting by screenshot count  
🔧 **Batch Processing**: Groups S3 operations for better performance  

### **Navigation Examples**

#### **Get Next Page**
```javascript
// If current response shows "has_next": true and "next_page": 2
GET /api/users/monthly-screenshots/?year=2025&month=6&page=2
```

#### **Get Previous Page**
```javascript
// If current response shows "has_previous": true and "previous_page": 1
GET /api/users/monthly-screenshots/?year=2025&month=6&page=1
```

### **Error Responses**

```json
{
  "status": "error",
  "message": "Month must be between 1 and 12"
}
```

### **Turkish Month Mapping**

| Month # | English | Turkish  |
|---------|---------|----------|
| 1       | January | Ocak     |
| 2       | February| Şubat    |
| 3       | March   | Mart     |
| 4       | April   | Nisan    |
| 5       | May     | Mayıs    |
| 6       | June    | Haziran  |
| 7       | July    | Temmuz   |
| 8       | August  | Ağustos  |
| 9       | September| Eylül   |
| 10      | October | Ekim     |
| 11      | November| Kasım    |
| 12      | December| Aralık   |

### **Testing in Postman**

1. **Import URL**: `http://127.0.0.1:8004/api/users/monthly-screenshots/`
2. **Set Method**: GET
3. **Add Parameters**:
   - `year`: 2025
   - `month`: 6
   - `page`: 1
   - `user`: begumdamlasen (optional)
4. **Send Request**

### **Performance Notes**

- **Fast Loading**: Multi-threaded processing reduces response time
- **Memory Efficient**: Pagination prevents large data transfers  
- **S3 Optimized**: Smart S3 operations reduce API calls
- **Scalable**: Handles thousands of users efficiently

🎯 **Ready for Production Use!**
