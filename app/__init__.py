from flask import Flask
from flask_session import Session  # Optional, if using server-side sessions
from app.controllers.auth_controller import auth_bp
from app.controllers.product_controller import product_bp
from app.controllers.order_controller import order_bp
from app.controllers.admin_controller import admin_bp
from app.controllers.inventory_controller import inventory_bp
from app.controllers.promotion_controller import promotion_bp
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()  # To handle database migrations

def create_app():
    # Initialize the Flask app
    app = Flask(__name__)
    
    # Load configuration settings from 'config.py'
    app.config.from_object('config.Config')

    # Initialize CORS to allow cross-origin requests
    CORS(app)  # This will allow all origins by default

    # Initialize database with Flask app
    db.init_app(app)
    
    # Initialize migration for handling database migrations
    migrate.init_app(app, db)

    # Initialize session management if using server-side sessions
    Session(app)
    

    # Initialize JWT for authentication
    jwt = JWTManager(app)

    # Register blueprints for different modules
    # Routes for authentication
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(promotion_bp, url_prefix='/promotions')
    
    # Routes for product management
    app.register_blueprint(product_bp, url_prefix='/product')
    
    # Routes for order management
    app.register_blueprint(order_bp, url_prefix='/orders')
    
    # Routes for inventory management
    app.register_blueprint(inventory_bp, url_prefix='/inventory')

    return app
