from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from db import get_db_connection
from app.auth.decorators import super_admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/add-admin', methods=['POST'])
@super_admin_required
def add_admin():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the email is already in use
    cursor.execute("SELECT * FROM Administrator WHERE Email = ?", (email,))
    if cursor.fetchone():
        return jsonify({"error": "Admin with this email already exists"}), 409

    # Insert new admin with hashed password
    hashed_password = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO Administrator (Name, Email, Password, Role) VALUES (?, ?, ?, ?)",
        (name, email, hashed_password, 'Admin')
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Admin added successfully"}), 201
