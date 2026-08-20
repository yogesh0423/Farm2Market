from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from app.config import Config


# ============================================================
# EXTENSIONS
# ============================================================

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


# ============================================================
# CREATE APPLICATION
# ============================================================

def create_app():

    app = Flask(__name__)

    # ========================================================
    # CONFIGURATION
    # ========================================================

    app.config.from_object(Config)

    # ========================================================
    # DATABASE
    # ========================================================

    db.init_app(app)
    migrate.init_app(app, db)

    # ========================================================
    # JWT
    # ========================================================

    jwt.init_app(app)

    # ========================================================
    # CORS
    # ========================================================
    # Frontend is running locally on Vite.
    # No ngrok is required for local development.

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173"
                ]
            }
        },
        allow_headers=[
            "Content-Type",
            "Authorization"
        ],
        methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        supports_credentials=True
    )

    # ========================================================
    # HOME / HEALTH CHECK
    # ========================================================

    @app.route("/")
    def index():

        return {
            "message": "Farm2Market API is running successfully!"
        }

    # ========================================================
    # IMPORT BLUEPRINTS
    # ========================================================

    from app.routes.auth import auth_bp
    from app.routes.product import product_bp
    from app.routes.orders import order_bp

    # ========================================================
    # REGISTER AUTH
    # ========================================================

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/v1"
    )

    # ========================================================
    # REGISTER PRODUCTS
    # ========================================================

    app.register_blueprint(
        product_bp,
        url_prefix="/api/v1"
    )

    # ========================================================
    # REGISTER ORDERS
    # ========================================================

    app.register_blueprint(
        order_bp,
        url_prefix="/api/v1"
    )

    # ========================================================
    # PRINT REGISTERED ROUTES
    # ========================================================

    print("\n")
    print("=" * 70)
    print("              FARM2MARKET REGISTERED ROUTES")
    print("=" * 70)

    for rule in app.url_map.iter_rules():

        methods = sorted(
            method
            for method in rule.methods
            if method not in {"HEAD", "OPTIONS"}
        )

        print(
            f"{str(rule):50} "
            f"{str(methods):25} "
            f"{rule.endpoint}"
        )

    print("=" * 70)
    print("\n")

    return app