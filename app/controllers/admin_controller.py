from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from db import get_db_connection
from flask_jwt_extended import jwt_required
from app.auth.decorators import super_admin_required

admin_bp = Blueprint('admin', __name__)

import re
from werkzeug.security import generate_password_hash
from flask import Blueprint, request, jsonify
from app.auth.decorators import super_admin_required
from db import get_db_connection

admin_bp = Blueprint('admin', __name__)

# Define password pattern for validation
PASSWORD_PATTERN = r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'

@admin_bp.route('/add-admin', methods=['POST'])
@super_admin_required
def add_admin():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role_ids = data.get("role_ids", [])  # List of role IDs to assign to the admin

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    # Validate password
    if not re.match(PASSWORD_PATTERN, password):
        return jsonify({
            "error": "Password must be at least 8 characters long, include one uppercase letter, "
                     "one lowercase letter, one digit, and one special character (@$!%*?&)."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if the email is already in use
        cursor.execute("SELECT * FROM Administrator WHERE Email = ?", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Admin with this email already exists"}), 409

        # Insert new admin with hashed password
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO Administrator (Name, Email, Password, Role, is_super_admin) VALUES (?, ?, ?, ?, ?)",
            (name, email, hashed_password, 'Admin', 0)
        )
        
        # Get the new admin's ID
        admin_id = cursor.lastrowid

        # Assign roles in the Admin_Role table
        for role_id in role_ids:
            cursor.execute(
                "INSERT INTO Admin_Role (AdminID, RoleID) VALUES (?, ?)",
                (admin_id, role_id)
            )

        conn.commit()
        return jsonify({"message": "Admin added and roles assigned successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


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




@admin_bp.route('/<int:admin_id>/roles', methods=['GET'])
@jwt_required()  # Use jwt_required to enforce authentication
def get_admin_roles(admin_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Fetch admin and check if they are a super admin
        cursor.execute("SELECT is_super_admin FROM Administrator WHERE UserID = ?", (admin_id,))
        admin = cursor.fetchone()
        if not admin:
            return jsonify({"error": "Admin not found"}), 404

        if admin["is_super_admin"] == 1:
            # If super admin, return all roles
            cursor.execute("SELECT RoleName FROM Role")
            roles = [role["RoleName"] for role in cursor.fetchall()]
            return jsonify({"admin_id": admin_id, "roles": roles, "is_super_admin": True}), 200
        else:
            # Fetch assigned roles for a regular admin
            cursor.execute("""
                SELECT r.RoleName 
                FROM Role r
                JOIN Admin_Role ar ON r.RoleID = ar.RoleID
                WHERE ar.AdminID = ?
            """, (admin_id,))
            roles = [role["RoleName"] for role in cursor.fetchall()]
            return jsonify({"admin_id": admin_id, "roles": roles, "is_super_admin": False}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()