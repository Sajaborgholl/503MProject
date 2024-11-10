# app/controllers/product_controller.py
from flask import Blueprint, request, jsonify, current_app
from db import get_db_connection
from app.auth.decorators import admin_required
from app.utils.file_upload import save_image_path_to_database, save_image_to_server
from werkzeug.utils import secure_filename
import os
import sqlite3
import time

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



@product_bp.route('/<int:product_id>/delete', methods=['DELETE'])
@admin_required  # Ensures only admins can delete products
def delete_product(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Execute the delete command
        cursor.execute("DELETE FROM Product WHERE ProductID = ?", (product_id,))
        conn.commit()

        # Check if the deletion affected any rows (i.e., if the product existed)
        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()



@product_bp.route('/all', methods=['GET'])
@admin_required  # Restrict access to admins
def list_products():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Fetch all products
        cursor.execute("""
            SELECT ProductID, Name, Description, Price, Size, Color, Material, StockQuantity, CategoryID, SubCategoryID, Featured
            FROM Product
        """)
        products = cursor.fetchall()

        # Format the data as a list of dictionaries
        product_list = [
            {
                "product_id": product["ProductID"],
                "name": product["Name"],
                "description": product["Description"],
                "price": product["Price"],
                "size": product["Size"],
                "color": product["Color"],
                "material": product["Material"],
                "stock_quantity": product["StockQuantity"],
                "category_id": product["CategoryID"],
                "sub_category_id": product["SubCategoryID"],
                "featured": bool(product["Featured"]),
            }
            for product in products
        ]

        return jsonify({"products": product_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@product_bp.route('/<int:product_id>/upload-image', methods=['POST'])
@admin_required
def upload_product_image(product_id):
    if 'image' not in request.files:
        return jsonify({"error": "No image file found in request"}), 400

    file = request.files['image']
    
    # Step 1: Save the file to the server and get the file path
    file_path = save_image_to_server(file, product_id)  # Pass product_id to save in a specific folder
    
    if file_path:
        # Step 2: Save the file path in the database
        try:
            save_image_path_to_database(product_id, file_path)
            return jsonify({"message": "Image uploaded and path saved successfully", "image_url": file_path}), 201
        except Exception as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500
    else:
        return jsonify({"error": "Invalid file type"}), 400