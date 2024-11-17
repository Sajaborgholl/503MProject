from flask import Blueprint, current_app, request, jsonify, send_file
from db import get_db_connection
from app.auth.decorators import role_required
from datetime import datetime
from app.utils.inventory import check_and_alert_low_stock
from app.utils.invoice import generate_invoice
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
        "INSERT INTO 'Order' (OrderDate, OrderStatus, TotalAmount, UserID) VALUES (?, 'Pending', ?, ?)",
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

    # Fetch the order details
    cursor.execute("""
        SELECT o.OrderID, o.OrderDate, o.OrderStatus, o.TotalAmount, 
               o.ShippingCost, o.TaxRate, o.PaymentStatus, c.name AS CustomerName
        FROM "Order" o
        LEFT JOIN Customer c ON o.UserID = c.UserID
        WHERE o.OrderID = ?
    """, (order_id,))
    order = cursor.fetchone()
    
    if not order:
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    # Fetch the products in this order with names
    cursor.execute("""
        SELECT p.Name AS ProductName, op.Quantity
        FROM Order_Product op
        JOIN Product p ON op.ProductID = p.ProductID
        WHERE op.OrderID = ?
    """, (order_id,))
    products = cursor.fetchall()
    conn.close()

    return jsonify({
        "order": dict(order),
        "products": [dict(product) for product in products]
    }), 200

