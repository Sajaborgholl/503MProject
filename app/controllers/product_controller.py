# app/controllers/product_controller.py
from flask import Blueprint, request, jsonify, current_app
from db import get_db_connection
import logging
from app.auth.decorators import role_required
from app.utils.file_upload import save_image_path_to_database, save_image_to_server, allowed_file
from werkzeug.utils import secure_filename
import csv
from flask import send_from_directory

from io import StringIO
from app.utils.validators import (
    is_valid_string, is_valid_price, is_valid_quantity, is_valid_id,
    sanitize_string, validate_warehouse_stock
)

product_bp = Blueprint('product', __name__)


@product_bp.route('/add', methods=['POST'])
@role_required(["Product Manager", "Super Admin"])
def add_product():
    data = request.get_json()
    print("Received Data:", data)  # Log all incoming data

    # Use validators for input sanitization and validation
    name = sanitize_string(data.get('name'))
    description = sanitize_string(data.get('description'))
    
    # Convert price and stock_quantity to appropriate types
    try:
        price = float(data.get('price'))
    except (TypeError, ValueError):
        return jsonify({"error": "Price must be a valid number."}), 400

    try:
        stock_quantity = int(data.get('stock_quantity'))
    except (TypeError, ValueError):
        return jsonify({"error": "Stock quantity must be a valid integer."}), 400

    size = sanitize_string(data.get('size'))
    color = sanitize_string(data.get('color'))
    material = sanitize_string(data.get('material'))
    category_id = data.get('category_id')
    subcategory_id = data.get('subcategory_id')
    featured = data.get('featured', 0)
    warehouse_stock = data.get('warehouse_stock', [])

    # Debug: Print the values and types of key fields after conversion
    print("Name:", name, type(name))
    print("Price:", price, type(price))
    print("Stock Quantity:", stock_quantity, type(stock_quantity))

    # Validate required fields
    if not (is_valid_string(name) and is_valid_price(price) and is_valid_quantity(stock_quantity)):
        print("Validation failed for name, price, or stock quantity.")  # Detailed debug output
        return jsonify({"error": "Invalid input for name, price, or stock quantity."}), 400

    # Continue with the rest of the endpoint logic...

    # Validate category and subcategory IDs if provided
    if category_id and not is_valid_id(category_id):
        logging.error("Invalid input for catgory id.")
        return jsonify({"error": "Invalid category ID."}), 400
    if subcategory_id and not is_valid_id(subcategory_id):
        logging.error("Invalid input for subcategory.")
        return jsonify({"error": "Invalid subcategory ID."}), 400

    try:
        # Validate warehouse stock entries using utility function
        sanitized_warehouse_stock = validate_warehouse_stock(warehouse_stock)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Insert product details
        cursor.execute("""
            INSERT INTO Product (Name, Description, Price, Size, Color, Material, StockQuantity, CategoryID, SubCategoryID, Featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, description, price, size, color, material, stock_quantity, category_id, subcategory_id, featured))
        product_id = cursor.lastrowid

        # Initialize stock for each warehouse
        for stock in sanitized_warehouse_stock:
            cursor.execute("""
                INSERT INTO Product_Warehouse (ProductID, WarehouseID, StockQuantity)
                VALUES (?, ?, ?)
            """, (product_id, stock["warehouse_id"], stock["quantity"]))

        conn.commit()
        return jsonify({"message": "Product added successfully"}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@product_bp.route('/<int:product_id>/update', methods=['PUT'])
@role_required(["Product Manager", "Super Admin"])
def update_product(product_id):
    data = request.get_json()

    # Sanitize and validate product details
    name = sanitize_string(data.get('name'))
    description = sanitize_string(data.get('description'))
    price = data.get('price')
    size = sanitize_string(data.get('size'))
    color = sanitize_string(data.get('color'))
    material = sanitize_string(data.get('material'))
    stock_quantity = data.get('stock_quantity')  # For overall stock
    featured = data.get('featured')
    warehouse_updates = data.get('warehouse_updates', [])  # [{"warehouse_id": 1, "quantity": 50}]

    # Validate optional fields
    if name and not is_valid_string(name):
        return jsonify({"error": "Invalid product name"}), 400
    if price is not None and not is_valid_price(price):
        return jsonify({"error": "Price must be a positive number"}), 400
    if stock_quantity is not None and not is_valid_quantity(stock_quantity):
        return jsonify({"error": "Stock quantity must be a non-negative integer"}), 400
    if featured is not None and not isinstance(featured, int):
        return jsonify({"error": "Featured must be an integer (0 or 1)"}), 400

    # Validate and sanitize warehouse updates
    try:
        sanitized_warehouse_updates = validate_warehouse_stock(warehouse_updates)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Update product details
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

        # Update stock in specified warehouses
        for update in sanitized_warehouse_updates:
            cursor.execute("""
                UPDATE Product_Warehouse SET StockQuantity = ?
                WHERE ProductID = ? AND WarehouseID = ?
            """, (update["quantity"], product_id, update["warehouse_id"]))

        conn.commit()
        return jsonify({"message": "Product updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@product_bp.route('/<int:product_id>/delete', methods=['DELETE'])
@role_required(["Product Manager", "Super Admin"]) # Ensures only admins can delete products
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
@role_required(["Product Manager", "Super Admin"])  # Restrict access to admins
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

@product_bp.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)


@product_bp.route('/<int:product_id>/upload-image', methods=['POST'])
@role_required(["Product Manager", "Super Admin"])
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
    
@product_bp.route('/bulk-upload', methods=['POST'])
@role_required(["Product Manager", "Super Admin"])
def bulk_upload_products():
    # Check if the file part exists in the request
    if 'file' not in request.files:
        print("Error: No file part in the request")
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    # Check if the file is allowed
    if not allowed_file(file.filename):
        print(f"Error: Invalid file type for file {file.filename}")
        return jsonify({"error": "Invalid file type, only CSV files are allowed"}), 400

    try:
        # Attempt to decode and read the CSV file
        print("Decoding and reading CSV file")
        stream = StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        # Initialize database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Iterate over rows in the CSV
        for row in csv_reader:
            print(f"Processing row: {row}")  # Debugging: Print each row
            if 'Name' in row and 'Price' in row and 'StockQuantity' in row:
                try:
                    # Insert product details
                    cursor.execute("""
                        INSERT INTO Product 
                        (Name, Description, Price, Size, Color, Material, StockQuantity, CategoryID, SubCategoryID)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        row['Name'],
                        row.get('Description', ''),
                        float(row['Price']),
                        row.get('Size', ''),
                        row.get('Color', ''),
                        row.get('Material', ''),
                        int(row['StockQuantity']),
                        int(row.get('CategoryID', 0)),
                        int(row.get('SubCategoryID', 0))
                    ))
                    product_id = cursor.lastrowid
                    print(f"Inserted Product ID: {product_id}")  # Debugging: Print inserted Product ID

                    # Process warehouse stock if available
                    warehouse_stock = row.get('WarehouseStock', '')
                    for stock_entry in warehouse_stock.split(';'):
                        if stock_entry.strip():  # Ensure non-empty entries
                            try:
                                warehouse_id, quantity = map(int, stock_entry.split(':'))
                                cursor.execute("""
                                    INSERT INTO Product_Warehouse (ProductID, WarehouseID, StockQuantity)
                                    VALUES (?, ?, ?)
                                """, (product_id, warehouse_id, quantity))
                                print(f"Inserted Warehouse stock for Product ID {product_id} with Warehouse ID {warehouse_id} and Quantity {quantity}")
                            except ValueError as stock_error:
                                print(f"Error parsing warehouse stock entry '{stock_entry}': {stock_error}")
                except Exception as row_error:
                    print(f"Error inserting row {row}: {row_error}")
                    continue  # Skip to the next row if there's an error with this one

        # Commit the transaction
        conn.commit()
        print("Bulk upload completed successfully")
        return jsonify({"message": "Bulk upload completed successfully."}), 201

    except Exception as e:
        print(f"General error during file processing: {e}")  # General error logging
        return jsonify({"error": f"An error occurred during upload: {str(e)}"}), 500
    finally:
        conn.close()



