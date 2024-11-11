# utils/validators.py
import re
import html

# Define a regex pattern for validating email formats (if needed in other areas)
EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

def is_valid_id(value):
    """Check if a value is a valid positive integer (e.g., IDs)."""
    return isinstance(value, int) and value > 0

def is_valid_string(value, max_length=255):
    """Check if a value is a valid non-empty string within a maximum length."""
    return isinstance(value, str) and 0 < len(value) <= max_length

def sanitize_string(value):
    """Sanitize a string to escape HTML special characters."""
    if isinstance(value, str):
        return html.escape(value.strip())
    return ""

def is_valid_price(value):
    """Check if a value is a valid price (e.g., integer or float greater than zero)."""
    return isinstance(value, (int, float)) and value >= 0

def is_valid_quantity(value):
    """Check if a value is a valid quantity (non-negative integer)."""
    return isinstance(value, int) and value >= 0

def validate_warehouse_stock(warehouse_stock):
    """
    Validate and sanitize warehouse stock entries.
    Each entry should contain a valid warehouse_id and quantity.
    Returns a list of sanitized entries or raises a ValueError if validation fails.
    """
    sanitized_warehouse_stock = []
    for stock in warehouse_stock:
        warehouse_id = stock.get("warehouse_id")
        quantity = stock.get("quantity", 0)

        if is_valid_id(warehouse_id) and is_valid_quantity(quantity):
            sanitized_warehouse_stock.append({"warehouse_id": warehouse_id, "quantity": quantity})
        else:
            raise ValueError("Invalid warehouse stock entry")
    
    return sanitized_warehouse_stock