# Route to update the status of an order
@order_bp.route('/<int:order_id>/update-status', methods=['PUT'])
@role_required(["Order Manager", "Super Admin"])
def update_order_status(order_id):
    try:
        data = request.get_json()
        current_app.logger.info(f"Request data: {data}")
        
        new_status = data.get("status")
        if new_status not in ['Pending', 'Processing', 'Shipped', 'Delivered']:
            return jsonify({"error": "Invalid status"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Log before executing SQL
        current_app.logger.info(f"Updating status to '{new_status}' for OrderID {order_id}")
        
        # Use double quotes for table name to avoid conflicts
        cursor.execute('UPDATE "Order" SET OrderStatus = ? WHERE OrderID = ?', (new_status, order_id))
        conn.commit()

        return jsonify({"message": f"Order {order_id} status updated to {new_status}"}), 200

    except Exception as e:
        current_app.logger.error(f"Error updating order {order_id} status: {e}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        conn.close()

@order_bp.route('/<int:order_id>/invoice', methods=['GET'])
@role_required(["Order Manager", "Super Admin"])
def get_invoice(order_id):
    try:
        current_app.logger.info(f"Received request to generate invoice for Order ID: {order_id}")
        
        # Attempt to generate the invoice
        invoice_path = generate_invoice(order_id)
        
        if not invoice_path:
            current_app.logger.error(f"No invoice generated for Order ID: {order_id}. Verify order existence.")
            return jsonify({"error": "Invoice generation failed or order not found"}), 404
        
        current_app.logger.info(f"Invoice successfully generated for Order ID: {order_id}")
        return send_file(invoice_path, as_attachment=True)
    except Exception as e:
        current_app.logger.error(f"Error generating invoice for Order ID {order_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500

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

    cursor.execute("SELECT * FROM 'Return' WHERE ReturnID = ?", (return_id,))
    return_request = cursor.fetchone()

    if not return_request:
        conn.close()
        return jsonify({"error": "Return not found"}), 404

    cursor.execute("UPDATE 'Return' SET ReturnStatus = ? WHERE ReturnID = ?", (new_status, return_id))
    conn.commit()
    conn.close()

    return jsonify({"message": f"Return {return_id} status updated to {new_status}"}), 200


# Route for an admin to approve a return
@order_bp.route('/<int:return_id>/approve', methods=['PUT'])
@role_required(["Order Manager", "Super Admin"])
def approve_return(return_id):
    data = request.get_json()
    new_status = data.get("returnstatus")

    if new_status not in ['Approved', 'Rejected']:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Update the return status
    cursor.execute("UPDATE Return SET ReturnStatus = ? WHERE ReturnID = ?", (new_status, return_id))
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


@order_bp.route('/returns/<int:return_id>/refund', methods=['POST'])
@role_required(["Order Manager", "Super Admin"])
def process_refund(return_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch the return request
        cursor.execute("SELECT * FROM 'Return' WHERE ReturnID = ?", (return_id,))
        return_request = cursor.fetchone()
        if not return_request:
            return jsonify({"error": "Return request not found"}), 404

        # Check if the return has been approved
        if return_request['ReturnStatus'] != 'Approved':
            return jsonify({"error": "Return request is not approved"}), 400
        
        # Process the refund logic here
        # Add more debug logs if necessary
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Refund processed successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error processing refund: {e}")
        return jsonify({"error": "Internal server error"}), 500


@order_bp.route('/returns/<int:return_id>/replace', methods=['POST'])
@role_required(["Order Manager", "Super Admin"])
def offer_replacement(return_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Fetch the return request
        current_app.logger.info(f"Fetching return request with ReturnID: {return_id}")
        cursor.execute("SELECT * FROM 'Return' WHERE ReturnID = ?", (return_id,))
        return_request = cursor.fetchone()
        if not return_request:
            return jsonify({"error": "Return request not found"}), 404

        # Check if the return has been approved
        if return_request['ReturnStatus'] != 'Approved':
            return jsonify({"error": "Return request is not approved"}), 400

        # Check if a replacement has already been offered
        if return_request['ReplacementOffered']:
            return jsonify({"message": "Replacement has already been offered for this return"}), 400

        # Fetch the original order
        order_id = return_request['OrderID']
        current_app.logger.info(f"Fetching original order with OrderID: {order_id}")
        cursor.execute("SELECT * FROM 'Order' WHERE OrderID = ?", (order_id,))
        original_order = cursor.fetchone()
        if not original_order:
            return jsonify({"error": "Original order not found"}), 404

        # Create a new order for the replacement
        order_date = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        current_app.logger.info(f"Creating a replacement order for UserID: {original_order['UserID']}")
        cursor.execute("""
            INSERT INTO 'Order' (OrderDate, OrderStatus, TotalAmount, UserID, PaymentStatus)
            VALUES (?, 'Processing', ?, ?, 'Unpaid')
        """, (order_date, original_order['TotalAmount'], original_order['UserID']))
        new_order_id = cursor.lastrowid
        current_app.logger.info(f"Replacement order created with OrderID: {new_order_id}")

        # Fetch products from the original order
        current_app.logger.info(f"Fetching products from OrderID: {order_id}")
        cursor.execute("SELECT ProductID, Quantity FROM Order_Product WHERE OrderID = ?", (order_id,))
        order_products = cursor.fetchall()
        current_app.logger.info(f"Products to be added to Replacement Order: {order_products}")

        # Insert products into the new order
        unique_products = {item['ProductID']: item for item in order_products}.values()
        for item in order_products:
            # Check if the combination already exists
            cursor.execute("""
                SELECT COUNT(*) FROM Order_Product WHERE OrderID = ? AND ProductID = ?
            """, (new_order_id, item['ProductID']))
            exists = cursor.fetchone()[0]

            if exists:
                current_app.logger.info(f"ProductID: {item['ProductID']} already exists in OrderID: {new_order_id}. Skipping.")
            else:
                # Insert the product if it doesn't already exist
                cursor.execute("""
                    INSERT INTO Order_Product (OrderID, ProductID, Quantity)
                    VALUES (?, ?, ?)
                """, (new_order_id, item['ProductID'], item['Quantity']))
                current_app.logger.info(f"Added ProductID: {item['ProductID']} to Replacement OrderID: {new_order_id}.")

        # Update inventory (deduct stock)
        for item in order_products:
            cursor.execute("""
                UPDATE Product SET StockQuantity = StockQuantity - ? WHERE ProductID = ?
            """, (item['Quantity'], item['ProductID']))
            
            # Log inventory change
            cursor.execute("""
                INSERT INTO Inventory_Log (ProductID, ChangeAmount, ChangeType, Timestamp)
                VALUES (?, ?, 'Replacement Order', ?)
            """, (item['ProductID'], -item['Quantity'], datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')))

        # Update the return request to indicate a replacement has been offered
        cursor.execute("""
            UPDATE 'Return' SET ReplacementOffered = 1 WHERE ReturnID = ?
        """, (return_id,))

        conn.commit()
        current_app.logger.info(f"Replacement order {new_order_id} created successfully")
        return jsonify({"message": f"Replacement order {new_order_id} created successfully"}), 201

    
    except Exception as e:
        current_app.logger.error(f"Error in offer_replacement endpoint: {e}")
        conn.rollback()
        return jsonify({"error": "Internal server error"}), 500
    
    finally:
        conn.close()

# Route to fetch all refund requests
@order_bp.route('/refunds', methods=['GET'])
@role_required(["Order Manager", "Super Admin"])
def get_all_refunds():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.ReturnID, r.OrderID, r.Reason, r.ReturnDate, r.ReturnStatus, r.RAction, 
               p.PaymentStatus, p.RefundAmount, p.RefundDate
        FROM "Return" r
        LEFT JOIN Payment p ON r.OrderID = p.OrderID
    """)
    refunds = cursor.fetchall()
    conn.close()
    return jsonify([dict(refund) for refund in refunds]), 200

@order_bp.route('/returns/<int:return_id>', methods=['GET'])
@role_required(["Order Manager", "Super Admin"])
def get_return_details(return_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Fetch the return details
    cursor.execute("SELECT * FROM 'Return' WHERE ReturnID = ?", (return_id,))
    return_request = cursor.fetchone()
    if not return_request:
        conn.close()
        return jsonify({"error": "Return request not found"}), 404
    
    conn.close()
    return jsonify(dict(return_request)), 200

# Route to process a refund manually
@order_bp.route('/refunds/<int:return_id>/process', methods=['POST'])
@role_required(["Order Manager", "Super Admin"])
def process_manual_refund(return_id):
    try:
        data = request.get_json()
        refund_amount = data.get("refund_amount", 0)
        refund_date = datetime.utcnow().strftime('%Y-%m-%d')

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the return exists
        cursor.execute("SELECT * FROM 'Return' WHERE ReturnID = ?", (return_id,))
        return_request = cursor.fetchone()
        if not return_request:
            conn.close()
            return jsonify({"error": "Return request not found"}), 404

        # Update the payment and mark refund as completed
        cursor.execute("""
            UPDATE Payment 
            SET PaymentStatus = 'Refunded', RefundAmount = ?, RefundDate = ?
            WHERE OrderID = ?
        """, (refund_amount, refund_date, return_request['OrderID']))

        # Update the return request status
        cursor.execute("""
            UPDATE 'Return' SET Status = 'Processed' WHERE ReturnID = ?
        """, (return_id,))

        conn.commit()
        conn.close()

        return jsonify({"message": f"Refund of ${refund_amount:.2f} processed successfully for Return ID {return_id}"}), 200
    except Exception as e:
        current_app.logger.error(f"Error processing refund for Return ID {return_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500
