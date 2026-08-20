from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Order, Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity


# ============================================================
# ORDER BLUEPRINT
# ============================================================

order_bp = Blueprint(
    "order",
    __name__
)


# ============================================================
# HELPER
# ============================================================

def order_response(order):
    """
    Always build a fresh, explicit order response.

    This makes sure the frontend receives the current
    PostgreSQL status.
    """

    return {
        "id": order.id,

        "buyer_id": order.buyer_id,

        "buyer_name": (
            order.buyer_user.name
            if order.buyer_user
            else None
        ),

        "product_id": order.product_id,

        "product_title": (
            order.product.title
            if order.product
            else None
        ),

        "quantity": order.quantity,

        "total_price": order.total_price,

        # IMPORTANT
        "status": order.status,

        # Extra compatibility fields
        "order_status": order.status,
        "current_status": order.status,

        "created_at": (
            order.created_at.isoformat()
            if order.created_at
            else None
        )
    }


# ============================================================
# CREATE ORDER
#
# POST /api/v1/orders
# ============================================================

@order_bp.route(
    "/orders",
    methods=["POST"],
    strict_slashes=False
)
@jwt_required()
def create_order():

    try:

        # ----------------------------------------------------
        # CURRENT USER
        # ----------------------------------------------------

        current_user_id = get_jwt_identity()

        user = User.query.get(
            int(current_user_id)
        )

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # Only buyers can create orders
        if user.role != "buyer":
            return jsonify({
                "error": "Only buyers can place orders"
            }), 403

        # ----------------------------------------------------
        # REQUEST DATA
        # ----------------------------------------------------

        data = request.get_json(
            silent=True
        ) or {}

        print("\n" + "=" * 60)
        print("CREATE ORDER")
        print("USER ID:", user.id)
        print("USER EMAIL:", user.email)
        print("USER ROLE:", user.role)
        print("ORDER DATA:", data)
        print("=" * 60)

        # ----------------------------------------------------
        # PRODUCT ID
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

        if product_id is None:
            return jsonify({
                "error": "Product ID is required"
            }), 400

        if quantity is None:
            return jsonify({
                "error": "Quantity is required"
            }), 400

        # ----------------------------------------------------
        # CONVERT VALUES
        # ----------------------------------------------------

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
        # CHECK STOCK
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
        # PRICE
        # ----------------------------------------------------

        price_per_unit = float(
            product.price_per_unit or 0
        )

        if price_per_unit < 0:
            return jsonify({
                "error": "Invalid product price"
            }), 400

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
        # DEDUCT STOCK
        # ----------------------------------------------------

        product.available_quantity = (
            available_quantity - quantity
        )

        db.session.add(new_order)

        db.session.commit()

        # Make sure generated values are available
        db.session.refresh(new_order)

        print("\n" + "=" * 60)
        print("ORDER CREATED SUCCESSFULLY")
        print("ORDER ID:", new_order.id)
        print("BUYER ID:", new_order.buyer_id)
        print("PRODUCT ID:", new_order.product_id)
        print("STATUS:", new_order.status)
        print("QUANTITY:", new_order.quantity)
        print("TOTAL:", new_order.total_price)
        print(
            "REMAINING STOCK:",
            product.available_quantity
        )
        print("=" * 60)

        return jsonify({
            "message": "Order placed successfully",
            "order": order_response(new_order),
            "product": product.to_dict(),
            "total_price": total_price
        }), 201

    except Exception as e:

        db.session.rollback()

        print("\n" + "=" * 60)
        print("CREATE ORDER ERROR")
        print(str(e))
        print("=" * 60)

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# ============================================================
# GET ALL ORDERS FOR CURRENT USER
#
# GET /api/v1/orders
#
# BUYER:
#     Buyer's orders
#
# FARMER:
#     Orders for farmer's products
# ============================================================

@order_bp.route(
    "/orders",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_orders():

    try:

        current_user_id = get_jwt_identity()

        user = User.query.get(
            int(current_user_id)
        )

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # ====================================================
        # FARMER
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
        # BUYER
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
        # FORCE CURRENT DATABASE VALUES
        # ----------------------------------------------------

        response_orders = [
            order_response(order)
            for order in orders
        ]

        return jsonify(response_orders), 200

    except Exception as e:

        print("\n" + "=" * 60)
        print("GET ORDERS ERROR")
        print(str(e))
        print("=" * 60)

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# ============================================================
# BUYER MY ORDERS
#
# GET /api/v1/orders/my-orders
# ============================================================

@order_bp.route(
    "/orders/my-orders",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_my_orders():

    try:

        # ----------------------------------------------------
        # CURRENT USER
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
        # ONLY BUYERS
        # ----------------------------------------------------

        if user.role != "buyer":
            return jsonify({
                "error": "Only buyers can access their orders"
            }), 403

        # ----------------------------------------------------
        # GET ORDERS DIRECTLY FROM DATABASE
        # ----------------------------------------------------

        orders = (
            Order.query
            .filter(
                Order.buyer_id == user.id
            )
            .order_by(
                Order.created_at.desc()
            )
            .all()
        )

        # ----------------------------------------------------
        # EXPLICIT RESPONSE
        # ----------------------------------------------------

        response_orders = []

        for order in orders:

            # Refresh object from database
            db.session.refresh(order)

            item = order_response(order)

            print(
                "BUYER ORDER:",
                "ID =", order.id,
                "| STATUS =", order.status,
                "| BUYER =", order.buyer_id
            )

            response_orders.append(item)

        print("\n" + "=" * 60)
        print("BUYER MY ORDERS")
        print("BUYER ID:", user.id)
        print("TOTAL ORDERS:", len(response_orders))

        for item in response_orders:
            print(
                "ORDER",
                item["id"],
                "STATUS:",
                item["status"]
            )

        print("=" * 60)

        return jsonify({
            "orders": response_orders
        }), 200

    except Exception as e:

        print("\n" + "=" * 60)
        print("GET MY ORDERS ERROR")
        print(str(e))
        print("=" * 60)

        return jsonify({
            "error": "Failed to fetch buyer orders",
            "details": str(e)
        }), 500


# ============================================================
# FARMER ORDERS
#
# GET /api/v1/farmer/orders
# ============================================================

@order_bp.route(
    "/farmer/orders",
    methods=["GET"],
    strict_slashes=False
)
@jwt_required()
def get_farmer_orders():

    try:

        current_user_id = get_jwt_identity()

        user = User.query.get(
            int(current_user_id)
        )

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        if user.role != "farmer":
            return jsonify({
                "error": "Only farmers can access farmer orders"
            }), 403

        # ----------------------------------------------------
        # FARMER PRODUCTS
        # ----------------------------------------------------

        farmer_products = Product.query.filter_by(
            farmer_id=user.id
        ).all()

        product_ids = [
            product.id
            for product in farmer_products
        ]

        if not product_ids:
            return jsonify([]), 200

        # ----------------------------------------------------
        # FARMER ORDERS
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

        response_orders = [
            order_response(order)
            for order in orders
        ]

        return jsonify(response_orders), 200

    except Exception as e:

        print("\n" + "=" * 60)
        print("FARMER ORDERS ERROR")
        print(str(e))
        print("=" * 60)

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500


# ============================================================
# UPDATE ORDER STATUS
#
# PUT /api/v1/orders/<order_id>/status
# ============================================================

@order_bp.route(
    "/orders/<int:order_id>/status",
    methods=["PUT"],
    strict_slashes=False
)
@jwt_required()
def update_order_status(order_id):

    try:

        # ----------------------------------------------------
        # CURRENT USER
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
        # ONLY FARMERS
        # ----------------------------------------------------

        if user.role != "farmer":
            return jsonify({
                "error": "Only farmers can update order status"
            }), 403

        # ----------------------------------------------------
        # FIND ORDER
        # ----------------------------------------------------

        order = Order.query.get(order_id)

        if not order:
            return jsonify({
                "error": "Order not found"
            }), 404

        # ----------------------------------------------------
        # FIND PRODUCT
        # ----------------------------------------------------

        product = Product.query.get(
            order.product_id
        )

        if not product:
            return jsonify({
                "error": "Product associated with order not found"
            }), 404

        # ----------------------------------------------------
        # VERIFY FARMER OWNS PRODUCT
        # ----------------------------------------------------

        if product.farmer_id != user.id:
            return jsonify({
                "error": "You are not authorized to update this order"
            }), 403

        # ----------------------------------------------------
        # REQUEST DATA
        # ----------------------------------------------------

        data = request.get_json(
            silent=True
        ) or {}

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
        # STATUS MAP
        # ----------------------------------------------------

        status_map = {

            "pending": "Pending",

            "confirmed": "Confirmed",
            "confirm": "Confirmed",
            "accepted": "Confirmed",
            "accept": "Confirmed",

            "processing": "Processing",
            "process": "Processing",

            "shipped": "Shipped",
            "ship": "Shipped",

            "delivered": "Delivered",
            "deliver": "Delivered",

            "completed": "Completed",
            "complete": "Completed",

            "rejected": "Rejected",
            "reject": "Rejected",

            "cancelled": "Cancelled",
            "canceled": "Cancelled",
            "cancel": "Cancelled"
        }

        if status not in status_map:

            return jsonify({
                "error": (
                    "Invalid status. "
                    "Allowed values: "
                    "Pending, Confirmed, Processing, "
                    "Shipped, Delivered, Completed, "
                    "Rejected, Cancelled."
                )
            }), 400

        new_status = status_map[status]

        old_status = order.status

        # ----------------------------------------------------
        # RESTORE STOCK IF CANCELLED / REJECTED
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
        # UPDATE DATABASE
        # ----------------------------------------------------

        order.status = new_status

        db.session.commit()

        # ----------------------------------------------------
        # REFRESH FROM DATABASE
        # ----------------------------------------------------

        db.session.refresh(order)

        # ----------------------------------------------------
        # VERIFY ACTUAL SAVED STATUS
        # ----------------------------------------------------

        print("\n" + "=" * 60)
        print("ORDER STATUS UPDATED")
        print("ORDER ID:", order.id)
        print("FARMER ID:", user.id)
        print("OLD STATUS:", old_status)
        print("NEW STATUS:", order.status)
        print("DATABASE STATUS:", order.status)
        print("=" * 60)

        # ----------------------------------------------------
        # RETURN UPDATED ORDER
        # ----------------------------------------------------

        return jsonify({

            "message": "Order status updated successfully",

            "order": order_response(order),

            "status": order.status,

            "order_status": order.status,

            "current_status": order.status

        }), 200

    except Exception as e:

        db.session.rollback()

        print("\n" + "=" * 60)
        print("UPDATE ORDER STATUS ERROR")
        print(str(e))
        print("=" * 60)

        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500