@product_bp.route('/categories', methods=['GET'])
@role_required(["Product Manager", "Super Admin"])
def get_categories_and_subcategories():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch categories
    cursor.execute("SELECT CategoryID, Name FROM Category")
    categories = [{"id": row["CategoryID"], "name": row["Name"]} for row in cursor.fetchall()]

    # Fetch subcategories
    cursor.execute("SELECT SubCategoryID, Name, CategoryID FROM SubCategory")
    subcategories = [{"id": row["SubCategoryID"], "name": row["Name"], "category_id": row["CategoryID"]} for row in cursor.fetchall()]

    conn.close()
    return jsonify({"categories": categories, "subcategories": subcategories}), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
@role_required(["Product Manager", "Super Admin"])
def get_product_details(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Print entry into the function
        print(f"Fetching details for Product ID: {product_id}")

        # Fetch the main product details
        cursor.execute("""
            SELECT ProductID, Name, Description, Price, Size, Color, Material, StockQuantity, CategoryID, SubCategoryID, Featured
            FROM Product
            WHERE ProductID = ?
        """, (product_id,))
        
        product = cursor.fetchone()
        if not product:
            print(f"Product ID {product_id} not found in the database.")
            return jsonify({"error": "Product not found"}), 404

        # Print product data fetched from the database
        print(f"Main product details for Product ID {product_id}: {product}")

        # Format the main product details
        product_details = {
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

        # Fetch related warehouse stock information
        cursor.execute("""
            SELECT WarehouseID, StockQuantity
            FROM Product_Warehouse
            WHERE ProductID = ?
        """, (product_id,))
        warehouse_stock = [{"warehouse_id": row["WarehouseID"], "quantity": row["StockQuantity"]} for row in cursor.fetchall()]
        
        # Print warehouse stock information
        print(f"Warehouse stock for Product ID {product_id}: {warehouse_stock}")
        product_details["warehouse_stock"] = warehouse_stock

        # Fetch image paths if available
        cursor.execute("""
            SELECT ImageURL FROM Product_Image
            WHERE ProductID = ?
        """, (product_id,))
        images = [row["ImageURL"] for row in cursor.fetchall()]
        
        # Print images fetched
        print(f"Images for Product ID {product_id}: {images}")
        product_details["images"] = images

        # Fetch category name if available
        cursor.execute("SELECT Name FROM Category WHERE CategoryID = ?", (product["CategoryID"],))
        category = cursor.fetchone()
        if category:
            product_details["category_name"] = category["Name"]
            print(f"Category name for Product ID {product_id}: {category['Name']}")

        # Fetch subcategory name if available
        cursor.execute("SELECT Name FROM SubCategory WHERE SubCategoryID = ?", (product["SubCategoryID"],))
        subcategory = cursor.fetchone()
        if subcategory:
            product_details["sub_category_name"] = subcategory["Name"]
            print(f"Subcategory name for Product ID {product_id}: {subcategory['Name']}")

        # Final response print
        print(f"Final product details for Product ID {product_id}: {product_details}")
        
        return jsonify({"product": product_details}), 200

    except Exception as e:
        print(f"Error fetching product details for Product ID {product_id}: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
