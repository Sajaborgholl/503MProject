import sqlite3
import os

# Function to create a database connection


def get_db_connection():
    db_path = 'yourdatabase.db'
    print("Connecting to database at:", os.path.abspath(db_path))  # Print the full path
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Enables name-based access to columns
    return conn

# Initial database setup, if not done already


def setup_database():
    with open('db.sql', 'r') as file:
        sql_script = file.read()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Split the SQL script into individual statements
        sql_statements = sql_script.split(';')
        
        for idx, statement in enumerate(sql_statements):
            statement = statement.strip()  # Remove leading/trailing whitespace
            if statement:  # Skip empty statements
                try:
                    cursor.execute(statement)
                except sqlite3.Error as error:
                    print(f"Error in statement #{idx + 1}: {statement}")
                    print(f"SQLite error: {error}")
                    break  # Exit on the first error

        print("Database setup completed successfully.")
    except sqlite3.Error as error:
        print("Error executing script:", error)
    finally:
        conn.commit()
        conn.close()
