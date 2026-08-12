from flask import Blueprint, request, jsonify
from app import db
from app.models.models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        # Extract fields sent by your frontend form
        full_name = data.get('fullName') or data.get('full_name') or data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        location = data.get('location')
        role = data.get('role', 'buyer') # default role
        
        if not email or not password or not full_name:
            return jsonify({"error": "Full name, email, and password are required"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 400

        # Create new user instance (note: your User model uses 'name' field)
        new_user = User(
            name=full_name,
            email=email,
            role=role,
            phone=phone,
            location=location
        )
        
        # Hash and set the password
        new_user.set_password(password)

        # Save to database
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User registered successfully",
            "user": new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print("REGISTRATION ERROR:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Find user in the database by email
    user = User.query.filter_by(email=email).first()

    # Verify user exists and the password matches
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": user.to_dict()
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

    return jsonify(user.to_dict()), 200