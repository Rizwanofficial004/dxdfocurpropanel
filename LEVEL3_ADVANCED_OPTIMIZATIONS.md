# 🚀 Level 3 S3 Pagination - Advanced Optimizations

## 🎯 Next Level Enhancements

Now that your basic S3 pagination is working, let's implement advanced optimizations for better performance and user experience.

## 🔧 Performance Optimizations

### 1. **S3 Native Pagination with Continuation Tokens**

Current approach loads ALL objects then paginates in memory. Let's implement true S3 pagination:

```python
# dashboard/s3_pagination_utils.py
import boto3
from django.conf import settings

def list_s3_screenshots_paginated(employee_email, folder_name, limit=50, continuation_token=None):
    """
    Native S3 pagination using continuation tokens
    Only loads the exact objects needed for current page
    """
    s3_client = boto3.client('s3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME
    )
    
    bucket_name = "ddsfocustime"
    email_prefix = employee_email.replace('@', '_at_')
    s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
    
    # S3 pagination parameters
    params = {
        'Bucket': bucket_name,
        'Prefix': s3_prefix,
        'MaxKeys': limit,
        'Delimiter': ''
    }
    
    if continuation_token:
        params['ContinuationToken'] = continuation_token
    
    try:
        response = s3_client.list_objects_v2(**params)
        
        screenshots = []
        if 'Contents' in response:
            for obj in response['Contents']:
                key = obj['Key']
                
                # Skip folder markers
                if key.endswith('/'):
                    continue
                    
                # Only process image files
                if not is_image_file(key):
                    continue
                
                filename = key.split('/')[-1]
                
                # Generate presigned URL
                presigned_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket_name, 'Key': key},
                    ExpiresIn=3600
                )
                
                # Parse metadata
                metadata = parse_screenshot_metadata(filename, key, obj)
                
                screenshots.append({
                    "id": generate_screenshot_id(key),
                    "filename": filename,
                    "s3_key": key,
                    "presigned_url": presigned_url,
                    "timestamp": metadata["timestamp"],
                    "time_display": metadata["time_display"],
                    "application": metadata["application"],
                    "window_title": metadata["window_title"],
                    "size_bytes": obj.get('Size', 0),
                    "size_mb": round(obj.get('Size', 0) / (1024 * 1024), 2),
                    "last_modified": obj.get('LastModified').isoformat() if obj.get('LastModified') else None
                })
        
        return {
            'screenshots': screenshots,
            'total_returned': len(screenshots),
            'is_truncated': response.get('IsTruncated', False),
            'next_token': response.get('NextContinuationToken'),
            'key_count': response.get('KeyCount', 0)
        }
        
    except Exception as e:
        logger.error(f"S3 pagination error: {str(e)}")
        return {
            'screenshots': [],
            'total_returned': 0,
            'is_truncated': False,
            'next_token': None,
            'error': str(e)
        }

def count_total_s3_screenshots(employee_email, folder_name):
    """
    Get total count of screenshots in folder without loading all data
    """
    s3_client = boto3.client('s3')
    bucket_name = "ddsfocustime"
    email_prefix = employee_email.replace('@', '_at_')
    s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
    
    total_count = 0
    continuation_token = None
    
    try:
        while True:
            params = {
                'Bucket': bucket_name,
                'Prefix': s3_prefix,
                'MaxKeys': 1000
            }
            
            if continuation_token:
                params['ContinuationToken'] = continuation_token
            
            response = s3_client.list_objects_v2(**params)
            
            if 'Contents' in response:
                # Count only image files, skip folders
                count = sum(1 for obj in response['Contents'] 
                           if not obj['Key'].endswith('/') and is_image_file(obj['Key']))
                total_count += count
            
            if not response.get('IsTruncated', False):
                break
                
            continuation_token = response.get('NextContinuationToken')
            
        return total_count
        
    except Exception as e:
        logger.error(f"Error counting S3 screenshots: {str(e)}")
        return 0

def is_image_file(filename):
    """Check if file is an image"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'}
    ext = os.path.splitext(filename.lower())[1]
    return ext in image_extensions
```

### 2. **Enhanced API with True S3 Pagination**

