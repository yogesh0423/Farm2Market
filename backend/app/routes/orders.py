from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Order, Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity

order_bp = Blueprint('order', __name__, url_prefix='/api/v1/orders')

@order_bp.route('', methods=['POST'], strict_slashes=False)
@order_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_order():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role != 'buyer':
            return jsonify({"error": "Only buyers can place orders"}), 403

        data = request.get_json() or {}
        print("DEBUG ORDER DATA RECEIVED:", data)

        # Accept multiple naming conventions from the frontend modal
        product_id = data.get('product_id') or data.get('productId') or data.get('id')
        quantity = data.get('quantity') or data.get('qty') or 1.0

        if not product_id:
            return jsonify({"error": "Product ID and quantity are required"}), 400

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        qty_float = float(quantity)
        if product.available_quantity < qty_float:
            return jsonify({"error": "Insufficient stock available"}), 400

        total_price = qty_float * (product.price_per_unit or 0.0)

        # Deduct stock
        product.available_quantity -= qty_float

        new_order = Order(
            buyer_id=user.id,
            product_id=product.id,
            quantity=qty_float,
            total_price=total_price,
            status='Pending'
        )

        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            "message": "Order placed successfully",
            "order": new_order.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("ORDER ERROR:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@order_bp.route('', methods=['GET'], strict_slashes=False)
@order_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_orders():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user.role == 'farmer':
            farmer_products = Product.query.filter_by(farmer_id=user.id).all()
            product_ids = [p.id for p in farmer_products]
            orders = Order.query.filter(Order.product_id.in_(product_ids)).all()
        else:
            orders = Order.query.filter_by(buyer_id=user.id).all()

        return jsonify([order.to_dict() for order in orders]), 200

    except Exception as e:
        print("GET ORDERS ERROR:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500