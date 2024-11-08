from flask import Blueprint, request, jsonify, session, redirect, url_for
from app.services.user_service import authenticate_user, register_user, logout_user
from db import get_db_connection
from werkzeug.security import check_password_hash, generate_password_hash
# Define the blueprint for authentication routes
from flask_jwt_extended import create_access_token,  get_jwt_identity, jwt_required
from db import get_db_connection
from functools import wraps
import os

auth_bp = Blueprint('auth', __name__)

# Route for user registration


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')  # Could be 'Customer' or 'Admin'

    # Call the register_user function in the user service
    result = register_user(username, password, role)
    if result['success']:
        return jsonify({"message": "Registration successful"}), 201
    else:
        return jsonify({"error": result['error']}), 400

# Route for user login

# Decorator to restrict route to super admin
def super_admin_required(f):
    @wraps(f)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        if not current_user.get('is_super_admin'):
            return jsonify({"error": "Access denied"}), 403
        return f(*args, **kwargs)
    return wrapper


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Administrator WHERE Email = ?", (email,))
    user = cursor.fetchone()

    if user and check_password_hash(user["Password"], password):
        access_token = create_access_token(
            identity={"user_id": user["UserID"], "role": user["Role"], "is_super_admin": user["is_super_admin"]}
        )
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
    

@auth_bp.route('/add-admin', methods=['POST'])
@super_admin_required
def add_admin():
    # Step 1: Get data from request
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = "Admin"  # Fixed role for admins

    # Step 2: Validate data
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    # Optional: Check if the email is valid
    if not "@" in email:
        return jsonify({"error": "Invalid email format"}), 400

    # Optional: Enforce a strong password policy
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400

    # Step 3: Hash the password
    hashed_password = generate_password_hash(password)

    try:
        # Step 4: Insert the new admin into the database
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO Administrator (Name, Email, Password, Role, is_super_admin) VALUES (?, ?, ?, ?, ?)",
            (name, email, hashed_password, role, 0)  # is_super_admin is 0 for new admins
        )
        conn.commit()
        conn.close()
        
        # Step 5: Return success response
        return jsonify({"message": "Admin added successfully"}), 201

    except Exception as e:
        # Optional: Log the error for server-side debugging
        print(f"Error adding admin: {e}")
        return jsonify({"error": "Failed to add admin"}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Call the logout_user function to clear the session
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200
