import os
from flask import Flask, send_from_directory, jsonify, make_response
from config import Config
from extensions import db, jwt, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Ensure uploads directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS
    try:
        from flask_cors import CORS
        CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    except ImportError:
        pass

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization,X-Requested-With"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        return response

    # Blueprint imports
    from routes.auth_routes import auth_bp
    from routes.property_routes import property_bp
    from routes.buyer_request_routes import buyer_request_bp
    from routes.matching_routes import matching_bp
    from routes.stats_routes import stats_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(property_bp)
    app.register_blueprint(buyer_request_bp)
    app.register_blueprint(matching_bp)
    app.register_blueprint(stats_bp)

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "khaneh-backend"}

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # Automatically create tables if needed (safe with create_all).
    # Retries, because in Docker the DB may still be starting up.
    import time
    with app.app_context():
        for attempt in range(10):
            try:
                db.create_all()
                break
            except Exception as e:
                app.logger.warning(f"db.create_all() attempt {attempt + 1} failed: {e}")
                time.sleep(2)

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
