from flask import Blueprint, request, jsonify
from db import get_db_connection
from app.auth.decorators import admin_required
from datetime import datetime

order_bp = Blueprint('order', __name__)

# Route to create a new order
@order_bp.route('/create', methods=['POST'])
def create_order():
    data = request.get_json()
    user_id = data.get("user_id")
    products = data.get("products")  # Expected format: [{"product_id": 1, "quantity": 2}, ...]

    if not user_id or not products:
        return jsonify({"error": "User ID and products are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Calculate total order amount and update stock
    total_amount = 0
    for item in products:
        cursor.execute("SELECT Price, StockQuantity FROM Product WHERE ProductID = ?", (item["product_id"],))
        product = cursor.fetchone()
        
        if not product or product["StockQuantity"] < item["quantity"]:
            conn.close()
            return jsonify({"error": "Product unavailable or insufficient stock"}), 400
        
        total_amount += product["Price"] * item["quantity"]

        # Deduct the stock
        cursor.execute(
            "UPDATE Product SET StockQuantity = StockQuantity - ? WHERE ProductID = ?",
            (item["quantity"], item["product_id"])
        )

    # Insert order into the Order table
    order_date = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute(
        "INSERT INTO 'Order' (OrderDate, Status, TotalAmount, UserID) VALUES (?, 'Pending', ?, ?)",
        (order_date, total_amount, user_id)
    )
    order_id = cursor.lastrowid

    # Insert each product into the Order_Product table
    for item in products:
        cursor.execute(
            "INSERT INTO Order_Product (OrderID, ProductID, Quantity) VALUES (?, ?, ?)",
            (order_id, item["product_id"], item["quantity"])
        )

    conn.commit()
    conn.close()

    return jsonify({"message": "Order created successfully", "order_id": order_id}), 201

# Route to view all orders
@order_bp.route('/all', methods=['GET'])
@admin_required
def get_all_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM 'Order'")
    orders = cursor.fetchall()
    conn.close()
    return jsonify([dict(order) for order in orders]), 200

# Route to view a specific order by ID
@order_bp.route('/<int:order_id>', methods=['GET'])
@admin_required
def get_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM 'Order' WHERE OrderID = ?", (order_id,))
    order = cursor.fetchone()
    
    if not order:
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    # Get products in this order
    cursor.execute("SELECT * FROM Order_Product WHERE OrderID = ?", (order_id,))
    products = cursor.fetchall()
    conn.close()

    return jsonify({"order": dict(order), "products": [dict(product) for product in products]}), 200

# Route to update the status of an order
@order_bp.route('/<int:order_id>/update-status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ['Pending', 'Processing', 'Shipped', 'Delivered']:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE 'Order' SET Status = ? WHERE OrderID = ?", (new_status, order_id))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Order {order_id} status updated to {new_status}"}), 200
