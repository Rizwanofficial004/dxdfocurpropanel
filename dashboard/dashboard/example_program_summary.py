#!/usr/bin/env python3
"""
Example script showing how to use the new detailed program summary logging
with the specific JSON data format provided by the user.
"""

from .program_summary_logger import log_program_summary_json, log_detailed_program_summary

def example_with_user_data():
    """Example using the exact JSON data provided by the user"""
    
    # The JSON data provided by the user
    user_program_data = {
        "categories": {
            "Unknown": "742.0 mins",
            "Browsers": "80.0 mins",
            "Development": "40.0 mins",
            "Productivity": "40.0 mins",
            "Communication": "40.0 mins"
        },
        "programs": {
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
    }
    
    print("📊 Example: Logging User's Program Summary Data")
    print("=" * 60)
    
    # Method 1: Using log_program_summary_json (recommended for JSON data)
    print("Method 1: Using log_program_summary_json()")
    log_program_summary_json(
        user_email="haseebcodejourney@gmail.com",
        json_data=user_program_data,
        source_file="logs/haseebcodejourney_at_gmail.com/program_summary.json"
    )
    
    print("\n" + "=" * 60)
    
    # Method 2: Using log_detailed_program_summary (for separate categories/programs)
    print("Method 2: Using log_detailed_program_summary()")
    log_detailed_program_summary(
        user_email="haseebcodejourney@gmail.com",
        categories_data=user_program_data["categories"],
        programs_data=user_program_data["programs"],
        source_file="logs/haseebcodejourney_at_gmail.com/program_summary.json"
    )
    
    print("\n✅ Example completed! Check the log file for detailed entries.")
    print("📁 Log file: dashboard/log/program_summary.log")

def example_integration_with_api():
    """Example showing how this would be integrated with API responses"""
    
    print("\n🌐 Example: Integration with API Response")
    print("=" * 60)
    
    # Simulate API response data
    api_response = {
        "user_email": "haseebcodejourney@gmail.com",
        "categories": {
            "Unknown": "742.0 mins",
            "Browsers": "80.0 mins",
            "Development": "40.0 mins"
        },
        "programs": {
            "VSCode": "40.0 mins",
            "Chrome": "40.0 mins",
            "python.exe": "40.0 mins"
        },
        "status": True,
        "message": "Loaded from logs/haseebcodejourney_at_gmail.com/program_summary.json"
    }
    
    # Log the program summary data from API response
    log_program_summary_json(
        user_email=api_response["user_email"],
        json_data={
            "categories": api_response["categories"],
            "programs": api_response["programs"]
        },
        source_file=api_response["message"].replace("Loaded from ", "")
    )
    
    print("✅ API integration example completed!")

if __name__ == "__main__":
    example_with_user_data()
    example_integration_with_api() 