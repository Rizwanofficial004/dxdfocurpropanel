const express = require('express');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const PORT = 8000;

// Enable CORS for all routes
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json());

// AWS Configuration with your credentials
AWS.config.update({
    accessKeyId: 'AKIARSU6EUUWMQ5I2JWC',
    secretAccessKey: 'sUt73C80S1DnEybvxa/Al7R1xAc+fsX9UzQKqNkS',
    region: 'eu-north-1'
});

const s3 = new AWS.S3();
const bucketName = 'ddsfocustime';

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to extract user email from S3 key
function extractUserFromKey(key) {
    // Assuming format: users_screenshots/2025-09-01/email@domain.com/screenshot.png
    const parts = key.split('/');
    if (parts.length >= 3) {
        return parts[2]; // Extract email from path
    }
    return null;
}

// Helper function to extract timestamp from filename
function extractTimestamp(filename) {
    // Look for timestamp patterns in filename
    const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2})[\s_-]*(\d{1,2}):(\d{2}):(\d{2})/);
    if (timestampMatch) {
        const [, date, hour, minute, second] = timestampMatch;
        return `${date}, ${hour}:${minute}:${second}`;
    }
    
    // Fallback: try to extract just date
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        return `${dateMatch[1]}, 12:00:00`;
    }
    
    return 'Unknown time';
}

// API endpoint to search for user screenshots
app.get('/api/users/search/', async (req, res) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 20;
        
        if (!query) {
            return res.status(400).json({
                status: 'error',
                message: 'Query parameter "q" is required'
            });
        }

        console.log(`🔍 Searching S3 for user: ${query}`);

        // List objects from S3 bucket
        const listParams = {
            Bucket: bucketName,
            Prefix: 'users_screenshots/',
            MaxKeys: 1000 // Get more objects to filter
        };

        const data = await s3.listObjectsV2(listParams).promise();
        
        console.log(`📁 Found ${data.Contents?.length || 0} total objects in S3`);

        if (!data.Contents || data.Contents.length === 0) {
            return res.json({
                status: 'success',
                data: {
                    users: [],
                    total_users: 0,
                    page: page,
                    page_size: pageSize,
                    total_pages: 0
                }
            });
        }

        // Filter objects that match the user query
        const userScreenshots = data.Contents.filter(obj => {
            const key = obj.Key.toLowerCase();
            const searchQuery = query.toLowerCase();
            
            // Check if the key contains the search query
            return key.includes(searchQuery) && key.endsWith('.png') || key.endsWith('.jpg') || key.endsWith('.jpeg');
        });

        console.log(`🎯 Found ${userScreenshots.length} screenshots matching "${query}"`);

        if (userScreenshots.length === 0) {
            return res.json({
                status: 'success',
                data: {
                    users: [],
                    total_users: 0,
                    page: page,
                    page_size: pageSize,
                    total_pages: 0
                }
            });
        }

        // Group screenshots by user and process them
        const userMap = new Map();
        
        userScreenshots.forEach(obj => {
            const userEmail = extractUserFromKey(obj.Key) || query;
            
            if (!userMap.has(userEmail)) {
                userMap.set(userEmail, {
                    email: userEmail,
                    screenshots: [],
                    total_screenshots: 0
                });
            }
            
            const userData = userMap.get(userEmail);
            
            // Generate S3 URL
            const screenshotUrl = `https://${bucketName}.s3.${AWS.config.region}.amazonaws.com/${obj.Key}`;
            
            // Extract timestamp from filename
            const filename = obj.Key.split('/').pop();
            const timestamp = extractTimestamp(filename);
            
            userData.screenshots.push({
                screenshot_url: screenshotUrl,
                timestamp: timestamp,
                file_size: formatFileSize(obj.Size),
                status: 'ACTIVE',
                filename: filename,
                last_modified: obj.LastModified.toISOString()
            });
            
            userData.total_screenshots++;
        });

        // Convert map to array and apply pagination
        const users = Array.from(userMap.values());
        
        // Sort screenshots by timestamp (most recent first)
        users.forEach(user => {
            user.screenshots.sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified));
        });

        // Apply pagination to screenshots within each user
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        users.forEach(user => {
            const totalScreenshots = user.screenshots.length;
            user.screenshots = user.screenshots.slice(startIndex, endIndex);
            user.total_screenshots = totalScreenshots;
        });

        const totalPages = Math.ceil(Math.max(...users.map(u => u.total_screenshots)) / pageSize);

        console.log(`✅ Returning ${users.length} users with screenshots`);

        res.json({
            status: 'success',
            data: {
                users: users,
                total_users: users.length,
                page: page,
                page_size: pageSize,
                total_pages: Math.max(1, totalPages)
            }
        });

    } catch (error) {
        console.error('❌ S3 API Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch data from S3',
            error: error.message
        });
    }
});

// API endpoint to list users
app.get('/api/users/list', async (req, res) => {
    try {
        const query = req.query.q || '';
        
        console.log(`📋 Listing users from S3, query: ${query}`);

        // List objects from S3 bucket
        const listParams = {
            Bucket: bucketName,
            Prefix: 'users_screenshots/',
            Delimiter: '/',
            MaxKeys: 1000
        };

        const data = await s3.listObjectsV2(listParams).promise();
        
        // Extract user folders
        const users = [];
        if (data.CommonPrefixes) {
            data.CommonPrefixes.forEach(prefix => {
                const parts = prefix.Prefix.split('/');
                if (parts.length >= 3) {
                    const userEmail = parts[2];
                    if (!query || userEmail.toLowerCase().includes(query.toLowerCase())) {
                        users.push({
                            email: userEmail,
                            folder_path: prefix.Prefix
                        });
                    }
                }
            });
        }

        console.log(`✅ Found ${users.length} users`);

        res.json({
            status: 'success',
            data: {
                users: users,
                total_users: users.length
            }
        });

    } catch (error) {
        console.error('❌ S3 List Users Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to list users from S3',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'Backend server is running',
        timestamp: new Date().toISOString(),
        aws_region: AWS.config.region,
        s3_bucket: bucketName
    });
});

// Test S3 connection endpoint
app.get('/api/test-s3', async (req, res) => {
    try {
        console.log('🧪 Testing S3 connection...');
        
        const params = {
            Bucket: bucketName,
            MaxKeys: 5
        };
        
        const data = await s3.listObjectsV2(params).promise();
        
        res.json({
            status: 'success',
            message: 'S3 connection successful',
            bucket: bucketName,
            region: AWS.config.region,
            object_count: data.KeyCount,
            first_objects: data.Contents?.slice(0, 3).map(obj => ({
                key: obj.Key,
                size: formatFileSize(obj.Size),
                last_modified: obj.LastModified
            })) || []
        });
        
    } catch (error) {
        console.error('❌ S3 Test Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'S3 connection failed',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Backend API Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test S3: http://localhost:${PORT}/api/test-s3`);
    console.log(`🔍 Search API: http://localhost:${PORT}/api/users/search/?q=nawaz`);
    console.log(`📋 List Users: http://localhost:${PORT}/api/users/list`);
    console.log(`\n🔐 AWS Config:`);
    console.log(`   Region: eu-north-1`);
    console.log(`   Bucket: ddsfocustime`);
    console.log(`   Access Key: AKIARSU6EUUWMQ5I2JWC`);
});
