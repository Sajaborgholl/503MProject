from flask import Blueprint, request, jsonify

# Define the product blueprint
product_bp = Blueprint('product', __name__)

# Example route for adding a product


@product_bp.route('/add', methods=['POST'])
def add_product():
    # Your logic for adding a product goes here
    data = request.get_json()
    # Simulate adding the product (replace this with actual logic)
    return jsonify({"message": "Product added", "product": data}), 201
