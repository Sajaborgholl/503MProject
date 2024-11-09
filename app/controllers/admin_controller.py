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


@admin_bp.route('/<int:admin_id>/delete', methods=['DELETE'])
@super_admin_required  # Restrict to super admin only
def delete_admin(admin_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Ensure the admin exists
        cursor.execute("SELECT * FROM Administrator WHERE UserID = ?", (admin_id,))
        admin = cursor.fetchone()
        if not admin:
            return jsonify({"error": "Admin not found"}), 404

        # Delete the admin
        cursor.execute("DELETE FROM Administrator WHERE UserID = ?", (admin_id,))
        conn.commit()
        return jsonify({"message": "Admin deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/<int:admin_id>/update', methods=['PUT'])
@super_admin_required  # Only super admins can update admin details
def update_admin(admin_id):
    data = request.get_json()
    email = data.get("email")
    role = data.get("role")  # Optional field to update admin role

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Ensure the admin exists
        cursor.execute("SELECT * FROM Administrator WHERE UserID = ?", (admin_id,))
        admin = cursor.fetchone()
        if not admin:
            return jsonify({"error": "Admin not found"}), 404

        # Update admin details
        cursor.execute(
            "UPDATE Administrator SET Email = ?, Role = ? WHERE UserID = ?",
            (email or admin["Email"], role or admin["Role"], admin_id)
        )
        conn.commit()
        return jsonify({"message": "Admin updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@admin_bp.route('/all', methods=['GET'])
@super_admin_required  # Only super admins can access this list
def list_admins():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Fetch all admins
        cursor.execute("SELECT UserID, Name, Email, Role, is_super_admin FROM Administrator")
        admins = cursor.fetchall()

        # Format the data as a list of dictionaries
        admin_list = [
            {
                "user_id": admin["UserID"],
                "name": admin["Name"],
                "email": admin["Email"],
                "role": admin["Role"],
                "is_super_admin": bool(admin["is_super_admin"])
            }
            for admin in admins
        ]

        return jsonify({"admins": admin_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()