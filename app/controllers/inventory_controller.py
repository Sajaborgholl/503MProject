from flask import Blueprint, jsonify
from db import get_db_connection
from app.auth.decorators import role_required
from app.utils.inventory import (
    calculate_inventory_turnover,
    calculate_popular_products,
    predict_future_demand
)
from flask_cors import CORS

inventory_bp = Blueprint('inventory', __name__)
CORS(inventory_bp, resources={r"/inventory/*": {"origins": "http://localhost:3000"}})

# Route to get real-time inventory levels across warehouses
@inventory_bp.route('/realtime-inventory', methods=['GET'])
@role_required(["Inventory Manager", "Super Admin"])
def get_realtime_inventory():
    """Fetch real-time stock levels for each product across all warehouses."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query to fetch product stock levels across warehouses along with category name
    cursor.execute("""
        SELECT p.ProductID, p.Name AS ProductName, pw.WarehouseID, pw.StockQuantity, c.Name AS CategoryName
        FROM Product p
        JOIN Product_Warehouse pw ON p.ProductID = pw.ProductID
        LEFT JOIN Category c ON p.CategoryID = c.CategoryID
    """)
    inventory_data = cursor.fetchall()

    # Organize data by product with warehouse-specific details
    inventory_report = {}
    for item in inventory_data:
        product_id = item["ProductID"]
        warehouse_id = item["WarehouseID"]
        stock_quantity = item["StockQuantity"]

        # Initialize the product entry if it doesn't exist
        if product_id not in inventory_report:
            inventory_report[product_id] = {
                "product_name": item["ProductName"],
                "category_name": item["CategoryName"],
                "warehouses": []
            }

        # Add warehouse-specific stock details
        inventory_report[product_id]["warehouses"].append({
            "warehouse_id": warehouse_id,
            "stock_quantity": stock_quantity
        })

    conn.close()
    return jsonify(inventory_report), 200

import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Route for generating a comprehensive inventory report
@inventory_bp.route('/inventory-report', methods=['GET'])
@role_required(["Inventory Manager", "Super Admin"])
def generate_inventory_report():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Inventory Turnover
        turnover_report = calculate_inventory_turnover(cursor)

        # 2. Most Popular Products
        popular_products_report = calculate_popular_products(cursor)

        # 3. Demand Prediction
        demand_prediction_report = predict_future_demand(cursor)

        return jsonify({
            "inventory_turnover": turnover_report,
            "popular_products": popular_products_report,
            "demand_prediction": demand_prediction_report
        }), 200

    except Exception as e:
        # Log the error with traceback
        logging.exception("Error generating inventory report")
        return jsonify({"error": "Failed to generate inventory report"}), 500

    finally:
        conn.close()
