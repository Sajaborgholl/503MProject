# app/controllers/inventory_controller.py
from flask import Blueprint, jsonify
from db import get_db_connection  # Use a function to connect to the database

inventory_bp = Blueprint('inventory', __name__)


@inventory_bp.route('/', methods=['GET'])
def get_inventory():
    low_stock_threshold = 10  # Define a threshold for low stock
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to fetch products, their stock, category, and location if needed
        query = """
        SELECT Product.ProductID, Product.Name, Product.StockQuantity, Category.Name AS CategoryName,
               Warehouse.Location AS WarehouseLocation
        FROM Product
        JOIN Category ON Product.CategoryID = Category.CategoryID
        LEFT JOIN Warehouse ON Warehouse.WarehouseID = Product.ProductID
        """

        cursor.execute(query)
        products = cursor.fetchall()

        # Format inventory data for the response
        inventory_data = [
            {
                "product_id": product["ProductID"],
                "name": product["Name"],
                "stock_quantity": product["StockQuantity"],
                "category": product["CategoryName"],
                "warehouse_location": product["WarehouseLocation"],
                "low_stock_alert": "Yes" if product["StockQuantity"] < low_stock_threshold else "No"
            }
            for product in products
        ]

        return jsonify({"inventory": inventory_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
