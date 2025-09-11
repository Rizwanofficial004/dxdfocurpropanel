import sqlite3
import os

# Connect to the database
db_path = 'db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("⏰ TIMER DATA FOR USERS")
    print("=" * 60)
    
    # Get users with timer data
    cursor.execute("""
        SELECT 
            u.id, 
            u.username, 
            u.first_name, 
            u.last_name, 
            u.email,
            COUNT(t.id) as timer_count
        FROM auth_user u
        JOIN dashboard_usertimer t ON u.id = t.user_id
        GROUP BY u.id, u.username, u.first_name, u.last_name, u.email
        ORDER BY timer_count DESC
    """)
    
    users_with_timers = cursor.fetchall()
    
    print(f"📊 Users with timer records: {len(users_with_timers)}")
    print()
    
    for user in users_with_timers:
        user_id, username, first_name, last_name, email, timer_count = user
        
        print(f"🔹 USER ID: {user_id}")
        print(f"   👤 Username: {username}")
        print(f"   📧 Email: {email}")
        print(f"   🏷️ Full Name: {first_name} {last_name}".strip())
        print(f"   ⏰ Total Timer Records: {timer_count}")
        
        # Get timer details for this user
        cursor.execute("""
            SELECT 
                id,
                duration_seconds, 
                start_time, 
                end_time, 
                timer_name, 
                notes
            FROM dashboard_usertimer 
            WHERE user_id = ? 
            ORDER BY start_time DESC
            LIMIT 10
        """, (user_id,))
        
        timers = cursor.fetchall()
        
        print(f"   📝 Recent Timer Records:")
        for timer in timers:
            timer_id, duration_seconds, start_time, end_time, timer_name, notes = timer
            duration_minutes = duration_seconds / 60
            
            print(f"      • Timer ID: {timer_id}")
            print(f"        ⏱️ Duration: {duration_seconds}s ({duration_minutes:.1f} minutes)")
            print(f"        🕐 Start: {start_time}")
            print(f"        🕑 End: {end_time}")
            print(f"        🏷️ Name: {timer_name}")
            if notes:
                print(f"        📝 Notes: {notes}")
            print()
        
        print("-" * 40)
        print()
    
    print("=" * 60)
    print("📊 TIMER STATISTICS:")
    
    # Total timer records
    cursor.execute("SELECT COUNT(*) FROM dashboard_usertimer")
    total_timers = cursor.fetchone()[0]
    print(f"   • Total Timer Records: {total_timers}")
    
    # Total duration
    cursor.execute("SELECT SUM(duration_seconds) FROM dashboard_usertimer")
    total_seconds = cursor.fetchone()[0] or 0
    total_minutes = total_seconds / 60
    total_hours = total_minutes / 60
    print(f"   • Total Time Tracked: {total_seconds}s ({total_minutes:.1f} minutes, {total_hours:.2f} hours)")
    
    # Average duration
    if total_timers > 0:
        avg_seconds = total_seconds / total_timers
        avg_minutes = avg_seconds / 60
        print(f"   • Average Timer Duration: {avg_seconds:.1f}s ({avg_minutes:.1f} minutes)")
    
    # Most recent timer
    cursor.execute("""
        SELECT u.username, t.start_time, t.duration_seconds 
        FROM dashboard_usertimer t
        JOIN auth_user u ON t.user_id = u.id
        ORDER BY t.start_time DESC 
        LIMIT 1
    """)
    recent_timer = cursor.fetchone()
    if recent_timer:
        username, start_time, duration = recent_timer
        print(f"   • Most Recent Timer: {username} - {start_time} ({duration}s)")
    
    conn.close()
else:
    print("❌ Database file 'db.sqlite3' not found!")
