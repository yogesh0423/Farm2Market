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
# HELPER
# ============================================================

def get_current_user():
    """
    Get the currently authenticated user.
    """

    current_user_id = get_jwt_identity()

    if not current_user_id:
        return None

    try:
        user_id = int(current_user_id)
    except (TypeError, ValueError):
        return None

    return User.query.get(user_id)


def product_response(product):
    """
    Return a consistent product response.
    """

    return product.to_dict()


# ============================================================
# CREATE PRODUCT
#
# POST /api/v1/products
#
# FARMER ONLY
# ============================================================

@product_bp.route(
    "/products",
    methods=["POST", "OPTIONS"],
    strict_slashes=False
)
@jwt_required()
def add_product():

    # --------------------------------------------------------
    # CORS PREFLIGHT
    # --------------------------------------------------------

    if request.method == "OPTIONS":
        return "", 200

    try:

        # ----------------------------------------------------
        # CURRENT USER
        # ----------------------------------------------------

        user = get_current_user()

        if not user:
            return jsonify({
                "error": "Unauthorized",
                "message": "Please login first"
            }), 401

        if user.role != "farmer":
            return jsonify({
                "error": "Only farmers can add products"
            }), 403

        # ----------------------------------------------------
        # JSON
        # ----------------------------------------------------

        data = request.get_json(
            silent=True
        ) or {}

        print("\n==========================================")
        print("CREATE PRODUCT")
        print("FARMER ID:", user.id)
        print("DATA:", data)
        print("==========================================")

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        title = (
            data.get("title")
            or data.get("name")
            or data.get("crop_title")
            or data.get("cropName")
        )

        if not title or not str(title).strip():
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
        # DESCRIPTION
        # ----------------------------------------------------

        description = (
            data.get("description")
            or data.get("details")
            or data.get("about")
        )

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
            price_per_unit = float(
                price_per_unit
            )
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
        # CREATE
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

        db.session.add(
            new_product
        )

        db.session.commit()

        db.session.refresh(
            new_product
        )

        print("\n==========================================")
        print("PRODUCT CREATED")
        print("ID:", new_product.id)
        print("TITLE:", new_product.title)
        print("FARMER:", new_product.farmer_id)
        print("PRICE:", new_product.price_per_unit)
        print("QUANTITY:", new_product.available_quantity)
        print("==========================================")

        return jsonify({
            "message": "Product added successfully",
            "product": product_response(new_product)
        }), 201

    except Exception as e:

        db.session.rollback()

        print("\n==========================================")
        print("ADD PRODUCT ERROR")
        print(str(e))
        print("==========================================")

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
# ============================================================

@product_bp.route(
    "/products",
    methods=["GET", "OPTIONS"],
    strict_slashes=False
)
def get_all_products():

    if request.method == "OPTIONS":
        return "", 200

    try:

        products = (
            Product.query
            .order_by(
                Product.created_at.desc()
            )
            .all()
        )

        print("\n==========================================")
        print("GET ALL PRODUCTS")
        print("TOTAL:", len(products))

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

        print("==========================================")

        return jsonify([
            product_response(product)
            for product in products
        ]), 200

    except Exception as e:

        print("\n==========================================")
        print("GET PRODUCTS ERROR")
        print(str(e))
        print("==========================================")

        return jsonify({
            "error": "Failed to fetch products",
            "message": str(e)
        }), 500


# ============================================================
# GET SINGLE PRODUCT
#
# GET /api/v1/products/<product_id>
#
# PUBLIC
# ============================================================

@product_bp.route(
    "/products/<int:product_id>",
    methods=["GET", "OPTIONS"],
    strict_slashes=False
)
def get_product(product_id):

    if request.method == "OPTIONS":
        return "", 200

    try:

        product = Product.query.get(
            product_id
        )

        if not product:

            return jsonify({
                "error": "Product not found"
            }), 404

        return jsonify(
            product_response(product)
        ), 200

    except Exception as e:

        print(
            "GET PRODUCT ERROR:",
            str(e)
        )

        return jsonify({
            "error": "Failed to fetch product",
            "message": str(e)
        }), 500


# ============================================================
# GET FARMER PRODUCTS
#
# GET /api/v1/farmer/products
#
# FARMER ONLY
# ============================================================

@product_bp.route(
    "/farmer/products",
    methods=["GET", "OPTIONS"],
    strict_slashes=False
)
@jwt_required()
def get_farmer_products():

    if request.method == "OPTIONS":
        return "", 200

    try:

        user = get_current_user()

        if not user:

            return jsonify({
                "error": "Unauthorized"
            }), 401

        if user.role != "farmer":

            return jsonify({
                "error": "Only farmers can access their products"
            }), 403

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

        print("\n==========================================")
        print("GET FARMER PRODUCTS")
        print("FARMER ID:", user.id)
        print("TOTAL:", len(products))
        print("==========================================")

        return jsonify([
            product_response(product)
            for product in products
        ]), 200

    except Exception as e:

        print("\n==========================================")
        print("GET FARMER PRODUCTS ERROR")
        print(str(e))
        print("==========================================")

        return jsonify({
            "error": "Failed to fetch farmer products",
            "message": str(e)
        }), 500


