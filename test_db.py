import pymysql

try:
    connection = pymysql.connect(
        host="147.93.122.202",  # or use IP: "92.113.22.65"
        user="u906714182_sqlrrefdvdv",
        password="3@6*t:lU",
        database="u906714182_sqlrrefdvdv",
        port=3306
    )
    print("✅ Connection successful!")
except Exception as e:
    print("❌ Connection failed:")
    print(e)
