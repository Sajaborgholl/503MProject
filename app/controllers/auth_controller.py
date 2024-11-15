from flask import Blueprint, request, jsonify, session, redirect, url_for
from app.services.user_service import authenticate_user, register_user, logout_user
from db import get_db_connection
from werkzeug.security import check_password_hash, generate_password_hash
# Define the blueprint for authentication routes
from flask_jwt_extended import create_access_token,  get_jwt_identity, jwt_required
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
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email format"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Administrator WHERE Email = ?", (email,))
    user = cursor.fetchone()

    if user and check_password_hash(user["Password"], password):
        # Create a JWT access token with an expiration
        access_token = create_access_token(
            identity={"user_id": user["UserID"], "role": user["Role"], "is_super_admin": user["is_super_admin"]},
            expires_delta=timedelta(hours=1)  # Optional: Set specific expiration for the token
        )
        return jsonify(access_token=access_token), 200
    else:   
        return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Please delete your token client-side to complete logout."}), 200
