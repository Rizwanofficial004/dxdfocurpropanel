import logging
import os
import json
from datetime import datetime

# Create logs directory if it doesn't exist
log_dir = os.path.join(os.path.dirname(__file__), 'log')
os.makedirs(log_dir, exist_ok=True)

# Configure logging for program summaries and analytics
def setup_program_summary_logger():
    """
    Setup logger specifically for program summaries, user analytics, and non-screenshot operations
    """
    logger = logging.getLogger('program_summary_logger')
    logger.setLevel(logging.INFO)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler for program summary operations
    log_file = os.path.join(log_dir, 'program_summary.log')
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    
    # Console handler for immediate feedback
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Add handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Get the logger instance
program_logger = setup_program_summary_logger()

def log_program_summary_operation(operation, user_email=None, details=None, status="INFO"):
    """
    Log program summary related operations
    
    Args:
        operation (str): Description of the operation
        user_email (str, optional): User email being processed
        details (str, optional): Additional details
        status (str): Log level (INFO, WARNING, ERROR, DEBUG)
    """
    message = f"📊 {operation}"
    if user_email:
        message += f" | User: {user_email}"
    if details:
        message += f" | Details: {details}"
    
    if status == "ERROR":
        program_logger.error(message)
    elif status == "WARNING":
        program_logger.warning(message)
    elif status == "DEBUG":
        program_logger.debug(message)
    else:
        program_logger.info(message)

def log_user_search(query, result_count=0, matched_email=None):
    """
    Log user search operations
    """
    message = f"🔍 User Search | Query: '{query}' | Results: {result_count}"
    if matched_email:
        message += f" | Matched: {matched_email}"
    program_logger.info(message)

def log_program_analysis(user_email, categories_count=0, programs_count=0, source_file=None):
    """
    Log program analysis operations
    """
    message = f"📈 Program Analysis | User: {user_email} | Categories: {categories_count} | Programs: {programs_count}"
    if source_file:
        message += f" | Source: {source_file}"
    program_logger.info(message)

def log_openai_operation(operation, user_email=None, success=True, error=None, details=None):
    """
    Log OpenAI API operations
    """
    status = "✅ Success" if success else "❌ Failed"
    message = f"🤖 OpenAI {operation} | {status}"
    if user_email:
        message += f" | User: {user_email}"
    if error:
        message += f" | Error: {error}"
    if details:
        message += f" | Details: {details}"
    
    if success:
        program_logger.info(message)
    else:
        program_logger.error(message)

def log_s3_operation(operation, bucket=None, key=None, success=True, error=None):
    """
    Log S3 operations for program summaries
    """
    status = "✅ Success" if success else "❌ Failed"
    message = f"☁️ S3 {operation} | {status}"
    if bucket:
        message += f" | Bucket: {bucket}"
    if key:
        message += f" | Key: {key}"
    if error:
        message += f" | Error: {error}"
    
    if success:
        program_logger.info(message)
    else:
        program_logger.error(message)

def log_api_request(endpoint, method="GET", user_email=None, response_size=0, status_code=200):
    """
    Log API requests for program summary endpoints
    """
    status_emoji = "✅" if status_code < 400 else "❌"
    message = f"{status_emoji} API {method} {endpoint} | Status: {status_code} | Size: {response_size} bytes"
    if user_email:
        message += f" | User: {user_email}"
    
    if status_code < 400:
        program_logger.info(message)
    else:
        program_logger.warning(message)

def log_cache_operation(operation, cache_file=None, success=True, details=None):
    """
    Log cache operations for program summaries
    """
    status = "✅ Success" if success else "❌ Failed"
    message = f"💾 Cache {operation} | {status}"
    if cache_file:
        message += f" | File: {cache_file}"
    if details:
        message += f" | Details: {details}"
    
    if success:
        program_logger.info(message)
    else:
        program_logger.warning(message)

def log_detailed_program_summary(user_email, categories_data, programs_data, source_file=None, total_time=None):
    """
    Log detailed program summary data in the specific JSON format
    
    Args:
        user_email (str): User email
        categories_data (dict): Categories with time data
        programs_data (dict): Programs with time data
        source_file (str, optional): Source file path
        total_time (str, optional): Total time calculated
    """
    # Calculate total time if not provided
    if not total_time:
        total_categories = sum(float(time_str.replace(' mins', '')) for time_str in categories_data.values())
        total_time = f"{total_categories:.1f} mins"
    
    # Count items
    categories_count = len(categories_data)
    programs_count = len(programs_data)
    
    # Create summary message
    message = f"📊 Detailed Program Summary | User: {user_email} | Total Time: {total_time}"
    message += f" | Categories: {categories_count} | Programs: {programs_count}"
    
    if source_file:
        message += f" | Source: {source_file}"
    
    program_logger.info(message)
    
    # Log categories breakdown
    if categories_data:
        categories_msg = f"📈 Categories Breakdown | User: {user_email}"
        for category, time in categories_data.items():
            categories_msg += f" | {category}: {time}"
        program_logger.info(categories_msg)
    
    # Log programs breakdown (limit to top 10 for readability)
    if programs_data:
        sorted_programs = sorted(programs_data.items(), key=lambda x: float(x[1].replace(' mins', '')), reverse=True)
        top_programs = sorted_programs[:10]
        
        programs_msg = f"💻 Top Programs | User: {user_email}"
        for program, time in top_programs:
            programs_msg += f" | {program}: {time}"
        
        if len(sorted_programs) > 10:
            programs_msg += f" | ... and {len(sorted_programs) - 10} more programs"
        
        program_logger.info(programs_msg)
    
    # Log the complete JSON data for debugging/audit purposes
    summary_data = {
        "user_email": user_email,
        "timestamp": datetime.now().isoformat(),
        "total_time": total_time,
        "categories_count": categories_count,
        "programs_count": programs_count,
        "categories": categories_data,
        "programs": programs_data
    }
    
    if source_file:
        summary_data["source_file"] = source_file
    
    # Log as JSON for easy parsing
    program_logger.debug(f"🔍 Complete Summary JSON | User: {user_email} | Data: {json.dumps(summary_data, indent=2)}")

def log_program_summary_json(user_email, json_data, source_file=None):
    """
    Log program summary data from JSON format
    
    Args:
        user_email (str): User email
        json_data (dict): JSON data containing categories and programs
        source_file (str, optional): Source file path
    """
    categories_data = json_data.get("categories", {})
    programs_data = json_data.get("programs", {})
    
    log_detailed_program_summary(user_email, categories_data, programs_data, source_file) 