```python
# dashboard/api_views.py - Enhanced employee_folder_screenshots_api

@csrf_exempt
@require_http_methods(["GET"])
def employee_folder_screenshots_api_enhanced(request, employee_email, folder_name):
    """
    Enhanced Employee Folder Screenshots API with native S3 pagination
    Much faster for large folders (1000+ screenshots)
    """
    try:
        # Validate email format
        if not validate_email_format(employee_email):
            return api_response(success=False, message="Invalid email format", status_code=400)
        
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        use_s3_pagination = request.GET.get('s3_pagination', 'true').lower() == 'true'
        
        # Validate parameters
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 50
        
        if use_s3_pagination:
            # Method 1: True S3 pagination (recommended for large folders)
            # Calculate which S3 "page" we need
            s3_page_size = 100  # S3 page size
            skip_count = (page - 1) * limit
            s3_pages_to_skip = skip_count // s3_page_size
            offset_in_s3_page = skip_count % s3_page_size
            
            # Get total count (cached for performance)
            cache_key = f"screenshot_count_{employee_email}_{folder_name}"
            total_screenshots = cache.get(cache_key)
            if total_screenshots is None:
                total_screenshots = count_total_s3_screenshots(employee_email, folder_name)
                cache.set(cache_key, total_screenshots, 3600)  # Cache for 1 hour
            
            # Load S3 data with continuation tokens
            all_screenshots = []
            continuation_token = None
            
            # Skip to the right S3 page
            for _ in range(s3_pages_to_skip):
                temp_result = list_s3_screenshots_paginated(
                    employee_email, folder_name, s3_page_size, continuation_token
                )
                continuation_token = temp_result.get('next_token')
                if not continuation_token:
                    break
            
            # Load the actual page we want
            while len(all_screenshots) < limit:
                result = list_s3_screenshots_paginated(
                    employee_email, folder_name, s3_page_size, continuation_token
                )
                
                if not result['screenshots']:
                    break
                
                # Add screenshots with offset
                start_idx = max(0, offset_in_s3_page - len(all_screenshots))
                screenshots_to_add = result['screenshots'][start_idx:start_idx + (limit - len(all_screenshots))]
                all_screenshots.extend(screenshots_to_add)
                
                continuation_token = result.get('next_token')
                if not continuation_token:
                    break
                    
                offset_in_s3_page = 0  # Reset offset after first page
            
            paginated_screenshots = all_screenshots[:limit]
            
        else:
            # Method 2: Load all then paginate (current method, good for small folders)
            result = list_all_s3_screenshots_traditional(employee_email, folder_name)
            all_screenshots = result['screenshots']
            total_screenshots = len(all_screenshots)
            
            # Apply pagination
            offset = (page - 1) * limit
            paginated_screenshots = all_screenshots[offset:offset + limit]
        
        # Calculate pagination info
        total_pages = max(1, (total_screenshots + limit - 1) // limit)
        
        # Get employee info
        employee_name = get_employee_display_name(employee_email)
        
        # Parse folder date if it's a date folder
        folder_date = None
        try:
            folder_date = datetime.strptime(folder_name, '%Y-%m-%d')
        except ValueError:
            pass
        
        # Prepare response
        response_data = {
            "folder_info": {
                "folder_name": folder_name,
                "employee_name": employee_name,
                "employee_email": employee_email,
                "folder_display_name": format_folder_display_name(folder_name, folder_date),
                "is_date_folder": folder_date is not None,
                "folder_date": folder_date.isoformat() if folder_date else None
            },
            "screenshots": paginated_screenshots,
            "pagination": {
                "current_page": page,
                "total_pages": total_pages,
                "total_screenshots": total_screenshots,
                "limit": limit,
                "offset": (page - 1) * limit,
                "has_next": page < total_pages,
                "has_previous": page > 1,
                "next_page": page + 1 if page < total_pages else None,
                "previous_page": page - 1 if page > 1 else None,
                "pagination_method": "s3_native" if use_s3_pagination else "traditional"
            },
            "performance": {
                "method_used": "s3_native" if use_s3_pagination else "traditional",
                "recommended_for_large_folders": total_screenshots > 500
            }
        }
        
        return api_response(
            success=True,
            message=f"Found {total_screenshots} screenshots in {folder_name} for {employee_email}",
            data=response_data
        )
        
    except Exception as e:
        logger.error(f"Enhanced folder screenshots API error: {str(e)}")
        return api_response(
            success=False,
            message="Error retrieving folder screenshots",
            status_code=500
        )
```

### 3. **Frontend with Infinite Scroll Option**

