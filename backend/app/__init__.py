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

    # Load configuration
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
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
    # REGISTER BLUEPRINTS
    # ========================================================

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/v1"
    )

    app.register_blueprint(
        product_bp,
        url_prefix="/api/v1"
    )

    app.register_blueprint(
        order_bp,
        url_prefix="/api/v1"
    )

    # ========================================================
    # PRINT ALL REGISTERED ROUTES
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
            f"{str(rule):45} "
            f"{str(methods):25} "
            f"{rule.endpoint}"
        )

    print("=" * 70)
    print("\n")

    return app