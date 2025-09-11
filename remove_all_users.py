import sqlite3
import os

# Connect to the database
db_path = 'db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🗑️ REMOVING ALL USERS FROM DATABASE")
    print("=" * 50)
    
    # First, show current user count
    cursor.execute("SELECT COUNT(*) FROM auth_user")
    user_count = cursor.fetchone()[0]
    print(f"📊 Current users in database: {user_count}")
    
    if user_count == 0:
        print("✅ No users to remove - database is already empty!")
        conn.close()
        exit()
    
    print(f"\n🗑️ Removing all {user_count} users and their associated data...")
    
    try:
        # Remove all timer data
        cursor.execute("DELETE FROM dashboard_usertimer")
        timer_deleted = cursor.rowcount
        print(f"   ✅ Removed {timer_deleted} timer records")
        
        # Remove all API tokens
        cursor.execute("DELETE FROM authtoken_token")
        token_deleted = cursor.rowcount
        print(f"   ✅ Removed {token_deleted} API tokens")
        
        # Remove all user numeric values
        cursor.execute("DELETE FROM dashboard_usernumericvalue")
        numeric_deleted = cursor.rowcount
        print(f"   ✅ Removed {numeric_deleted} numeric value records")
        
        # Remove all user styling data
        cursor.execute("DELETE FROM dashboard_userstyling")
        styling_deleted = cursor.rowcount
        print(f"   ✅ Removed {styling_deleted} styling records")
        
        # Remove all user group memberships
        cursor.execute("DELETE FROM auth_user_groups")
        groups_deleted = cursor.rowcount
        print(f"   ✅ Removed {groups_deleted} group memberships")
        
        # Remove all user permissions
        cursor.execute("DELETE FROM auth_user_user_permissions")
        perms_deleted = cursor.rowcount
        print(f"   ✅ Removed {perms_deleted} user permissions")
        
        # Remove all admin log entries (optional)
        cursor.execute("DELETE FROM django_admin_log")
        admin_deleted = cursor.rowcount
        print(f"   ✅ Removed {admin_deleted} admin log entries")
        
        # Remove all Django sessions
        cursor.execute("DELETE FROM django_session")
        session_deleted = cursor.rowcount
        print(f"   ✅ Removed {session_deleted} user sessions")
        
        # Finally, remove all users
        cursor.execute("DELETE FROM auth_user")
        users_deleted = cursor.rowcount
        print(f"   ✅ Removed {users_deleted} users")
        
        # Commit all changes
        conn.commit()
        
        print(f"\n🎉 SUCCESS! All {users_deleted} users and their data have been removed!")
        
        # Verify the database is clean
        cursor.execute("SELECT COUNT(*) FROM auth_user")
        remaining_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM dashboard_usertimer")
        remaining_timers = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM authtoken_token")
        remaining_tokens = cursor.fetchone()[0]
        
        print(f"\n📊 Database Status After Cleanup:")
        print(f"   • Users: {remaining_users}")
        print(f"   • Timer Records: {remaining_timers}")
        print(f"   • API Tokens: {remaining_tokens}")
        
        if remaining_users == 0 and remaining_timers == 0 and remaining_tokens == 0:
            print("   ✅ Database is completely clean!")
        else:
            print("   ⚠️ Some data may remain")
            
    except Exception as e:
        print(f"❌ Error during user removal: {e}")
        conn.rollback()
    
    conn.close()
else:
    print("❌ Database file 'db.sqlite3' not found!")
