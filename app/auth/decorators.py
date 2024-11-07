from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def super_admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if not claims.get("is_super_admin"):
            return jsonify({"error": "Super Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper
