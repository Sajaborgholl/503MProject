from flask import Flask
from flask_session import Session  # Optional, if using server-side sessions
from app.controllers.auth_controller import auth_bp
from app.controllers.product_controller import product_bp
from app.controllers.order_controller import order_bp
from app.controllers.admin_controller import admin_bp
from app.controllers.inventory_controller import inventory_bp
from werkzeug.security import check_password_hash
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
db = SQLAlchemy()
def create_app():
    # Initialize the Flask app
    app = Flask(__name__)
    app.config.from_object('config.Config')

    db.init_app(app)
    migrate = Migrate(app, db)
    # Load configuration settings
    # Ensure 'config.py' has a 'Config' class
    
    # Initialize session management if using sessions
    Session(app)
    jwt = JWTManager(app)
    # Register blueprints
    # Routes for authentication
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    # Routes for product management
    app.register_blueprint(product_bp, url_prefix='/product')
    # Routes for order management
    app.register_blueprint(order_bp, url_prefix='/orders')
    app.register_blueprint(inventory_bp, url_prefix='/inventory')

    return app
