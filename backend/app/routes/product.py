from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity


# ============================================================
# PRODUCT BLUEPRINT
# ============================================================

product_bp = Blueprint(
    "product",
    __name__
)


# ============================================================
# CREATE PRODUCT
# POST /api/v1/products
# ============================================================

@product_bp.route("/products", methods=["POST", "OPTIONS"])
@jwt_required(optional=True)
def add_product():

    # --------------------------------------------------------
    # CORS PREFLIGHT
    # --------------------------------------------------------

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

        user = User.query.get(int(current_user_id))

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
        # READ JSON
        # ----------------------------------------------------

        data = request.get_json(silent=True) or {}

        print("\n==========================================")
        print("PRODUCT REQUEST")
        print("USER ID:", user.id)
        print("USER EMAIL:", user.email)
        print("USER ROLE:", user.role)
        print("DATA:", data)
        print("==========================================\n")

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # CATEGORY
        # ----------------------------------------------------

        category = (
            data.get("category")
            or data.get("crop_category")
            or "General"
        )

        # ----------------------------------------------------
        # PRICE
        # ----------------------------------------------------

        price_per_unit = (
            data.get("price_per_unit")
            if data.get("price_per_unit") is not None
            else data.get("pricePerUnit")
        )

        if price_per_unit is None:
            price_per_unit = data.get("price")

        if price_per_unit is None:
            price_per_unit = data.get("cost")

        if price_per_unit is None:
            price_per_unit = data.get("price_per_kg")

        if price_per_unit is None:
            price_per_unit = data.get("pricePerKg")

        if price_per_unit is None:

            return jsonify({
                "error": "Price is required"
            }), 400

        # ----------------------------------------------------
        # QUANTITY
        # ----------------------------------------------------

        available_quantity = (
            data.get("available_quantity")
            if data.get("available_quantity") is not None
            else data.get("availableQuantity")
        )

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

        # ----------------------------------------------------
        # UNIT
        # ----------------------------------------------------

        unit = (
            data.get("unit")
            or data.get("unit_type")
            or data.get("unitType")
            or "kg"
        )

        # ----------------------------------------------------
        # LOCATION
        # ----------------------------------------------------

        location = (
            data.get("location")
            or data.get("farm_location")
            or data.get("farmLocation")
        )

        # ----------------------------------------------------
        # DESCRIPTION
        # ----------------------------------------------------

        description = (
            data.get("description")
            or data.get("details")
            or data.get("about")
        )

        # If location is provided but description isn't,
        # store location in description.
        if not description and location:
            description = location

        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------

        image_url = (
            data.get("image_url")
            or data.get("imageUrl")
            or data.get("image")
        )

        # ----------------------------------------------------
        # CONVERT PRICE
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # CONVERT QUANTITY
        # ----------------------------------------------------

        try:

            available_quantity = float(
                available_quantity
            )

        except (TypeError, ValueError):

            return jsonify({
                "error": "Invalid quantity"
            }), 400

        if available_quantity <= 0:

            return jsonify({
                "error": "Available quantity must be greater than 0"
            }), 400

        # ----------------------------------------------------
        # CREATE PRODUCT
        # ----------------------------------------------------

        new_product = Product(

            farmer_id=user.id,

            title=str(
                title
            ).strip(),

            category=str(
                category
            ).strip(),

            price_per_unit=price_per_unit,

            unit=str(
                unit
            ).strip(),

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

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------

        print("\n==========================================")
        print("PRODUCT CREATED SUCCESSFULLY")
        print("ID:", new_product.id)
        print("TITLE:", new_product.title)
        print("FARMER ID:", new_product.farmer_id)
        print("CATEGORY:", new_product.category)
        print("PRICE:", new_product.price_per_unit)
        print("QUANTITY:", new_product.available_quantity)
        print("UNIT:", new_product.unit)
        print("IMAGE:", new_product.image_url)
        print("==========================================\n")

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "message": "Product added successfully",

            "product": new_product.to_dict()

        }), 201

    except Exception as e:

        db.session.rollback()

        print("\n==========================================")
        print("ADD PRODUCT ERROR")
        print("ERROR:", str(e))
        print("==========================================\n")

        return jsonify({

            "error": "Internal server error",

            "message": str(e)

        }), 500


# ============================================================
# GET ALL PRODUCTS
#
# GET /api/v1/products
#
# PUBLIC
# No JWT required
# ============================================================

@product_bp.route(
    "/products",
    methods=["GET", "OPTIONS"]
)
def get_all_products():

    # --------------------------------------------------------
    # CORS PREFLIGHT
    # --------------------------------------------------------

    if request.method == "OPTIONS":
        return "", 200

    try:

        # ----------------------------------------------------
        # GET PRODUCTS
        # ----------------------------------------------------

        products = (
            Product.query
            .order_by(
                Product.created_at.desc()
            )
            .all()
        )

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------

        print("\n==========================================")
        print("GET ALL PRODUCTS")
        print("TOTAL PRODUCTS:", len(products))

        for product in products:

            print(
                "PRODUCT:",
                product.id,
                "|",
                product.title,
                "| FARMER:",
                product.farmer_id,
                "| STOCK:",
                product.available_quantity
            )

        print("==========================================\n")

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify([

            product.to_dict()

            for product in products

        ]), 200

    except Exception as e:

        print("\n==========================================")
        print("GET PRODUCTS ERROR")
        print("ERROR:", str(e))
        print("==========================================\n")

        return jsonify({

            "error": "Failed to fetch products",

            "message": str(e)

        }), 500


# ============================================================
# GET FARMER PRODUCTS
#
# GET /api/v1/farmer/products
#
# ============================================================

@product_bp.route(
    "/farmer/products",
    methods=["GET"]
)
@jwt_required()
def get_farmer_products():

    try:

        # ----------------------------------------------------
        # GET CURRENT USER
        # ----------------------------------------------------

        current_user_id = get_jwt_identity()

        user = User.query.get(
            int(current_user_id)
        )

        if not user:

            return jsonify({
                "error": "User not found"
            }), 404

        # ----------------------------------------------------
        # CHECK ROLE
        # ----------------------------------------------------

        if user.role != "farmer":

            return jsonify({
                "error": "Only farmers can access their products"
            }), 403

        # ----------------------------------------------------
        # GET FARMER PRODUCTS
        # ----------------------------------------------------

        products = (
            Product.query
            .filter_by(
                farmer_id=user.id
            )
            .order_by(
                Product.created_at.desc()
            )
            .all()
        )

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------

        print("\n==========================================")
        print("GET FARMER PRODUCTS")
        print("FARMER ID:", user.id)
        print("TOTAL:", len(products))
        print("==========================================\n")

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify([

            product.to_dict()

            for product in products

        ]), 200

    except Exception as e:

        print("\n==========================================")
        print("GET FARMER PRODUCTS ERROR")
        print("ERROR:", str(e))
        print("==========================================\n")

        return jsonify({

            "error": "Failed to fetch farmer products",

            "message": str(e)

        }), 500