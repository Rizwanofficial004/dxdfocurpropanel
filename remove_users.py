import sqlite3
import os

# Connect to the database
db_path = 'db.sqlite3'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🗑️ USER REMOVAL TOOL")
    print("=" * 60)
    
    # First, show all current users
    cursor.execute("""
        SELECT 
            id, 
            username, 
            first_name, 
            last_name, 
            email
        FROM auth_user 
        ORDER BY id
    """)
    
    users = cursor.fetchall()
    
    print(f"📊 Current users in database ({len(users)} total):")
    print()
    
    for user in users:
        user_id, username, first_name, last_name, email = user
        print(f"   {user_id}. {username} - {email} ({first_name} {last_name})".strip())
    
    print()
    print("=" * 60)
    
    # Ask which users to remove
    print("Select users to remove:")
    print("Options:")
    print("  1. Remove ALL users")
    print("  2. Remove specific users by ID")
    print("  3. Keep only specific users (remove others)")
    print("  4. Cancel operation")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    users_to_remove = []
    
    if choice == "1":
        # Remove all users
        confirm = input("⚠️  Are you sure you want to remove ALL users? This cannot be undone! (type 'YES' to confirm): ")
        if confirm == "YES":
            users_to_remove = [user[0] for user in users]
        else:
            print("❌ Operation cancelled.")
            exit()
    
    elif choice == "2":
        # Remove specific users
        print("\nEnter user IDs to remove (comma-separated, e.g., 1,3,5):")
        ids_input = input("User IDs: ").strip()
        try:
            user_ids = [int(id.strip()) for id in ids_input.split(",") if id.strip()]
            users_to_remove = [uid for uid in user_ids if uid in [user[0] for user in users]]
            invalid_ids = [uid for uid in user_ids if uid not in [user[0] for user in users]]
            if invalid_ids:
                print(f"⚠️  Invalid user IDs (not found): {invalid_ids}")
        except ValueError:
            print("❌ Invalid input. Please enter numbers separated by commas.")
            exit()
    
    elif choice == "3":
        # Keep only specific users
        print("\nEnter user IDs to KEEP (comma-separated, e.g., 1,2):")
        ids_input = input("User IDs to keep: ").strip()
        try:
            keep_ids = [int(id.strip()) for id in ids_input.split(",") if id.strip()]
            users_to_remove = [user[0] for user in users if user[0] not in keep_ids]
        except ValueError:
            print("❌ Invalid input. Please enter numbers separated by commas.")
            exit()
    
    elif choice == "4":
        print("❌ Operation cancelled.")
        exit()
    
    else:
        print("❌ Invalid choice.")
        exit()
    
    if not users_to_remove:
        print("❌ No users selected for removal.")
        exit()
    
    # Show users to be removed
    print(f"\n🗑️  Users to be removed ({len(users_to_remove)} total):")
    for user_id in users_to_remove:
        user_info = next((user for user in users if user[0] == user_id), None)
        if user_info:
            _, username, first_name, last_name, email = user_info
            print(f"   • ID {user_id}: {username} - {email}")
    
    # Final confirmation
    confirm = input(f"\n⚠️  Are you sure you want to remove these {len(users_to_remove)} users? This will also remove their timer data and tokens! (type 'YES' to confirm): ")
    
    if confirm == "YES":
        print("\n🗑️  Removing users and associated data...")
        
        for user_id in users_to_remove:
            try:
                # Remove user's timer data
                cursor.execute("DELETE FROM dashboard_usertimer WHERE user_id = ?", (user_id,))
                timer_deleted = cursor.rowcount
                
                # Remove user's API token
                cursor.execute("DELETE FROM authtoken_token WHERE user_id = ?", (user_id,))
                token_deleted = cursor.rowcount
                
                # Remove user's numeric values
                cursor.execute("DELETE FROM dashboard_usernumericvalue WHERE user_id = ?", (user_id,))
                numeric_deleted = cursor.rowcount
                
                # Remove user's styling data
                cursor.execute("DELETE FROM dashboard_userstyling WHERE user_id = ?", (user_id,))
                styling_deleted = cursor.rowcount
                
                # Remove user's group memberships
                cursor.execute("DELETE FROM auth_user_groups WHERE user_id = ?", (user_id,))
                groups_deleted = cursor.rowcount
                
                # Remove user's permissions
                cursor.execute("DELETE FROM auth_user_user_permissions WHERE user_id = ?", (user_id,))
                perms_deleted = cursor.rowcount
                
                # Finally, remove the user
                cursor.execute("DELETE FROM auth_user WHERE id = ?", (user_id,))
                user_deleted = cursor.rowcount
                
                if user_deleted:
                    print(f"   ✅ Removed user ID {user_id}")
                    print(f"      - Timer records: {timer_deleted}")
                    print(f"      - API tokens: {token_deleted}")
                    print(f"      - Numeric values: {numeric_deleted}")
                    print(f"      - Styling data: {styling_deleted}")
                    print(f"      - Group memberships: {groups_deleted}")
                    print(f"      - Permissions: {perms_deleted}")
                else:
                    print(f"   ❌ Failed to remove user ID {user_id}")
                    
            except Exception as e:
                print(f"   ❌ Error removing user ID {user_id}: {e}")
        
        # Commit all changes
        conn.commit()
        print(f"\n✅ Successfully removed {len(users_to_remove)} users and their associated data!")
        
        # Show remaining users
        cursor.execute("SELECT COUNT(*) FROM auth_user")
        remaining_count = cursor.fetchone()[0]
        print(f"📊 Remaining users in database: {remaining_count}")
        
        if remaining_count > 0:
            cursor.execute("SELECT id, username, email FROM auth_user ORDER BY id")
            remaining_users = cursor.fetchall()
            print("   Remaining users:")
            for user in remaining_users:
                print(f"      • ID {user[0]}: {user[1]} - {user[2]}")
    
    else:
        print("❌ Operation cancelled.")
    
    conn.close()
else:
    print("❌ Database file 'db.sqlite3' not found!")