# ============================================================
# UPDATE PRODUCT
#
# PUT /api/v1/products/<product_id>
#
# FARMER ONLY
# ============================================================

@product_bp.route(
    "/products/<int:product_id>",
    methods=["PUT", "PATCH", "OPTIONS"],
    strict_slashes=False
)
@jwt_required()
def update_product(product_id):

    if request.method == "OPTIONS":
        return "", 200

    try:

        # ----------------------------------------------------
        # CURRENT USER
        # ----------------------------------------------------

        user = get_current_user()

        if not user:

            return jsonify({
                "error": "Unauthorized"
            }), 401

        if user.role != "farmer":

            return jsonify({
                "error": "Only farmers can update products"
            }), 403

        # ----------------------------------------------------
        # PRODUCT
        # ----------------------------------------------------

        product = Product.query.get(
            product_id
        )

        if not product:

            return jsonify({
                "error": "Product not found"
            }), 404

        # ----------------------------------------------------
        # OWNERSHIP
        # ----------------------------------------------------

        if product.farmer_id != user.id:

            return jsonify({
                "error": "You are not authorized to update this product"
            }), 403

        data = request.get_json(
            silent=True
        ) or {}

        print("\n==========================================")
        print("UPDATE PRODUCT")
        print("PRODUCT ID:", product.id)
        print("FARMER ID:", user.id)
        print("DATA:", data)
        print("==========================================")

        # ----------------------------------------------------
        # TITLE
        # ----------------------------------------------------

        title = (
            data.get("title")
            if data.get("title") is not None
            else data.get("name")
        )

        if title is not None:

            title = str(
                title
            ).strip()

            if not title:

                return jsonify({
                    "error": "Product title cannot be empty"
                }), 400

            product.title = title

        # ----------------------------------------------------
        # CATEGORY
        # ----------------------------------------------------

        category = data.get(
            "category"
        )

        if category is not None:

            category = str(
                category
            ).strip()

            if category:
                product.category = category

        # ----------------------------------------------------
        # PRICE
        # ----------------------------------------------------

        price = (
            data.get("price_per_unit")
            if data.get("price_per_unit") is not None
            else data.get("pricePerUnit")
        )

        if price is None:
            price = data.get("price")

        if price is None:
            price = data.get("price_per_kg")

        if price is not None:

            try:
                price = float(price)
            except (TypeError, ValueError):

                return jsonify({
                    "error": "Invalid price"
                }), 400

            if price < 0:

                return jsonify({
                    "error": "Price cannot be negative"
                }), 400

            product.price_per_unit = price

        # ----------------------------------------------------
        # QUANTITY / STOCK
        # ----------------------------------------------------

        quantity = (
            data.get("available_quantity")
            if data.get("available_quantity") is not None
            else data.get("availableQuantity")
        )

        if quantity is None:
            quantity = data.get("quantity_available")

        if quantity is None:
            quantity = data.get("quantity")

        if quantity is None:
            quantity = data.get("quantity_kg")

        if quantity is None:
            quantity = data.get("quantityKg")

        if quantity is None:
            quantity = data.get("qty")

        if quantity is None:
            quantity = data.get("stock")

        if quantity is not None:

            try:
                quantity = float(quantity)
            except (TypeError, ValueError):

                return jsonify({
                    "error": "Invalid quantity"
                }), 400

            if quantity < 0:

                return jsonify({
                    "error": "Quantity cannot be negative"
                }), 400

            product.available_quantity = quantity

        # ----------------------------------------------------
        # UNIT
        # ----------------------------------------------------

        unit = (
            data.get("unit")
            or data.get("unit_type")
            or data.get("unitType")
        )

        if unit is not None:

            unit = str(
                unit
            ).strip()

            if unit:
                product.unit = unit

        # ----------------------------------------------------
        # DESCRIPTION
        # ----------------------------------------------------

        if "description" in data:

            product.description = (
                str(data["description"]).strip()
                if data["description"] is not None
                else None
            )

        elif "details" in data:

            product.description = (
                str(data["details"]).strip()
                if data["details"] is not None
                else None
            )

        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------

        image_url = (
            data.get("image_url")
            if data.get("image_url") is not None
            else data.get("imageUrl")
        )

        if image_url is None:
            image_url = data.get("image")

        if image_url is not None:

            product.image_url = (
                str(image_url).strip()
                if image_url
                else None
            )

        # ----------------------------------------------------
        # SAVE
        # ----------------------------------------------------

        db.session.commit()

        db.session.refresh(
            product
        )

        print("\n==========================================")
        print("PRODUCT UPDATED")
        print("ID:", product.id)
        print("TITLE:", product.title)
        print("PRICE:", product.price_per_unit)
        print("QUANTITY:", product.available_quantity)
        print("UNIT:", product.unit)
        print("==========================================")

        return jsonify({

            "message": "Product updated successfully",

            "product": product_response(product)

        }), 200

    except Exception as e:

        db.session.rollback()

        print("\n==========================================")
        print("UPDATE PRODUCT ERROR")
        print(str(e))
        print("==========================================")

        return jsonify({
            "error": "Failed to update product",
            "message": str(e)
        }), 500


