from flask import Blueprint, request, jsonify
from db import get_db_connection
from app.auth.decorators import role_required
from datetime import datetime
from app.utils.inventory import check_and_alert_low_stock
order_bp = Blueprint('orders', __name__)


# Route to create a new order
@order_bp.route('/create', methods=['POST'])
def create_order():
    data = request.get_json()
    user_id = data.get("user_id")
    products = data.get("products")  # Expected format: [{"product_id": 1, "quantity": 2}, ...]

    # Validate request data
    if not user_id or not products:
        return jsonify({"error": "User ID and product list are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Verify if user exists
    cursor.execute("SELECT * FROM User WHERE UserID = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return jsonify({"error": "Invalid user ID"}), 400

    # Calculate total order amount and update stock
    total_amount = 0
    order_date = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    for item in products:
        product_id = item["product_id"]
        quantity = item["quantity"]

        # Validate quantity is a positive integer
        if quantity <= 0:
            conn.close()
            return jsonify({"error": "Quantity must be a positive integer"}), 400

        # Check if product exists and has sufficient stock
        cursor.execute("SELECT Price, StockQuantity FROM Product WHERE ProductID = ?", (product_id,))
        product = cursor.fetchone()
        if not product:
            conn.close()
            return jsonify({"error": f"Product with ID {product_id} does not exist"}), 404
        if product["StockQuantity"] < quantity:
            conn.close()
            return jsonify({"error": f"Insufficient stock for product ID {product_id}"}), 400

        # Calculate order total
        total_amount += product["Price"] * quantity

        # Deduct stock quantity
        cursor.execute(
            "UPDATE Product SET StockQuantity = StockQuantity - ? WHERE ProductID = ?",
            (quantity, product_id)
        )
        check_and_alert_low_stock(item["product_id"])

        # Log the stock change in Inventory_Log
        cursor.execute(
            """
            INSERT INTO Inventory_Log (ProductID, ChangeAmount, ChangeType, Timestamp)
            VALUES (?, ?, ?, ?)
            """,
            (product_id, -quantity, 'Order Created', order_date)
        )

    # Insert order into the Order table
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

    # Commit the transaction and close connection
    conn.commit()
    conn.close()

    return jsonify({"message": "Order created successfully", "order_id": order_id}), 201
# Route to view all orders
@order_bp.route('/all', methods=['GET'])
@role_required(["Order Manager", "Super Admin"])
def get_all_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM 'Order'")
    orders = cursor.fetchall()
    conn.close()
    return jsonify([dict(order) for order in orders]), 200

# Route to view a specific order by ID
@order_bp.route('/<int:order_id>', methods=['GET'])
@role_required(["Order Manager", "Super Admin"])
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
@role_required(["Order Manager", "Super Admin"])
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


# Route to create a return request
@order_bp.route('/<int:order_id>/create-return', methods=['POST'])
def create_return(order_id):
    data = request.get_json()
    reason = data.get("reason", "")
    return_date = datetime.utcnow().strftime('%Y-%m-%d')
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if the order exists
    cursor.execute("SELECT * FROM 'Order' WHERE OrderID = ?", (order_id,))
    order = cursor.fetchone()
    if not order:
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    # Insert the return request
    cursor.execute(
        "INSERT INTO 'Return' (OrderID, ReturnDate, Reason, Status) VALUES (?, ?, ?, 'Pending')",
        (order_id, return_date, reason)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Return request created successfully"}), 201

# Route to view all return requests
@order_bp.route('/returns', methods=['GET'])
@role_required(["Order Manager", "Super Admin"])
def get_all_returns():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM 'Return'")
    returns = cursor.fetchall()
    conn.close()
    return jsonify([dict(return_request) for return_request in returns]), 200


# Route to update the status of a return request and log inventory changes if applicable
@order_bp.route('/returns/<int:return_id>/update-status', methods=['PUT'])
@role_required(["Order Manager", "Super Admin"])
def update_return_status(return_id):
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ['Pending', 'Approved', 'Rejected', 'Processed']:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update the status of the return
    cursor.execute("UPDATE 'Return' SET Status = ? WHERE ReturnID = ?", (new_status, return_id))

    # If the return is approved, log changes in the Inventory_Log and update stock
    if new_status == 'Approved':
        cursor.execute("SELECT OrderID FROM 'Return' WHERE ReturnID = ?", (return_id,))
        order_id = cursor.fetchone()["OrderID"]

        # Fetch the returned products from the Order_Product table
        cursor.execute("SELECT ProductID, Quantity FROM Order_Product WHERE OrderID = ?", (order_id,))
        returned_products = cursor.fetchall()

        for product in returned_products:
            product_id = product["ProductID"]
            quantity_returned = product["Quantity"]

            # Update the stock quantity in the Product table
            cursor.execute(
                "UPDATE Product SET StockQuantity = StockQuantity + ? WHERE ProductID = ?",
                (quantity_returned, product_id)
            )

            # Log the change in the Inventory_Log table
            cursor.execute(
                "INSERT INTO Inventory_Log (ProductID, ChangeAmount, ChangeType, Timestamp) VALUES (?, ?, 'Return', ?)",
                (product_id, quantity_returned, datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'))
            )

    conn.commit()
    conn.close()

    return jsonify({"message": f"Return {return_id} status updated to {new_status} and inventory updated if applicable"}), 200



# Route for an admin to approve a return
@order_bp.route('/<int:return_id>/approve', methods=['PUT'])
@role_required(["Order Manager", "Super Admin"])
def approve_return(return_id):
    data = request.get_json()
    new_status = data.get("status")

    if new_status not in ['Approved', 'Rejected']:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update the return status
    cursor.execute("UPDATE Return SET Status = ? WHERE ReturnID = ?", (new_status, return_id))
    conn.commit()

    # If the return is approved, log the change in Inventory_Log and update stock
    if new_status == 'Approved':
        # Fetch the associated order and product details
        cursor.execute("""
            SELECT Order_Product.ProductID, Order_Product.Quantity 
            FROM Order_Product
            JOIN Return ON Order_Product.OrderID = Return.OrderID
            WHERE Return.ReturnID = ?
        """, (return_id,))
        returned_items = cursor.fetchall()

        # Update inventory and log changes for each returned product
        for item in returned_items:
            product_id = item['ProductID']
            quantity = item['Quantity']

            # Update product stock quantity
            cursor.execute(
                "UPDATE Product SET StockQuantity = StockQuantity + ? WHERE ProductID = ?",
                (quantity, product_id)
            )

            # Log the inventory change
            cursor.execute("""
                INSERT INTO Inventory_Log (ProductID, ChangeAmount, ChangeType, Timestamp)
                VALUES (?, ?, 'Return', ?)
            """, (product_id, quantity, datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')))

        conn.commit()

    conn.close()

    return jsonify({"message": f"Return {return_id} status updated to {new_status}"}), 200