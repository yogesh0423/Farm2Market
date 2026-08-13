
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Enable global CORS support for all routes and preflight requests
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

    @app.route('/')
    def index():
        return {"message": "Farm2Market API is running successfully!"}

    from app.routes.auth import auth_bp
    from app.routes.product import product_bp
    from app.routes.orders import order_bp  

    # Register blueprints under the /api/v1 prefix
    app.register_blueprint(auth_bp, url_prefix='/api/v1')
    app.register_blueprint(product_bp, url_prefix='/api/v1')  
    app.register_blueprint(order_bp, url_prefix='/api/v1')      

    # ---> ADD THIS DEBUG LOOP HERE <---
    with app.app_context():
        print("\n--- REGISTERED FLASK ROUTES ---")
        for rule in app.url_map.iter_rules():
            print(f"Route: {rule} | Methods: {list(rule.methods)}")
        print("-------------------------------\n")

    return app