```html
<!-- enhanced_level3_pagination_demo.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Level 3 S3 Pagination</title>
    <style>
        /* ... existing styles ... */
        
        .pagination-mode {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
        }
        
        .mode-btn {
            padding: 10px 20px;
            border: 2px solid #667eea;
            background: white;
            color: #667eea;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .mode-btn.active {
            background: #667eea;
            color: white;
        }
        
        .infinite-scroll-loader {
            text-align: center;
            padding: 40px;
            display: none;
        }
        
        .performance-info {
            background: #e3f2fd;
            border: 2px solid #2196f3;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Enhanced Level 3 S3 Pagination</h1>
            <p>Advanced pagination with infinite scroll and performance optimizations</p>
        </div>

        <div class="demo-section">
            <!-- Pagination Mode Selection -->
            <div class="pagination-mode">
                <button class="mode-btn active" id="paginationMode" onclick="setPaginationMode('pagination')">
                    📄 Standard Pagination
                </button>
                <button class="mode-btn" id="infiniteMode" onclick="setPaginationMode('infinite')">
                    ♾️ Infinite Scroll
                </button>
                <button class="mode-btn" id="s3NativeMode" onclick="toggleS3Native()">
                    ⚡ S3 Native Pagination
                </button>
            </div>

            <!-- Performance Info -->
            <div id="performanceInfo" class="performance-info" style="display: none;"></div>

            <!-- ... existing search container ... -->

            <!-- Screenshots Grid -->
            <div id="screenshotsGrid" class="screenshots-grid"></div>
            
            <!-- Infinite Scroll Loader -->
            <div id="infiniteLoader" class="infinite-scroll-loader">
                <div class="spinner"></div>
                <div>Loading more screenshots...</div>
            </div>

            <!-- ... existing pagination container ... -->
        </div>
    </div>

    <script>
        let currentMode = 'pagination'; // 'pagination' or 'infinite'
        let useS3Native = true;
        let currentData = null;
        let allLoadedScreenshots = []; // For infinite scroll
        let isLoading = false;
        let hasMore = true;

        function setPaginationMode(mode) {
            currentMode = mode;
            
            // Update button states
            document.getElementById('paginationMode').classList.toggle('active', mode === 'pagination');
            document.getElementById('infiniteMode').classList.toggle('active', mode === 'infinite');
            
            // Reset and reload
            allLoadedScreenshots = [];
            if (mode === 'infinite') {
                setupInfiniteScroll();
                loadScreenshots(1);
            } else {
                removeInfiniteScroll();
                loadScreenshots(1);
            }
        }

        function toggleS3Native() {
            useS3Native = !useS3Native;
            document.getElementById('s3NativeMode').classList.toggle('active', useS3Native);
            
            // Reload current page
            if (currentMode === 'pagination') {
                loadScreenshots(parseInt(document.getElementById('pageInput').value) || 1);
            } else {
                allLoadedScreenshots = [];
                loadScreenshots(1);
            }
        }

        async function loadScreenshots(page = 1, append = false) {
            if (isLoading) return;
            isLoading = true;

            const employeeEmail = document.getElementById('employeeEmail').value;
            const folderName = document.getElementById('folderName').value;
            const limit = parseInt(document.getElementById('limitInput').value);

            if (!employeeEmail || !folderName) {
                showError('Please select both employee email and folder name');
                isLoading = false;
                return;
            }

            if (!append) {
                showLoading();
            } else {
                document.getElementById('infiniteLoader').style.display = 'block';
            }

            try {
                const startTime = Date.now();
                
                const url = `https://dxdtime.ddsolutions.io/api/screenshots/employee/${encodeURIComponent(employeeEmail)}/folder/${encodeURIComponent(folderName)}/?page=${page}&limit=${limit}&s3_pagination=${useS3Native}`;
                
                console.log('Loading from:', url);
                
                const response = await fetch(url);
                const responseTime = Date.now() - startTime;
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    currentData = data.data;
                    
                    // Show performance info
                    displayPerformanceInfo(data.data.performance, responseTime);
                    
                    if (currentMode === 'infinite' && append) {
                        // Append to existing screenshots
                        allLoadedScreenshots = [...allLoadedScreenshots, ...data.data.screenshots];
                        displayScreenshots(allLoadedScreenshots);
                        
                        // Check if there are more pages
                        hasMore = data.data.pagination.has_next;
                        if (!hasMore) {
                            document.getElementById('infiniteLoader').style.display = 'none';
                        }
                    } else {
                        // Replace screenshots
                        if (currentMode === 'infinite') {
                            allLoadedScreenshots = data.data.screenshots;
                            hasMore = data.data.pagination.has_next;
                        }
                        displayResults(data.data, responseTime);
                    }
                } else {
                    showError(data.message || 'Failed to load screenshots');
                }
            } catch (error) {
                console.error('Load screenshots error:', error);
                showError(`Network error: ${error.message}`);
            } finally {
                isLoading = false;
                document.getElementById('infiniteLoader').style.display = 'none';
            }
        }

        function displayPerformanceInfo(performance, responseTime) {
            const info = document.getElementById('performanceInfo');
            if (performance) {
                info.innerHTML = `
                    <strong>⚡ Performance Info:</strong> 
                    Method: ${performance.method_used} | 
                    Response Time: ${responseTime}ms | 
                    ${performance.recommended_for_large_folders ? '💡 S3 Native recommended for this folder size' : '✅ Current method optimal'}
                `;
                info.style.display = 'block';
            } else {
                info.style.display = 'none';
            }
        }

        function setupInfiniteScroll() {
            window.addEventListener('scroll', handleInfiniteScroll);
            document.getElementById('paginationContainer').style.display = 'none';
        }

        function removeInfiniteScroll() {
            window.removeEventListener('scroll', handleInfiniteScroll);
            document.getElementById('paginationContainer').style.display = 'flex';
        }

        function handleInfiniteScroll() {
            if (currentMode !== 'infinite' || isLoading || !hasMore) return;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Load more when 200px from bottom
            if (scrollTop + windowHeight >= documentHeight - 200) {
                const nextPage = Math.floor(allLoadedScreenshots.length / parseInt(document.getElementById('limitInput').value)) + 1;
                loadScreenshots(nextPage, true);
            }
        }

        // Enhanced display functions
        function displayResults(data, responseTime) {
            hideAllStates();

            if (data.screenshots.length === 0) {
                document.getElementById('noResultsState').style.display = 'block';
                return;
            }

            displayFolderInfo(data, responseTime);
            
            if (currentMode === 'pagination') {
                displayPagination(data.pagination);
            }
            
            displayScreenshots(currentMode === 'infinite' ? allLoadedScreenshots : data.screenshots);
            document.getElementById('successState').style.display = 'block';
        }

        // ... rest of existing functions ...

        // Initialize
        window.addEventListener('load', function() {
            loadScreenshots(1);
        });
    </script>
