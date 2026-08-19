from flask import Flask, request
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

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*"
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
        ]
    )

    # ========================================================
    # FORCE CORS HEADERS ON EVERY API RESPONSE
    # ========================================================

    @app.after_request
    def add_cors_headers(response):

        if request.path.startswith("/api/"):

            response.headers["Access-Control-Allow-Origin"] = "*"

            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, Authorization"
            )

            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            )

        return response

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

    # IMPORTANT:
    # orders.py should NOT have another /api/v1 prefix
    # if we register it here with /api/v1.

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