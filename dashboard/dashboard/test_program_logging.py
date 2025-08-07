#!/usr/bin/env python3
"""
Test script to demonstrate the new program summary logging system.
This shows how the logging works for program summaries and analytics operations.
"""

from .program_summary_logger import (
    log_program_summary_operation,
    log_user_search,
    log_program_analysis,
    log_openai_operation,
    log_s3_operation,
    log_api_request,
    log_cache_operation,
    log_detailed_program_summary,
    log_program_summary_json
)

def test_program_summary_logging():
    """Test all the logging functions for program summaries"""
    
    print("🧪 Testing Program Summary Logging System...")
    print("=" * 50)
    
    # Test basic program summary operations
    log_program_summary_operation("Starting program analysis", "test@example.com")
    log_program_summary_operation("Processing user data", "user@company.com", "Extracting categories and programs")
    log_program_summary_operation("Database connection failed", status="ERROR")
    
    # Test user search operations
    log_user_search("john.doe", 1, "john.doe@company.com")
    log_user_search("jane", 0)
    
    # Test program analysis
    log_program_analysis("developer@company.com", 5, 12, "logs/developer_at_company.com/summary.json")
    
    # Test OpenAI operations
    log_openai_operation("Extract categories", "user@example.com", success=True)
    log_openai_operation("Generate summary", "user@example.com", success=False, error="API rate limit exceeded")
    
    # Test S3 operations
    log_s3_operation("Read program summary", "my-bucket", "logs/user/summary.json", success=True)
    log_s3_operation("Write cache", "my-bucket", "cache/program_data.json", success=False, error="Permission denied")
    
    # Test API requests
    log_api_request("/api/program-summary", "GET", "user@example.com", 2048, 200)
    log_api_request("/api/user-search", "POST", "admin@company.com", 512, 404)
    
    # Test cache operations
    log_cache_operation("Write", "program_cache.json", success=True, details="Updated 15 records")
    log_cache_operation("Read", "user_cache.json", success=False, details="File not found")
    
    print("\n✅ All basic logging tests completed!")
    print("=" * 50)

def test_detailed_program_summary():
    """Test the new detailed program summary logging with real data"""
    
    print("\n🧪 Testing Detailed Program Summary Logging...")
    print("=" * 50)
    
    # Sample data from the user's request
    sample_categories = {
        "Unknown": "742.0 mins",
        "Browsers": "80.0 mins",
        "Development": "40.0 mins",
        "Productivity": "40.0 mins",
        "Communication": "40.0 mins"
    }
    
    sample_programs = {
        "Registry": "40.0 mins",
        "powershell.exe": "40.0 mins",
        "py.exe": "40.0 mins",
        "VSCode": "40.0 mins",
        "NVDisplay.Container.exe": "40.0 mins",
        "Chrome": "40.0 mins",
        "nvcontainer.exe": "40.0 mins",
        "redis-server.exe": "40.0 mins",
        "TeamViewer_Service.exe": "40.0 mins",
        "crashpad_handler.exe": "40.0 mins",
        "python.exe": "40.0 mins",
        "File Explorer": "40.0 mins",
        "msedgewebview2.exe": "40.0 mins",
        "WhatsApp": "40.0 mins",
        "AggregatorHost.exe": "40.0 mins",
        "Edge": "40.0 mins",
        "SearchApp.exe": "40.0 mins",
        "rustdesk.exe": "40.0 mins",
        "TextInputHost.exe": "40.0 mins",
        "image_watcher.exe": "40.0 mins",
        "CalculatorApp.exe": "40.0 mins",
        "SnippingTool.exe": "34.0 mins",
        "TrustedInstaller.exe": "21.0 mins",
        "TiWorker.exe": "21.0 mins",
        "audiodg.exe": "13.0 mins",
        "backgroundTaskHost.exe": "6.0 mins",
        "LocationNotificationWindows.exe": "3.0 mins",
        "MoUsoCoreWorker.exe": "1.0 mins",
        "MpCmdRun.exe": "1.0 mins",
        "WindowsPackageManagerServer.exe": "1.0 mins",
        "HxTsr.exe": "1.0 mins"
    }
    
    # Test detailed program summary logging
    log_detailed_program_summary(
        user_email="haseebcodejourney@gmail.com",
        categories_data=sample_categories,
        programs_data=sample_programs,
        source_file="logs/haseebcodejourney_at_gmail.com/program_summary.json"
    )
    
    # Test JSON format logging
    sample_json_data = {
        "categories": sample_categories,
        "programs": sample_programs
    }
    
    log_program_summary_json(
        user_email="haseebcodejourney@gmail.com",
        json_data=sample_json_data,
        source_file="logs/haseebcodejourney_at_gmail.com/program_summary.json"
    )
    
    print("\n✅ Detailed program summary logging tests completed!")
    print("=" * 50)

if __name__ == "__main__":
    test_program_summary_logging()
    test_detailed_program_summary() 