from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Order, Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity


# ============================================================
# ORDER BLUEPRINT
# ============================================================

# IMPORTANT:
# Do NOT put /api/v1 here.
# __init__.py adds /api/v1 when registering this blueprint.

order_bp = Blueprint(
    "order",
    __name__
)


# ============================================================
# CREATE ORDER
# POST /api/v1/orders
# ============================================================

@order_bp.route("/orders", methods=["POST"])
@order_bp.route("/orders/", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_order():

    try:

        # ----------------------------------------------------
        # GET LOGGED-IN USER
        # ----------------------------------------------------

        current_user_id = get_jwt_identity()

        user = User.query.get(int(current_user_id))

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # Only buyers can place orders
        if user.role != "buyer":
            return jsonify({
                "error": "Only buyers can place orders"
            }), 403

        # ----------------------------------------------------
        # GET REQUEST DATA
        # ----------------------------------------------------

        data = request.get_json(silent=True) or {}

        print("\n==========================================")
        print("CREATE ORDER")
        print("USER ID:", user.id)
        print("USER EMAIL:", user.email)
        print("USER ROLE:", user.role)
        print("ORDER DATA:", data)
        print("==========================================\n")

        # ----------------------------------------------------
        # PRODUCT ID
        # Accept multiple frontend names
        # ----------------------------------------------------

        product_id = (
            data.get("product_id")
            or data.get("productId")
            or data.get("productID")
            or data.get("id")
        )

        # ----------------------------------------------------
        # QUANTITY
        # ----------------------------------------------------

        quantity = (
            data.get("quantity_kg")
            or data.get("quantityKg")
            or data.get("quantity")
            or data.get("qty")
        )

        # ----------------------------------------------------
        # VALIDATE PRODUCT ID
        # ----------------------------------------------------

        if product_id is None:
            return jsonify({
                "error": "Product ID is required"
            }), 400

        # ----------------------------------------------------
        # VALIDATE QUANTITY
        # ----------------------------------------------------

        if quantity is None:
            return jsonify({
                "error": "Quantity is required"
            }), 400

        try:

            product_id = int(product_id)
            quantity = float(quantity)

        except (ValueError, TypeError):

            return jsonify({
                "error": "Product ID and quantity must be valid numbers"
            }), 400

        if product_id <= 0:

            return jsonify({
                "error": "Invalid product ID"
            }), 400

        if quantity <= 0:

            return jsonify({
                "error": "Quantity must be greater than 0"
            }), 400

        # ----------------------------------------------------
        # FIND PRODUCT
        # ----------------------------------------------------

        product = Product.query.get(product_id)

        if not product:

            return jsonify({
                "error": "Product not found"
            }), 404

        # ----------------------------------------------------
        # CHECK PRODUCT STOCK
        # ----------------------------------------------------

        available_quantity = float(
            product.available_quantity or 0
        )

        if available_quantity <= 0:

            return jsonify({
                "error": "Product is out of stock",
                "available_quantity": 0
            }), 400

        if quantity > available_quantity:

            return jsonify({
                "error": "Insufficient stock available",
                "available_quantity": available_quantity,
                "requested_quantity": quantity
            }), 400

        # ----------------------------------------------------
        # PRODUCT PRICE
        # ----------------------------------------------------

        price_per_unit = float(
            product.price_per_unit or 0
        )

        if price_per_unit < 0:

            return jsonify({
                "error": "Invalid product price"
            }), 400

        # ----------------------------------------------------
        # CALCULATE TOTAL
        # ----------------------------------------------------

        total_price = quantity * price_per_unit

        # ----------------------------------------------------
        # CREATE ORDER
        # ----------------------------------------------------

        new_order = Order(
            buyer_id=user.id,
            product_id=product.id,
            quantity=quantity,
            total_price=total_price,
            status="Pending"
        )

        # ----------------------------------------------------
        # DEDUCT PRODUCT STOCK
        # ----------------------------------------------------

        product.available_quantity = (
            available_quantity - quantity
        )

        # ----------------------------------------------------
        # SAVE
        # ----------------------------------------------------

        db.session.add(new_order)

        db.session.commit()

        print("\n==========================================")
        print("ORDER CREATED SUCCESSFULLY")
        print("ORDER ID:", new_order.id)
        print("BUYER ID:", user.id)
        print("PRODUCT ID:", product.id)
        print("QUANTITY:", quantity)
        print("TOTAL:", total_price)
        print("REMAINING STOCK:", product.available_quantity)
        print("==========================================\n")

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify({

            "message": "Order placed successfully",

            "order": new_order.to_dict(),

            # Extra useful frontend information
            "product": product.to_dict(),

            "total_price": total_price

        }), 201

    except Exception as e:

        db.session.rollback()

        print("\n==========================================")
        print("CREATE ORDER ERROR")
        print(str(e))
        print("==========================================\n")

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# ============================================================
# GET ORDERS
#
# BUYER:
# GET /api/v1/orders
#
# FARMER:
# GET /api/v1/orders
#
# ============================================================

@order_bp.route("/orders", methods=["GET"])
@order_bp.route("/orders/", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_orders():

    try:

        current_user_id = get_jwt_identity()

        user = User.query.get(int(current_user_id))

        if not user:

            return jsonify({
                "error": "User not found"
            }), 404

        # ====================================================
        # FARMER ORDERS
        # ====================================================

        if user.role == "farmer":

            farmer_products = Product.query.filter_by(
                farmer_id=user.id
            ).all()

            product_ids = [
                product.id
                for product in farmer_products
            ]

            if not product_ids:

                return jsonify([]), 200

            orders = (
                Order.query
                .filter(
                    Order.product_id.in_(product_ids)
                )
                .order_by(
                    Order.created_at.desc()
                )
                .all()
            )

        # ====================================================
        # BUYER ORDERS
        # ====================================================

        else:

            orders = (
                Order.query
                .filter_by(
                    buyer_id=user.id
                )
                .order_by(
                    Order.created_at.desc()
                )
                .all()
            )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify([
            order.to_dict()
            for order in orders
        ]), 200

    except Exception as e:

        print("\n==========================================")
        print("GET ORDERS ERROR")
        print(str(e))
        print("==========================================\n")

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# ============================================================
# FARMER ORDERS
#
# GET /api/v1/farmer/orders
#
# ============================================================

@order_bp.route("/farmer/orders", methods=["GET"])
@jwt_required()
def get_farmer_orders():

    try:

        current_user_id = get_jwt_identity()

        user = User.query.get(int(current_user_id))

        if not user:

            return jsonify({
                "error": "User not found"
            }), 404

        # Only farmers
        if user.role != "farmer":

            return jsonify({
                "error": "Only farmers can access farmer orders"
            }), 403

        # ----------------------------------------------------
        # GET FARMER PRODUCTS
        # ----------------------------------------------------

        farmer_products = Product.query.filter_by(
            farmer_id=user.id
        ).all()

        product_ids = [
            product.id
            for product in farmer_products
        ]

        # Farmer has no products
        if not product_ids:

            return jsonify([]), 200

        # ----------------------------------------------------
        # GET ORDERS FOR FARMER PRODUCTS
        # ----------------------------------------------------

        orders = (
            Order.query
            .filter(
                Order.product_id.in_(product_ids)
            )
            .order_by(
                Order.created_at.desc()
            )
            .all()
        )

        return jsonify([
            order.to_dict()
            for order in orders
        ]), 200

    except Exception as e:

        print("\n==========================================")
        print("FARMER ORDERS ERROR")
        print(str(e))
        print("==========================================\n")

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# ============================================================
# UPDATE ORDER STATUS
#
# PUT /api/v1/orders/<order_id>/status
#
# Farmer can:
# Pending
# Confirmed
# Rejected
# Cancelled
# Completed
#
# ============================================================

@order_bp.route(
    "/orders/<int:order_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_order_status(order_id):

    try:

        # ----------------------------------------------------
        # GET CURRENT USER
        # ----------------------------------------------------

        current_user_id = get_jwt_identity()

        user = User.query.get(int(current_user_id))

        if not user:

            return jsonify({
                "error": "User not found"
            }), 404

        # Only farmers
        if user.role != "farmer":

            return jsonify({
                "error": "Only farmers can update order status"
            }), 403

        # ----------------------------------------------------
        # GET ORDER
        # ----------------------------------------------------

        order = Order.query.get(order_id)

        if not order:

            return jsonify({
                "error": "Order not found"
            }), 404

        # ----------------------------------------------------
        # GET PRODUCT
        # ----------------------------------------------------

        product = Product.query.get(
            order.product_id
        )

        if not product:

            return jsonify({
                "error": "Product associated with order not found"
            }), 404

        # ----------------------------------------------------
        # CHECK FARMER OWNERSHIP
        # ----------------------------------------------------

        if product.farmer_id != user.id:

            return jsonify({
                "error": "You are not authorized to update this order"
            }), 403

        # ----------------------------------------------------
        # REQUEST DATA
        # ----------------------------------------------------

        data = request.get_json(silent=True) or {}

        status = (
            data.get("status")
            or data.get("order_status")
            or data.get("orderStatus")
        )

        if not status:

            return jsonify({
                "error": "Status is required"
            }), 400

        status = str(
            status
        ).strip().lower()

        # ----------------------------------------------------
        # ACCEPT DIFFERENT FRONTEND VALUES
        # ----------------------------------------------------

        status_map = {

            "pending": "Pending",

            "confirmed": "Confirmed",

            "confirm": "Confirmed",

            "accepted": "Confirmed",

            "accept": "Confirmed",

            "rejected": "Rejected",

            "reject": "Rejected",

            "cancelled": "Cancelled",

            "canceled": "Cancelled",

            "cancel": "Cancelled",

            "completed": "Completed",

            "complete": "Completed"
        }

        if status not in status_map:

            return jsonify({
                "error": (
                    "Invalid status. "
                    "Allowed values: "
                    "Pending, Confirmed, "
                    "Rejected, Cancelled, Completed."
                )
            }), 400

        new_status = status_map[status]

        old_status = order.status

        # ----------------------------------------------------
        # RESTORE STOCK
        #
        # If Pending order is rejected/cancelled,
        # return its quantity to product stock.
        # ----------------------------------------------------

        if (
            old_status == "Pending"
            and new_status in [
                "Rejected",
                "Cancelled"
            ]
        ):

            product.available_quantity = (
                float(product.available_quantity or 0)
                + float(order.quantity or 0)
            )

        # ----------------------------------------------------
        # UPDATE STATUS
        # ----------------------------------------------------

        order.status = new_status

        db.session.commit()

        print("\n==========================================")
        print("ORDER STATUS UPDATED")
        print("ORDER ID:", order.id)
        print("FARMER ID:", user.id)
        print("OLD STATUS:", old_status)
        print("NEW STATUS:", new_status)
        print("==========================================\n")

        return jsonify({

            "message": "Order status updated successfully",

            "order": order.to_dict(),

            "status": new_status

        }), 200

    except Exception as e:

        db.session.rollback()

        print("\n==========================================")
        print("UPDATE ORDER STATUS ERROR")
        print(str(e))
        print("==========================================\n")

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500