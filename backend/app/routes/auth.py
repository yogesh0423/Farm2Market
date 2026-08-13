from flask import Blueprint, request, jsonify, make_response
from app import db
from app.models.models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# Clear the internal prefix here so it relies purely on app/__init__.py registration
auth_bp = Blueprint('auth', __name__)
@auth_bp.route('/auth/register', methods=['POST', 'OPTIONS'], strict_slashes=False)
def register():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        full_name = data.get('fullName') or data.get('full_name') or data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        location = data.get('location')
        role = data.get('role', 'buyer')
        
        if not email or not password or not full_name:
            return jsonify({"error": "Full name, email, and password are required"}), 400

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 400

        new_user = User(
            name=full_name,
            email=email,
            role=role,
            phone=phone,
            location=location
        )
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User registered successfully",
            "access_token": create_access_token(identity=str(new_user.id)),
            "user": new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("REGISTRATION ERROR:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@auth_bp.route('/auth/login', methods=['POST', 'OPTIONS'], strict_slashes=False)

def login():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    email = data.get('email') or data.get('username')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "token": access_token,
            "user": user.to_dict()
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401