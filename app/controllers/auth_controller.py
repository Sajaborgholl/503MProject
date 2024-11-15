from flask import Blueprint, request, jsonify, session, redirect, url_for, make_response
from app.services.user_service import authenticate_user, register_user, logout_user
from db import get_db_connection
from werkzeug.security import check_password_hash, generate_password_hash
# Define the blueprint for authentication routes
from flask_jwt_extended import create_access_token,  get_jwt_identity, jwt_required, set_access_cookies, get_csrf_token, unset_jwt_cookies
from db import get_db_connection
from functools import wraps
from app.auth.decorators import super_admin_required
from datetime import timedelta
import re

auth_bp = Blueprint('auth', __name__)
EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Database connection and user authentication logic
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Administrator WHERE Email = ?", (email,))
    user = cursor.fetchone()

    if user and check_password_hash(user["Password"], password):
        access_token = create_access_token(
            identity={"user_id": user["UserID"], "role": user["Role"], "is_super_admin": user["is_super_admin"]}
        )
        response = make_response(jsonify({"message": "Login successful"}))

        # Set both access token and CSRF token in cookies
        set_access_cookies(response, access_token)
        response.set_cookie('csrf_access_token', get_csrf_token(access_token))
        
        return response
    else:
        return jsonify({"error": "Invalid credentials"}), 401



@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)  # Clear the JWT cookies from the response
    return response, 200