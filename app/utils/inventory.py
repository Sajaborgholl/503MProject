
LOW_STOCK_THRESHOLD = 5  # Customize this threshold as needed

from db import get_db_connection

LOW_STOCK_THRESHOLD = 5  # Customize this threshold as needed

from db import get_db_connection

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
                INSERT INTO Inventory_Log (ProductID, ChangeAmount, ChangeType, Timestamp, WarehouseID)
                VALUES (?, ?, 'Low Stock Alert', datetime('now'), ?)
            """, (product_id, stock_quantity, warehouse_id))
            conn.commit()

    conn.close()

    # Return low stock alerts for optional notification purposes
    return low_stock_alerts


def calculate_inventory_turnover(cursor):
    # Calculate the Cost of Goods Sold (COGS) for the past month
    cursor.execute("""
        SELECT SUM(op.Quantity * p.Price) AS COGS
        FROM Order_Product op
        JOIN Product p ON op.ProductID = p.ProductID
        JOIN "Order" o ON o.OrderID = op.OrderID
        WHERE o.OrderDate >= date('now', '-1 month') AND o.Status = 'Delivered'
    """)
    cogs = cursor.fetchone()["COGS"] or 0

    # Calculate the average inventory across all products
    cursor.execute("""
        SELECT AVG(StockQuantity) AS AvgInventory
        FROM Product
    """)
    avg_inventory = cursor.fetchone()["AvgInventory"] or 1  # Avoid division by zero

    # Calculate turnover rate
    turnover_rate = cogs / avg_inventory if avg_inventory else 0
    return {"cogs": cogs, "average_inventory": avg_inventory, "turnover_rate": turnover_rate}

def calculate_popular_products(cursor):
    # Query to get top 5 products based on total quantity sold
    cursor.execute("""
        SELECT p.Name, SUM(op.Quantity) AS TotalSold
        FROM Order_Product op
        JOIN Product p ON op.ProductID = p.ProductID
        JOIN "Order" o ON o.OrderID = op.OrderID
        WHERE o.Status = 'Delivered'
        GROUP BY p.ProductID
        ORDER BY TotalSold DESC
        LIMIT 5
    """)
    popular_products = cursor.fetchall()
    return [{"name": product["Name"], "total_sold": product["TotalSold"]} for product in popular_products]

def predict_future_demand(cursor):
    # Calculate demand prediction based on sales from the past 6 months
    cursor.execute("""
        SELECT p.Name, SUM(op.Quantity) AS TotalSold
        FROM Order_Product op
        JOIN Product p ON op.ProductID = p.ProductID
        JOIN "Order" o ON o.OrderID = op.OrderID
        WHERE o.OrderDate >= date('now', '-6 month') AND o.Status = 'Delivered'
        GROUP BY p.ProductID
    """)
    sales_data = cursor.fetchall()
    
    # Basic demand prediction: Increase each product's recent sales by 10%
    demand_prediction = [{"product": item["Name"], "predicted_demand": item["TotalSold"] * 1.1} for item in sales_data]
    return demand_prediction