</body>
</html>
```

## 🎯 Advanced Features

### 4. **Image Lazy Loading with Intersection Observer**

```javascript
// Enhanced image loading
class ScreenshotImageLoader {
    constructor() {
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            { threshold: 0.1, rootMargin: '50px' }
        );
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loading');
            
            img.onload = () => {
                img.classList.remove('loading');
                img.classList.add('loaded');
            };
            
            img.onerror = () => {
                img.classList.remove('loading');
                img.classList.add('error');
                img.src = '/static/images/image-placeholder.svg';
            };
        }
    }

    observe(img) {
        this.observer.observe(img);
    }
}

const imageLoader = new ScreenshotImageLoader();
```

### 5. **Caching Strategy**

```python
# dashboard/cache_utils.py
from django.core.cache import cache
import hashlib

def get_screenshot_cache_key(employee_email, folder_name, page, limit):
    """Generate cache key for screenshot data"""
    key_data = f"{employee_email}_{folder_name}_{page}_{limit}"
    return f"screenshots_{hashlib.md5(key_data.encode()).hexdigest()}"

def cache_screenshot_data(employee_email, folder_name, page, limit, data, timeout=1800):
    """Cache screenshot data for 30 minutes"""
    cache_key = get_screenshot_cache_key(employee_email, folder_name, page, limit)
    cache.set(cache_key, data, timeout)

def get_cached_screenshot_data(employee_email, folder_name, page, limit):
    """Get cached screenshot data"""
    cache_key = get_screenshot_cache_key(employee_email, folder_name, page, limit)
    return cache.get(cache_key)

# In your API view
def employee_folder_screenshots_api_cached(request, employee_email, folder_name):
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 50))
    
    # Try to get from cache first
    cached_data = get_cached_screenshot_data(employee_email, folder_name, page, limit)
    if cached_data:
        return api_response(success=True, data=cached_data, message="From cache")
    
    # Load from S3 if not cached
    data = load_screenshots_from_s3(employee_email, folder_name, page, limit)
    
    # Cache the result
    cache_screenshot_data(employee_email, folder_name, page, limit, data)
    
    return api_response(success=True, data=data)
```

## 🚀 Implementation Priority

1. **Immediate (High Impact)**:
   - ✅ Implement S3 native pagination for folders with 500+ images
   - ✅ Add caching for frequently accessed folders
   - ✅ Implement lazy loading for images

2. **Short Term (1-2 weeks)**:
   - ✅ Add infinite scroll option
   - ✅ Implement image optimization/thumbnails
   - ✅ Add search within folder

3. **Long Term (1 month)**:
   - ✅ Add real-time updates via WebSocket
   - ✅ Implement image analysis (OCR, object detection)
   - ✅ Add bulk operations (download, delete)

Would you like me to implement any of these specific optimizations next?
