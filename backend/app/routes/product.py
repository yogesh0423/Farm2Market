from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity


# ============================================================
# PRODUCT BLUEPRINT
# ============================================================

product_bp = Blueprint("product", __name__)


# ============================================================
# CREATE PRODUCT
# POST /api/v1/products
# ============================================================

@product_bp.route("/products", methods=["POST", "OPTIONS"])
@jwt_required(optional=True)
def add_product():

    # CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    try:
        # ----------------------------------------------------
        # GET LOGGED-IN USER
        # ----------------------------------------------------

        current_user_id = get_jwt_identity()

        if not current_user_id:
            return jsonify({
                "error": "Unauthorized",
                "message": "Please login first"
            }), 401

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

        # ----------------------------------------------------
        # READ JSON DATA
        # ----------------------------------------------------

        data = request.get_json(silent=True) or {}

        print("\n========== PRODUCT REQUEST ==========")
        print("USER ID:", current_user_id)
        print("USER ROLE:", user.role)
        print("DATA:", data)
        print("=====================================\n")

        # ====================================================
        # TITLE
        # ====================================================

        title = (
            data.get("title")
            or data.get("name")
            or data.get("crop_title")
            or data.get("cropName")
        )

        if not title:
            return jsonify({
                "error": "Product title is required"
            }), 400

        # ====================================================
        # CATEGORY
        # ====================================================

        category = (
            data.get("category")
            or data.get("crop_category")
            or "General"
        )

        # ====================================================
        # PRICE
        #
        # Accept:
        # price_per_unit
        # pricePerUnit
        # price
        # cost
        # price_per_kg
        # pricePerKg
        # ====================================================

        price_per_unit = data.get("price_per_unit")

        if price_per_unit is None:
            price_per_unit = data.get("pricePerUnit")

        if price_per_unit is None:
            price_per_unit = data.get("price")

        if price_per_unit is None:
            price_per_unit = data.get("cost")

        # YOUR FRONTEND USES THIS
        if price_per_unit is None:
            price_per_unit = data.get("price_per_kg")

        if price_per_unit is None:
            price_per_unit = data.get("pricePerKg")

        if price_per_unit is None:
            return jsonify({
                "error": "Price is required"
            }), 400

        # ====================================================
        # AVAILABLE QUANTITY
        #
        # Accept ALL frontend variations
        # ====================================================

        available_quantity = data.get("available_quantity")

        if available_quantity is None:
            available_quantity = data.get("availableQuantity")

        # YOUR FRONTEND USES THIS
        if available_quantity is None:
            available_quantity = data.get("quantity_available")

        if available_quantity is None:
            available_quantity = data.get("quantity")

        if available_quantity is None:
            available_quantity = data.get("quantity_kg")

        if available_quantity is None:
            available_quantity = data.get("quantityKg")

        if available_quantity is None:
            available_quantity = data.get("qty")

        if available_quantity is None:
            available_quantity = data.get("stock")

        if available_quantity is None:
            return jsonify({
                "error": "Available quantity is required"
            }), 400

        # ====================================================
        # UNIT
        # ====================================================

        unit = (
            data.get("unit")
            or data.get("unit_type")
            or data.get("unitType")
            or "kg"
        )

        # ====================================================
        # LOCATION
        #
        # Product model does not have location column.
        # We store it in description.
        # ====================================================

        location = (
            data.get("location")
            or data.get("farm_location")
            or data.get("farmLocation")
        )

        description = (
            data.get("description")
            or data.get("details")
            or data.get("about")
        )

        # If frontend sends location but no description,
        # use location as description.
        if not description and location:
            description = location

        # ====================================================
        # IMAGE
        # ====================================================

        image_url = (
            data.get("image_url")
            or data.get("imageUrl")
            or data.get("image")
        )

        # ====================================================
        # CONVERT PRICE
        # ====================================================

        try:
            price_per_unit = float(price_per_unit)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Invalid price"
            }), 400

        if price_per_unit < 0:
            return jsonify({
                "error": "Price cannot be negative"
            }), 400

        # ====================================================
        # CONVERT QUANTITY
        # ====================================================

        try:
            available_quantity = float(available_quantity)
        except (TypeError, ValueError):
            return jsonify({
                "error": "Invalid quantity"
            }), 400

        if available_quantity <= 0:
            return jsonify({
                "error": "Available quantity must be greater than 0"
            }), 400

        # ====================================================
        # CREATE PRODUCT
        # ====================================================

        new_product = Product(
            farmer_id=user.id,
            title=str(title).strip(),
            category=str(category).strip(),
            price_per_unit=price_per_unit,
            unit=str(unit).strip(),
            available_quantity=available_quantity,

            description=(
                str(description).strip()
                if description
                else None
            ),

            image_url=(
                str(image_url).strip()
                if image_url
                else None
            )
        )

        db.session.add(new_product)
        db.session.commit()

        # ====================================================
        # DEBUG
        # ====================================================

        print("\n========== PRODUCT CREATED ==========")
        print("ID:", new_product.id)
        print("TITLE:", new_product.title)
        print("CATEGORY:", new_product.category)
        print("PRICE:", new_product.price_per_unit)
        print("QUANTITY:", new_product.available_quantity)
        print("UNIT:", new_product.unit)
        print("DESCRIPTION/LOCATION:", new_product.description)
        print("IMAGE:", new_product.image_url)
        print("=====================================\n")

        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({
            "message": "Product added successfully",
            "product": new_product.to_dict()
        }), 201

    except Exception as e:

        db.session.rollback()

        print("\n========== ADD PRODUCT ERROR ==========")
        print("ERROR:", str(e))
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

    # CORS preflight
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
        print("ERROR:", str(e))
        print("========================================\n")

        return jsonify({
            "error": "Failed to fetch products",
            "message": str(e)
        }), 500