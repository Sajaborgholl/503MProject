from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt, get_jwt_identity


def super_admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        identity = get_jwt_identity()
        
        if not identity:
            return jsonify({"error": "Authentication required"}), 401

        # Check if the current user is a super admin
        if identity.get("is_super_admin") != 1:
            return jsonify({"error": "Super Admin access required"}), 403

        return fn(*args, **kwargs)
    return wrapper



def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt_identity()
        if claims.get("role") != "Admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function