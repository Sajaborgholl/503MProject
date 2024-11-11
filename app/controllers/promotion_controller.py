from flask import Blueprint, request, jsonify
from app.auth.decorators import role_required
from db import get_db_connection

promotion_bp = Blueprint('promotions', __name__)

@promotion_bp.route('/add', methods=['POST'])
@role_required(["Product Manager", "Super Admin"])
def add_promotion():
    data = request.get_json()

    # Retrieve the promotion details
    name = data.get("name")
    discount_rate = data.get("discount_rate")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    target_tier = data.get("target_tier")
    description = data.get("description")

    # Retrieve the target entities
    product_ids = data.get("product_ids", [])  # List of product IDs
    category_id = data.get("category_id")       # Category ID
    subcategory_id = data.get("subcategory_id") # Subcategory ID

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Insert the promotion details
        cursor.execute(
            """
            INSERT INTO Promotion (Name, DiscountRate, StartDate, EndDate, TargetTier, Description)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (name, discount_rate, start_date, end_date, target_tier, description)
        )
        promotion_id = cursor.lastrowid  # Get the new promotion's ID

        # Associate promotion with products, categories, or subcategories
        if product_ids:
            for product_id in product_ids:
                cursor.execute(
                    "INSERT INTO Product_Promotion (PromotionID, ProductID) VALUES (?, ?)",
                    (promotion_id, product_id)
                )
        elif category_id:
            cursor.execute(
                "INSERT INTO Product_Promotion (PromotionID, CategoryID) VALUES (?, ?)",
                (promotion_id, category_id)
            )
        elif subcategory_id:
            cursor.execute(
                "INSERT INTO Product_Promotion (PromotionID, SubCategoryID) VALUES (?, ?)",
                (promotion_id, subcategory_id)
            )

        conn.commit()
        return jsonify({"message": "Promotion added successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@promotion_bp.route('/delete/<int:promotion_id>', methods=['DELETE'])
@role_required(["Product Manager", "Super Admin"])
def delete_promotion(promotion_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Delete from the association table first to avoid foreign key constraints
        cursor.execute("DELETE FROM Product_Promotion WHERE PromotionID = ?", (promotion_id,))

        # Delete the promotion itself
        cursor.execute("DELETE FROM Promotion WHERE PromotionID = ?", (promotion_id,))

        conn.commit()
        return jsonify({"message": "Promotion deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        conn.close()
