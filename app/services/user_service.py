from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection

# Function to register a new user


def register_user(username, password, role):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the username already exists
        existing_user = cursor.execute(
            "SELECT * FROM User WHERE Username = ?", (username,)).fetchone()
        if existing_user:
            return {"success": False, "error": "Username already exists"}

        # Hash the password before storing it
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO User (Username, Password, UserType) VALUES (?, ?, ?)",
            (username, hashed_password, role)
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

# Function to authenticate a user during login


def authenticate_user(username, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Look up the user by username
    user = cursor.execute(
        "SELECT * FROM User WHERE Username = ?", (username,)).fetchone()
    conn.close()

    # Check if the user exists and verify the password
    if user and check_password_hash(user['Password'], password):
        return {
            "UserID": user['UserID'],
            "Username": user['Username'],
            "UserType": user['UserType']
        }
    else:
        return None

# Function to log the user out


def logout_user():
    session.pop('user_id', None)
    session.pop('user_role', None)
