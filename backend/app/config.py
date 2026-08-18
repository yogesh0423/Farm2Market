import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:

    SECRET_KEY = os.environ.get(
        "SECRET_KEY",
        "dev-secret-key-change-in-prod"
    )

    DATABASE_URL = os.environ.get("DATABASE_URL")

    if DATABASE_URL:
        if DATABASE_URL.startswith("postgres://"):
            DATABASE_URL = DATABASE_URL.replace(
                "postgres://",
                "postgresql://",
                1
            )

        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///farm2market.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY",
        "jwt-secret-key-change-in-prod"
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)