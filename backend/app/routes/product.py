from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity


# Product blueprint
# The /api/v1 prefix will be added in app/__init__.py
product_bp = Blueprint("product", __name__)


# ============================================================
# CREATE PRODUCT
# POST /api/v1/products
# ============================================================
@product_bp.route("/products", methods=["POST", "OPTIONS"])
@jwt_required(optional=True)
def add_product():

    # Handle browser CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    try:
        # Get logged-in user's ID from JWT
        current_user_id = get_jwt_identity()

        if not current_user_id:
            return jsonify({
                "error": "Unauthorized",
                "message": "Please login first"
            }), 401

        # Find user
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # Only farmers can add products
        if user.role != "farmer":
            return jsonify({
                "error": "Only farmers can add products"
            }), 403

        # Get JSON data
        data = request.get_json(silent=True) or {}

        print("\n========== PRODUCT REQUEST ==========")
        print("USER ID:", current_user_id)
        print("USER ROLE:", user.role)
        print("DATA:", data)
        print("=====================================\n")

        # ----------------------------------------------------
        # Read frontend fields
        # ----------------------------------------------------

        title = (
            data.get("title")
            or data.get("name")
            or data.get("crop_title")
            or "Crop"
        )

        category = data.get("category") or "General"

        price_per_unit = (
            data.get("price_per_unit")
            or data.get("price")
            or data.get("cost")
            or 0
        )

        available_quantity = (
            data.get("available_quantity")
            or data.get("quantity")
            or data.get("qty")
            or 1
        )

        unit = data.get("unit") or "kg"

        description = (
            data.get("description")
            or data.get("location")
        )

        image_url = data.get("image_url")

        # ----------------------------------------------------
        # Convert numeric values
        # ----------------------------------------------------

        try:
            price_per_unit = float(price_per_unit)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Invalid price"
            }), 400

        try:
            available_quantity = float(available_quantity)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Invalid quantity"
            }), 400

        # ----------------------------------------------------
        # Create product
        # ----------------------------------------------------

        new_product = Product(
            farmer_id=user.id,
            title=str(title),
            category=str(category),
            price_per_unit=price_per_unit,
            unit=str(unit),
            available_quantity=available_quantity,
            description=str(description) if description else None,
            image_url=str(image_url) if image_url else None
        )

        db.session.add(new_product)
        db.session.commit()

        print("PRODUCT CREATED:", new_product.id)

        return jsonify({
            "message": "Product added successfully",
            "product": new_product.to_dict()
        }), 201

    except Exception as e:

        db.session.rollback()

        print("\n========== ADD PRODUCT ERROR ==========")
        print(str(e))
        print("=======================================\n")

        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


# ============================================================
# GET ALL PRODUCTS
# GET /api/v1/products
# ============================================================
@product_bp.route("/products", methods=["GET", "OPTIONS"])
def get_all_products():

    # Handle browser CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    try:

        products = Product.query.all()

        return jsonify([
            product.to_dict()
            for product in products
        ]), 200

    except Exception as e:

        print("\n========== GET PRODUCTS ERROR ==========")
        print(str(e))
        print("========================================\n")

        return jsonify({
            "error": "Failed to fetch products",
            "message": str(e)
        }), 500