from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from db import get_db_connection

# Decorator for routes that only super admins can access
def super_admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        identity = get_jwt_identity()
        
        if not identity:
            return jsonify({"error": "Authentication required"}), 401

        # Check if the user is a super admin
        if identity.get("is_super_admin") != 1:
            return jsonify({"error": "Super Admin access required"}), 403

        return fn(*args, **kwargs)
    return wrapper

# Decorator for routes that require specific roles
def role_required(required_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()
            
            if not identity:
                return jsonify({"error": "Authentication required"}), 401

            # Allow super admins to bypass role checks
            if identity.get("is_super_admin") == 1:
                return fn(*args, **kwargs)  # Full access for super admins

            # Fetch the admin's assigned roles from the database if not a super admin
            admin_id = identity.get("user_id")
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT RoleName FROM Role
                JOIN Admin_Role ON Role.RoleID = Admin_Role.RoleID
                WHERE Admin_Role.AdminID = ?
            """, (admin_id,))
            roles = [row["RoleName"] for row in cursor.fetchall()]
            conn.close()

            # Check if the admin has any of the required roles
            if any(role in roles for role in required_roles):
                return fn(*args, **kwargs)

            # Deny access if no required roles are found
            return jsonify({"error": "Access denied"}), 403
        return wrapper
    return decorator
