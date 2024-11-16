# app/utils/invoice.py

import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from db import get_db_connection
from datetime import datetime
from flask import current_app

def generate_invoice(order_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Fetch order details
        cursor.execute("""
            SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.ShippingCost, o.TaxRate, o.PaymentStatus,
                   c.Name, c.Email, c.Address, c.MembershipTier
            FROM "Order" o
            JOIN Customer c ON o.UserID = c.UserID
            WHERE o.OrderID = ?
        """, (order_id,))
        order = cursor.fetchone()
        
        if not order:
            current_app.logger.error(f"Order ID {order_id} not found.")
            return None
        
        # Fetch ordered products
        cursor.execute("""
            SELECT p.Name, p.Price, op.Quantity
            FROM Order_Product op
            JOIN Product p ON op.ProductID = p.ProductID
            WHERE op.OrderID = ?
        """, (order_id,))
        products = cursor.fetchall()
        
        # Calculate Tax and Discounts
        membership_tier = order['MembershipTier']
        membership_discount = 0

        if membership_tier == 'Premium':
            membership_discount = 0.05  # 5% discount
        elif membership_tier == 'Gold':
            membership_discount = 0.10  # 10% discount

        discount_amount = order['TotalAmount'] * membership_discount
        tax_amount = (order['TotalAmount'] - discount_amount + order['ShippingCost']) * order['TaxRate']
        total_amount = order['TotalAmount'] - discount_amount + tax_amount + order['ShippingCost']
        
        # Generate unique Invoice Number
        cursor.execute("SELECT COUNT(*) AS count FROM Invoice")
        count = cursor.fetchone()['count'] + 1
        invoice_number = f"INV-{1000 + count}"
        
        # Define the invoice file path
        invoices_dir = os.path.join(current_app.root_path, 'invoices')
        os.makedirs(invoices_dir, exist_ok=True)
        invoice_filename = f"invoice_{order_id}.pdf"
        invoice_path = os.path.join(invoices_dir, invoice_filename)
        
        # Create the PDF invoice
        c = canvas.Canvas(invoice_path, pagesize=letter)
        width, height = letter
        
        # Add Company Logo
        logo_path = os.path.join(current_app.root_path, 'static', 'images', 'logo.png')
        if os.path.exists(logo_path):
            c.drawImage(logo_path, 50, height - 80, width=100, height=50)
        
        # Invoice Header
        c.setFont("Helvetica-Bold", 20)
        c.drawString(200, height - 50, "Invoice")
        
        # Invoice Information
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, height - 150, "Invoice Number:")
        c.drawString(200, height - 150, invoice_number)
        
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, height - 170, "Order ID:")
        c.drawString(200, height - 170, str(order['OrderID']))
        
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, height - 190, "Order Date:")
        c.drawString(200, height - 190, order['OrderDate'])
        
        # Customer Information
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 230, "Bill To:")
        
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 250, f"Name: {order['Name']}")
        c.drawString(50, height - 270, f"Email: {order['Email']}")
        c.drawString(50, height - 290, f"Address: {order['Address']}")
        
        # Table Headers
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, height - 330, "Product")
        c.drawString(300, height - 330, "Price")
        c.drawString(400, height - 330, "Quantity")
        c.drawString(500, height - 330, "Total")
        
        # Draw a line below headers
        c.line(50, height - 335, 550, height - 335)
        
        # Table Content
        c.setFont("Helvetica", 12)
        y = height - 350
        for product in products:
            c.drawString(50, y, product['Name'])
            c.drawString(300, y, f"${product['Price']:.2f}")
            c.drawString(400, y, str(product['Quantity']))
            total = product['Price'] * product['Quantity']
            c.drawString(500, y, f"${total:.2f}")
            y -= 20  # Move down for the next product
        
        # Draw a line above totals
        c.line(400, y + 10, 550, y + 10)
        
        # Shipping Cost
        c.setFont("Helvetica-Bold", 12)
        c.drawString(400, y - 10, "Shipping Cost:")
        c.drawString(500, y - 10, f"${order['ShippingCost']:.2f}")
        
        # Tax and Discount
        c.drawString(400, y - 30, "Tax:")
        c.drawString(500, y - 30, f"${tax_amount:.2f}")
        
        c.drawString(400, y - 50, "Discount:")
        c.drawString(500, y - 50, f"${discount_amount:.2f}")
        
        # Total Amount
        c.setFont("Helvetica-Bold", 14)
        c.drawString(400, y - 80, "Total Amount:")
        c.drawString(500, y - 80, f"${total_amount:.2f}")
        
        # Payment Status
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y - 120, "Payment Status:")
        c.setFont("Helvetica", 12)
        c.drawString(200, y - 120, order['PaymentStatus'])
        
        # Footer
        c.setFont("Helvetica", 10)
        c.drawString(50, 50, f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
        c.drawString(50, 35, "Thank you for your business!")
        
        # Save the PDF
        c.save()
        
        # Insert Invoice Record into Database
        cursor.execute("""
            INSERT INTO Invoice (InvoiceNumber, OrderID, PaymentID, InvoiceDate, TotalAmount, TaxAmount, DiscountAmount, FilePath)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            invoice_number,
            order_id,
            get_payment_id_for_order(cursor, order_id),  # Function to fetch PaymentID
            datetime.utcnow().strftime('%Y-%m-%d'),
            total_amount,
            tax_amount,
            discount_amount,
            invoice_path
        ))
        conn.commit()
        conn.close()
        
        return invoice_path
    
    except Exception as e:
        current_app.logger.error(f"Failed to generate invoice for Order ID {order_id}: {e}")
        return None

def get_payment_id_for_order(cursor, order_id):
    cursor.execute("""
        SELECT PaymentID FROM Payment WHERE OrderID = ?
    """, (order_id,))
    payment = cursor.fetchone()
    if payment:
        return payment['PaymentID']
    else:
        # Handle cases where payment record is missing
        return None