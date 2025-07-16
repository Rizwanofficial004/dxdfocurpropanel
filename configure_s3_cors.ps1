# S3 CORS Configuration Script for Live Tracking Images
# This script configures the S3 bucket to allow cross-origin requests from web browsers

Write-Host "🔧 S3 CORS Configuration for Live Tracking" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$bucketName = "ddsfocustime"
$region = "us-east-1"

# Check if AWS CLI is available
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI found: $($awsVersion -split ' ')[0]" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    Write-Host "   Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Test AWS credentials
Write-Host "🔑 Testing AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "✅ AWS credentials are valid" -ForegroundColor Green
    Write-Host "   Account: $($identity.Account)" -ForegroundColor White
    Write-Host "   User: $($identity.Arn)" -ForegroundColor White
} catch {
    Write-Host "❌ AWS credentials are not configured or invalid" -ForegroundColor Red
    Write-Host "   Run: aws configure" -ForegroundColor Yellow
    exit 1
}

# Test bucket access
Write-Host "`n📦 Testing S3 bucket access..." -ForegroundColor Yellow
try {
    $bucketLocation = aws s3api get-bucket-location --bucket $bucketName 2>&1 | ConvertFrom-Json
    Write-Host "✅ Bucket '$bucketName' is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot access bucket '$bucketName'" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Create CORS configuration
Write-Host "`n🌐 Configuring CORS settings..." -ForegroundColor Yellow

$corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
"@

# Save CORS config to temporary file
$tempFile = [System.IO.Path]::GetTempFileName() + ".json"
$corsConfig | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Apply CORS configuration
    aws s3api put-bucket-cors --bucket $bucketName --cors-configuration file://$tempFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CORS configuration applied successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to apply CORS configuration" -ForegroundColor Red
        exit 1
    }
} finally {
    # Clean up temp file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -Force
    }
}

# Verify CORS configuration
Write-Host "`n✅ Verifying CORS configuration..." -ForegroundColor Yellow
try {
    $currentCors = aws s3api get-bucket-cors --bucket $bucketName 2>&1 | ConvertFrom-Json
    Write-Host "✅ CORS configuration verified:" -ForegroundColor Green
    Write-Host "   Allowed Methods: $($currentCors.CORSRules[0].AllowedMethods -join ', ')" -ForegroundColor White
    Write-Host "   Allowed Origins: $($currentCors.CORSRules[0].AllowedOrigins -join ', ')" -ForegroundColor White
    Write-Host "   Max Age: $($currentCors.CORSRules[0].MaxAgeSeconds) seconds" -ForegroundColor White
} catch {
    Write-Host "⚠️ Could not verify CORS configuration, but it may still be applied" -ForegroundColor Yellow
}

# Check bucket policy for public read access
Write-Host "`n🔓 Checking bucket policy..." -ForegroundColor Yellow
try {
    $bucketPolicy = aws s3api get-bucket-policy --bucket $bucketName 2>&1 | ConvertFrom-Json
    Write-Host "✅ Bucket policy exists" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No bucket policy found or access denied" -ForegroundColor Yellow
    Write-Host "   Consider adding a policy for public read access to screenshots/" -ForegroundColor Yellow
}

# Test a sample image URL
Write-Host "`n🖼️ Testing image accessibility..." -ForegroundColor Yellow
try {
    # Get a sample image from the bucket
    $objects = aws s3api list-objects-v2 --bucket $bucketName --prefix "screenshots/" --max-items 5 2>&1 | ConvertFrom-Json
    
    if ($objects.Contents -and $objects.Contents.Count -gt 0) {
        $sampleKey = $objects.Contents[0].Key
        $sampleUrl = "https://$bucketName.s3.$region.amazonaws.com/$sampleKey"
        
        Write-Host "   Testing URL: $sampleUrl" -ForegroundColor White
        
        # Test direct access
        try {
            $response = Invoke-WebRequest -Uri $sampleUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
            Write-Host "✅ Direct S3 URL is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
        } catch {
            if ($_.Exception.Response.StatusCode -eq 403) {
                Write-Host "❌ Direct S3 URL access denied (403)" -ForegroundColor Red
                Write-Host "   This is normal if bucket is not configured for public read" -ForegroundColor Yellow
                Write-Host "   Presigned URLs should still work" -ForegroundColor Yellow
            } else {
                Write-Host "❌ Error accessing URL: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "⚠️ No images found in screenshots/ directory" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Could not test image accessibility: $_" -ForegroundColor Yellow
}

Write-Host "`n✨ CORS Configuration Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test your live tracking dashboard" -ForegroundColor White
Write-Host "   2. Check browser console for any remaining CORS errors" -ForegroundColor White
Write-Host "   3. If issues persist, run the diagnostic script:" -ForegroundColor White
Write-Host "      python diagnose_image_issues.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 If you need public read access for direct URLs:" -ForegroundColor Yellow
Write-Host "   Add this bucket policy to allow public read for screenshots:" -ForegroundColor White
Write-Host '   {
     "Version": "2012-10-17",
     "Statement": [
         {
             "Sid": "PublicReadGetObject",
             "Effect": "Allow",
             "Principal": "*",
             "Action": "s3:GetObject",
             "Resource": "arn:aws:s3:::ddsfocustime/screenshots/*"
         }
     ]
   }' -ForegroundColor Cyan

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
