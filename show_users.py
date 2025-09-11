import sqlite3
import os
from datetime import datetime

# Connect to the database
db_path = 'db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("👥 REGISTERED USERS IN DATABASE")
    print("=" * 60)
    
    # Get all users with detailed information
    cursor.execute("""
        SELECT 
            id, 
            username, 
            first_name, 
            last_name, 
            email, 
            is_staff, 
            is_active, 
            date_joined, 
            last_login
        FROM auth_user 
        ORDER BY id
    """)
    
    users = cursor.fetchall()
    
    print(f"📊 Total registered users: {len(users)}")
    print()
    
    for user in users:
        user_id, username, first_name, last_name, email, is_staff, is_active, date_joined, last_login = user
        
        print(f"🔹 USER ID: {user_id}")
        print(f"   👤 Username: {username}")
        print(f"   📧 Email: {email}")
        print(f"   🏷️ Full Name: {first_name} {last_name}".strip())
        print(f"   👔 Staff: {'Yes' if is_staff else 'No'}")
        print(f"   ✅ Active: {'Yes' if is_active else 'No'}")
        print(f"   📅 Joined: {date_joined}")
        print(f"   🕐 Last Login: {last_login if last_login else 'Never'}")
        
        # Check if user has timer data
        cursor.execute("SELECT COUNT(*) FROM dashboard_usertimer WHERE user_id = ?", (user_id,))
        timer_count = cursor.fetchone()[0]
        print(f"   ⏰ Timer Records: {timer_count}")
        
        # Check if user has API token
        cursor.execute("SELECT key FROM authtoken_token WHERE user_id = ?", (user_id,))
        token = cursor.fetchone()
        print(f"   🔐 API Token: {'Yes' if token else 'No'}")
        
        print()
    
    print("=" * 60)
    print("📈 USER SUMMARY:")
    print(f"   • Total Users: {len(users)}")
    
    # Count active users
    cursor.execute("SELECT COUNT(*) FROM auth_user WHERE is_active = 1")
    active_count = cursor.fetchone()[0]
    print(f"   • Active Users: {active_count}")
    
    # Count staff users
    cursor.execute("SELECT COUNT(*) FROM auth_user WHERE is_staff = 1")
    staff_count = cursor.fetchone()[0]
    print(f"   • Staff Users: {staff_count}")
    
    # Count users with timer data
    cursor.execute("SELECT COUNT(DISTINCT user_id) FROM dashboard_usertimer")
    timer_users = cursor.fetchone()[0]
    print(f"   • Users with Timer Data: {timer_users}")
    
    # Count users with API tokens
    cursor.execute("SELECT COUNT(*) FROM authtoken_token")
    token_users = cursor.fetchone()[0]
    print(f"   • Users with API Tokens: {token_users}")
    
    conn.close()
else:
    print("❌ Database file 'db.sqlite3' not found!")
