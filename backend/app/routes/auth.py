from flask import Blueprint, request, jsonify
from app import db
from app.models.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Extract fields sent by your frontend form
    full_name = data.get('fullName') or data.get('full_name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    location = data.get('location')
    role = data.get('role', 'buyer') # default role

    # Check if user already exists...
    # Save user with phone, location, and full_name into your database

    return jsonify({"message": "User registered successfully"}), 201
@auth_bp.route('/login', methods=['POST'])
def login():
    """Log in an existing user and return a JWT token"""
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    # Create JWT access token
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get details of the currently logged-in user"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }), 200