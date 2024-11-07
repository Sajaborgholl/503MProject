from flask import Blueprint, request, jsonify, session, redirect, url_for
from app.services.user_service import authenticate_user, register_user, logout_user
from db import get_db_connection
from werkzeug.security import check_password_hash
# Define the blueprint for authentication routes
from flask_jwt_extended import create_access_token


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



@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    print(email)
    print(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    print ("ok")

    cursor.execute("SELECT * FROM Administrator WHERE Email = ?", (email,))
    user = cursor.fetchone()

    if user:
        print("User found:", user)
        print("Password from request:", password)
        print("Stored hashed password:", user["Password"])
        is_correct_password = check_password_hash(user["Password"], password)
        print("Does the password match?", is_correct_password)

    if user and is_correct_password:
        access_token = create_access_token(
            identity={"user_id": user["UserID"], "role": user["Role"]}
        )
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401



@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Call the logout_user function to clear the session
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200
