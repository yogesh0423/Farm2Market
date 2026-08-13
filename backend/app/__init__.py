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
    CORS(app, resources={r"/api/v1/*": {"origins": "*"}})

    @app.route('/')
    def index():
        return {"message": "Farm2Market API is running successfully!"}

    from app.routes.auth import auth_bp
    from app.routes.product import product_bp
    from app.routes.orders import order_bp  # <-- Added order blueprint import
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)  
    app.register_blueprint(order_bp)      # <-- Added order blueprint registration
 
    return app