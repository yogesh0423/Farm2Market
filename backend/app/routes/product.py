from flask import Blueprint, request, jsonify, make_response
from app import db
from app.models.models import Product, User
from flask_jwt_extended import jwt_required, get_jwt_identity

# Notice: url_prefix here is empty so it relies cleanly on app.py's /api/v1 prefix
product_bp = Blueprint('product', __name__, url_prefix='/products')

@product_bp.route('', methods=['POST', 'OPTIONS'], strict_slashes=False)
@product_bp.route('/', methods=['POST', 'OPTIONS'], strict_slashes=False)
@jwt_required(optional=True)
def add_product():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

    try:
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({"error": "Unauthorized"}), 401

        user = User.query.get(current_user_id)
        if not user or user.role != 'farmer':
            return jsonify({"error": "Only farmers can add products"}), 403

        data = request.get_json() or {}
        print("DEBUG RECEIVED PRODUCT DATA:", data)

        title = data.get('title') or data.get('name') or data.get('crop_title') or "Crop"
        category = data.get('category') or "General"
        
        price_per_unit = data.get('price_per_unit') or data.get('price') or data.get('cost') or 0.0
        available_quantity = data.get('available_quantity') or data.get('quantity') or data.get('qty') or 1.0
        
        unit = data.get('unit', 'kg')
        description = data.get('description') or data.get('location')
        image_url = data.get('image_url')

        new_product = Product(
            farmer_id=user.id,
            title=str(title),
            category=str(category),
            price_per_unit=float(price_per_unit),
            unit=str(unit),
            available_quantity=float(available_quantity),
            description=str(description) if description else None,
            image_url=str(image_url) if image_url else None
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

@product_bp.route('', methods=['GET', 'OPTIONS'], strict_slashes=False)
@product_bp.route('/', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_all_products():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200