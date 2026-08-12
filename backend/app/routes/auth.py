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
@auth_bp.route('/login', methods=['POST'])
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Check if data was provided
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Find user in the database by email
    user = User.query.filter_by(email=email).first()

    # Verify user exists and the password matches
    # (Note: make sure your User model has a check_password method using Werkzeug security)
    if user and user.check_password(password):
        # Create JWT access token (converting user.id to string to ensure compatibility)
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": getattr(user, 'role', 'user')
            }
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401
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