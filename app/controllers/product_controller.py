# app/controllers/product_controller.py
from flask import Blueprint, request, jsonify
from db import get_db_connection
from app.auth.decorators import admin_required

product_bp = Blueprint('product', __name__)

@product_bp.route('/add', methods=['POST'])
@admin_required  # Ensure only admins can add products
def add_product():
    data = request.get_json()
    
    # Extract product details from the JSON payload
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    size = data.get('size')
    color = data.get('color')
    material = data.get('material')
    stock_quantity = data.get('stock_quantity')
    category_id = data.get('category_id')
    subcategory_id = data.get('subcategory_id')
    featured = data.get('featured', 0)  # Defaults to 0 if not provided
    
    # Validate required fields
    if not name or price is None or stock_quantity is None:
        return jsonify({"error": "Name, price, and stock quantity are required fields."}), 400

    # Connect to the database and insert the new product
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Product (Name, Description, Price, Size, Color, Material, StockQuantity, CategoryID, SubCategoryID, Featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, description, price, size, color, material, stock_quantity, category_id, subcategory_id, featured))
        conn.commit()
        return jsonify({"message": "Product added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()



@product_bp.route('/<int:product_id>/update', methods=['PUT'])
@admin_required  # Ensures only admins can update products
def update_product(product_id):
    data = request.get_json()

    # Extract fields that need updating
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    size = data.get('size')
    color = data.get('color')
    material = data.get('material')
    stock_quantity = data.get('stock_quantity')
    featured = data.get('featured')

    # Connect to the database and perform the update
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE Product
            SET Name = COALESCE(?, Name),
                Description = COALESCE(?, Description),
                Price = COALESCE(?, Price),
                Size = COALESCE(?, Size),
                Color = COALESCE(?, Color),
                Material = COALESCE(?, Material),
                StockQuantity = COALESCE(?, StockQuantity),
                Featured = COALESCE(?, Featured)
            WHERE ProductID = ?
        """, (name, description, price, size, color, material, stock_quantity, featured, product_id))

        conn.commit()
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()