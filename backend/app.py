from flask import Flask
from config import Config
from extensions import db, jwt, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    from routes.auth_routes import auth_bp
    from routes.property_routes import property_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(property_bp)

    @app.get("/health")
    def health():
        return {"status": "ok", "service": "khaneh-backend"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
