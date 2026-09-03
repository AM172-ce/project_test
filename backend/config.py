import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@db:5432/khaneh"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = 86400

    # Handle upload folder in both docker (/app/uploads) and local environment
    default_upload = "/app/uploads" if os.path.exists("/app") else os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", default_upload)
