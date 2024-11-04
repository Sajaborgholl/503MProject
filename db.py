import sqlite3

# Connect to SQLite database (creates the database if it doesn't exist)
conn = sqlite3.connect('yourdatabase.db')
cursor = conn.cursor()

# Read and execute SQL script
with open('db.sql', 'r') as file:
    sql_script = file.read()

try:
    cursor.executescript(sql_script)
    print("Database setup completed successfully.")
except sqlite3.Error as error:
    print("Error executing script:", error)
finally:
    # Commit changes and close the connection
    conn.commit()
    conn.close()
