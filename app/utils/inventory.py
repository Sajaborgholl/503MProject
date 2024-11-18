
LOW_STOCK_THRESHOLD = 5  # Customize this threshold as needed

from db import get_db_connection

LOW_STOCK_THRESHOLD = 5  # Customize this threshold as needed

from db import get_db_connection
import logging

def check_and_alert_low_stock(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check current stock levels of the product across all warehouses
    cursor.execute("""
        SELECT pw.WarehouseID, p.Name AS ProductName, pw.StockQuantity
        FROM Product_Warehouse pw
        JOIN Product p ON pw.ProductID = p.ProductID
        WHERE pw.ProductID = ?
    """, (product_id,))
    stock_levels = cursor.fetchall()

    low_stock_alerts = []

    # Identify warehouses with low stock and log alerts
    for stock in stock_levels:
        warehouse_id = stock["WarehouseID"]
        stock_quantity = stock["StockQuantity"]

        if stock_quantity < LOW_STOCK_THRESHOLD:
            low_stock_alerts.append({
                "product_id": product_id,
                "product_name": stock["ProductName"],
                "warehouse_id": warehouse_id,
                "stock_quantity": stock_quantity
            })
            # Log low stock alert in Inventory_Log
            cursor.execute("""
                INSERT INTO Inventory_Log (ProductID, ChangeAmount, ChangeType, Timestamp, WarehouseID, StockLevel)
                VALUES (?, ?, 'Low Stock Alert', datetime('now'), ?, ?)
            """, (product_id, stock_quantity, warehouse_id, stock_quantity))
            conn.commit()

    conn.close()

    # Return low stock alerts for optional notification purposes
    return low_stock_alerts

def calculate_inventory_turnover(cursor):
    try:
        # Get COGS (Cost of Goods Sold) for each month
        cursor.execute("""
            SELECT strftime('%Y-%m', o.OrderDate) AS Month, SUM(op.Quantity * p.CostPrice) AS COGS
            FROM Order_Product op
            JOIN Product p ON op.ProductID = p.ProductID
            JOIN "Order" o ON o.OrderID = op.OrderID
            WHERE o.OrderStatus = 'Delivered'
            GROUP BY Month
            ORDER BY Month
        """)
        cogs_data = cursor.fetchall()
        print(cogs_data)
        # Get average inventory value for each month
        cursor.execute("""
            SELECT strftime('%Y-%m', il.Timestamp) AS Month, AVG(il.StockLevel * p.CostPrice) AS AvgInventory
            FROM Inventory_Log il
            JOIN Product p ON il.ProductID = p.ProductID
            GROUP BY Month
            ORDER BY Month
        """)
        inventory_data = cursor.fetchall()
        print(inventory_data)
        # Combine data into a single list
        turnover_data = []
        for cogs_row in cogs_data:
            month = cogs_row['Month']
            cogs = cogs_row['COGS'] or 0
            avg_inventory = next((item['AvgInventory'] for item in inventory_data if item['Month'] == month), 1)
            turnover_rate = cogs / avg_inventory if avg_inventory else 0
            turnover_data.append({
                'month': month,
                'turnover_rate': turnover_rate
            })
        print(turnover_data)
        return turnover_data

    except Exception as e:
        logging.exception("Error calculating inventory turnover")
        raise e  # Re-raise to be caught by the outer try-except

def calculate_popular_products(cursor):
    cursor.execute("""
        SELECT p.ProductID, p.Name, SUM(op.Quantity) AS TotalSold
        FROM Order_Product op
        JOIN Product p ON op.ProductID = p.ProductID
        JOIN "Order" o ON o.OrderID = op.OrderID
        WHERE o.OrderStatus = 'Delivered' -- Corrected field name
        GROUP BY p.ProductID
        ORDER BY TotalSold DESC
        LIMIT 10
    """)
    popular_products = cursor.fetchall()

    return [{"product_id": p["ProductID"], "name": p["Name"], "total_sold": p["TotalSold"]} for p in popular_products]

def predict_future_demand(cursor):
    # Get monthly sales data for each product
    cursor.execute("""
        SELECT p.ProductID, p.Name, strftime('%Y-%m', o.OrderDate) AS Month, SUM(op.Quantity) AS TotalSold
        FROM Order_Product op
        JOIN Product p ON op.ProductID = p.ProductID
        JOIN "Order" o ON o.OrderID = op.OrderID
        WHERE o.OrderStatus = 'Delivered'
        GROUP BY p.ProductID, Month
        ORDER BY p.ProductID, Month
    """)
    sales_data = cursor.fetchall()

    # Organize sales data per product
    product_sales = {}
    for row in sales_data:
        product_id = row['ProductID']
        if product_id not in product_sales:
            product_sales[product_id] = {
                'name': row['Name'],
                'sales': []
            }
        product_sales[product_id]['sales'].append(row)

    # Predict future demand using a simple moving average
    demand_predictions = []
    for product_id, data in product_sales.items():
        sales_quantities = [row['TotalSold'] for row in data['sales']]
        if len(sales_quantities) >= 3:
            # Calculate average of last 3 months
            recent_sales = sales_quantities[-3:]
            predicted_demand = sum(recent_sales) / len(recent_sales)
        else:
            predicted_demand = sum(sales_quantities) / len(sales_quantities)
        demand_predictions.append({
            'product_id': product_id,
            'product_name': data['name'],
            'predicted_demand': predicted_demand
        })

    return demand_predictions
