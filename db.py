import sqlite3

# Function to create a database connection


def get_db_connection():
    conn = sqlite3.connect('yourdatabase.db')
    conn.row_factory = sqlite3.Row  # Enables name-based access to columns
    return conn

# Initial database setup, if not done already


def setup_database():
    with open('db.sql', 'r') as file:
        sql_script = file.read()

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.executescript(sql_script)
        print("Database setup completed successfully.")
    except sqlite3.Error as error:
        print("Error executing script:", error)
    finally:
        conn.commit()
        conn.close()


if __name__ == "__main__":
    setup_database()
