# Employee-Specific Date Range API Examples

## For ilahe.avci2004@gmail.com Screenshots by Date Range

### 🎯 **Current Working Examples:**

```bash
# Get her screenshots for THIS MONTH (August 2025)
GET http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date_from=2025-08-01&date_to=2025-08-31

# Get her screenshots for LAST MONTH (July 2025)  
GET http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date_from=2025-07-01&date_to=2025-07-31

# Get her screenshots for SPECIFIC WEEK
GET http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date_from=2025-08-01&date_to=2025-08-07

# Get her screenshots for SPECIFIC DAY
GET http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date=2025-08-06

# Get her screenshots UP TO SPECIFIC DATE
GET http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date_to=2025-08-06
```

### 📊 **Current Results (August 6, 2025):**

- **ilahe.avci2004@gmail.com August 2025**: 509,972 screenshots
- **ilahe.avci2004@gmail.com July 2025**: 0 screenshots (no data)
- **ilahe.avci2004@gmail.com August 6 only**: 509,972 screenshots

### 🔧 **PowerShell Test Commands:**

```powershell
# Test this month for ilahe
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date_from=2025-08-01&date_to=2025-08-31" -Method GET

# Test last month for ilahe  
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date_from=2025-07-01&date_to=2025-07-31" -Method GET

# Test specific day for ilahe
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=ilahe.avci2004@gmail.com&date=2025-08-06" -Method GET
```

### 🎯 **For ANY Employee:**

Just replace the email parameter:

```bash
# For tugbacalik84@gmail.com this month
GET http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=tugbacalik84@gmail.com&date_from=2025-08-01&date_to=2025-08-31

# For begumdamlasen@gmail.com last month
GET http://127.0.0.1:8000/api/analytics/daily-screenshots/?email=begumdamlasen@gmail.com&date_from=2025-07-01&date_to=2025-07-31
```

### ⚠️ **Important Note:**

Your database currently only has August 6, 2025 data. So:
- ✅ **August date ranges** will show actual screenshots
- ❌ **July/other months** will show 0 screenshots  
- ✅ **Date filtering is working correctly**
- 📊 **You need historical data loaded for other months**

### 🚀 **Ready-to-Use API Format:**

```
http://127.0.0.1:8000/api/analytics/daily-screenshots/?email={EMAIL}&date_from={START_DATE}&date_to={END_DATE}
```

**Replace:**
- `{EMAIL}` with employee email
- `{START_DATE}` with start date (YYYY-MM-DD)  
- `{END_DATE}` with end date (YYYY-MM-DD)
