import os
from werkzeug.utils import secure_filename
from flask import current_app
import sqlite3
from db import get_db_connection

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_image(file):
    """Save the uploaded image if allowed."""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(upload_path)
        return upload_path
    return None


def save_image_to_server(file, product_id):
    if file and allowed_file(file.filename):
        # Generate a secure filename
        filename = secure_filename(file.filename)
        
        # Define the path based on product ID for better organization
        product_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], f'products/{product_id}')
        
        # Ensure the product-specific upload directory exists
        os.makedirs(product_folder, exist_ok=True)
        
        # Full path where the file will be saved
        file_path = os.path.join(product_folder, filename)
        
        # Save the file to the organized folder
        file.save(file_path)
        
        # Return the relative file path to store in the database
        return os.path.relpath(file_path, start=current_app.config['UPLOAD_FOLDER'])
    return None

def save_image_path_to_database(product_id, file_path):
    # Set a longer timeout specifically for this function
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO Product_Image (ProductID, ImageURL) VALUES (?, ?)",
            (product_id, file_path)
        )
        conn.commit()
    except sqlite3.OperationalError:
        raise Exception("Database is locked, please try again")
    finally:
        conn.close()