# ============================================================
# DELETE PRODUCT
#
# DELETE /api/v1/products/<product_id>
#
# FARMER ONLY
# ============================================================

@product_bp.route(
    "/products/<int:product_id>",
    methods=["DELETE", "OPTIONS"],
    strict_slashes=False
)
@jwt_required()
def delete_product(product_id):

    if request.method == "OPTIONS":
        return "", 200

    try:

        # ----------------------------------------------------
        # CURRENT USER
        # ----------------------------------------------------

        user = get_current_user()

        if not user:

            return jsonify({
                "error": "Unauthorized"
            }), 401

        if user.role != "farmer":

            return jsonify({
                "error": "Only farmers can delete products"
            }), 403

        # ----------------------------------------------------
        # PRODUCT
        # ----------------------------------------------------

        product = Product.query.get(
            product_id
        )

        if not product:

            return jsonify({
                "error": "Product not found"
            }), 404

        # ----------------------------------------------------
        # OWNERSHIP
        # ----------------------------------------------------

        if product.farmer_id != user.id:

            return jsonify({
                "error": "You are not authorized to delete this product"
            }), 403

        # ----------------------------------------------------
        # CHECK EXISTING ORDERS
        # ----------------------------------------------------

        if product.orders:

            return jsonify({
                "error": (
                    "This product cannot be deleted because "
                    "it has existing orders. "
                    "You can set its stock to 0 instead."
                )
            }), 409

        # ----------------------------------------------------
        # DELETE
        # ----------------------------------------------------

        product_id_deleted = product.id
        product_title_deleted = product.title

        db.session.delete(
            product
        )

        db.session.commit()

        print("\n==========================================")
        print("PRODUCT DELETED")
        print("ID:", product_id_deleted)
        print("TITLE:", product_title_deleted)
        print("FARMER ID:", user.id)
        print("==========================================")

        return jsonify({

            "message": "Product deleted successfully",

            "product_id": product_id_deleted

        }), 200

    except Exception as e:

        db.session.rollback()

        print("\n==========================================")
        print("DELETE PRODUCT ERROR")
        print(str(e))
        print("==========================================")

        return jsonify({
            "error": "Failed to delete product",
            "message": str(e)
        }), 500


# ============================================================
# UPDATE STOCK ONLY
#
# PATCH /api/v1/products/<product_id>/stock
#
# FARMER ONLY
# ============================================================

@product_bp.route(
    "/products/<int:product_id>/stock",
    methods=["PATCH", "PUT", "OPTIONS"],
    strict_slashes=False
)
@jwt_required()
def update_product_stock(product_id):

    if request.method == "OPTIONS":
        return "", 200

    try:

        user = get_current_user()

        if not user:

            return jsonify({
                "error": "Unauthorized"
            }), 401

        if user.role != "farmer":

            return jsonify({
                "error": "Only farmers can update stock"
            }), 403

        product = Product.query.get(
            product_id
        )

        if not product:

            return jsonify({
                "error": "Product not found"
            }), 404

        if product.farmer_id != user.id:

            return jsonify({
                "error": "You are not authorized to update this product"
            }), 403

        data = request.get_json(
            silent=True
        ) or {}

        quantity = (
            data.get("available_quantity")
            if data.get("available_quantity") is not None
            else data.get("availableQuantity")
        )

        if quantity is None:
            quantity = data.get("stock")

        if quantity is None:
            quantity = data.get("quantity")

        if quantity is None:

            return jsonify({
                "error": "Stock quantity is required"
            }), 400

        try:
            quantity = float(quantity)
        except (TypeError, ValueError):

            return jsonify({
                "error": "Invalid stock quantity"
            }), 400

        if quantity < 0:

            return jsonify({
                "error": "Stock cannot be negative"
            }), 400

        product.available_quantity = quantity

        db.session.commit()

        db.session.refresh(
            product
        )

        return jsonify({

            "message": "Stock updated successfully",

            "product": product_response(product),

            "available_quantity":
                product.available_quantity

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "UPDATE STOCK ERROR:",
            str(e)
        )

        return jsonify({
            "error": "Failed to update stock",
            "message": str(e)
        }), 500