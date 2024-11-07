from flask import Flask
from flask_session import Session  # Optional, if using server-side sessions
from app.controllers.auth_controller import auth_bp
from app.controllers.product_controller import product_bp
from app.controllers.order_controller import order_bp
from app.controllers.inventory_controller import inventory_bp
from werkzeug.security import check_password_hash
from flask_jwt_extended import JWTManager


def create_app():
    # Initialize the Flask app
    app = Flask(__name__)

    # Load configuration settings
    # Ensure 'config.py' has a 'Config' class
    app.config.from_object('config.Config')

    # Initialize session management if using sessions
    Session(app)
    jwt = JWTManager(app)
    # Register blueprints
    # Routes for authentication
    app.register_blueprint(auth_bp, url_prefix='/auth')
    # Routes for product management
    app.register_blueprint(product_bp, url_prefix='/products')
    # Routes for order management
    app.register_blueprint(order_bp, url_prefix='/orders')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')

    return app
