from flask import Blueprint, request, jsonify
from app import db
from app.models.models import Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity

product_bp = Blueprint('product', __name__, url_prefix='/api/v1/products')

@product_bp.route('', methods=['POST'], strict_slashes=False)
@product_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def add_product():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Optional: ensure user is a farmer
        if not user or user.role != 'farmer':
            return jsonify({"error": "Only farmers can add products"}), 403

        data = request.get_json()
        print("DEBUG RECEIVED PRODUCT DATA:", data)
        
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Catch variations of keys sent from frontend forms (e.g. price vs price_per_unit)
        title = data.get('title') or data.get('name')
        category = data.get('category')
        price_per_unit = data.get('price_per_unit') or data.get('price')
        unit = data.get('unit', 'kg')
        available_quantity = data.get('available_quantity') or data.get('quantity')
        description = data.get('description')
        image_url = data.get('image_url')

        if not title or not category or price_per_unit is None or available_quantity is None:
            return jsonify({"error": "Title, category, price, and quantity are required"}), 400

        new_product = Product(
            farmer_id=user.id,
            title=title,
            category=category,
            price_per_unit=float(price_per_unit),
            unit=unit,
            available_quantity=float(available_quantity),
            description=description,
            image_url=image_url
        )

        db.session.add(new_product)
        db.session.commit()

        return jsonify({
            "message": "Product added successfully",
            "product": new_product.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("ADD PRODUCT ERROR:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@product_bp.route('', methods=['GET'], strict_slashes=False)
@product_bp.route('/', methods=['GET'], strict_slashes=False)
def get_all_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200