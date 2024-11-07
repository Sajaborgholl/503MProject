import os


class Config:
    # Secret key for Flask session security
    SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)

    # Session configuration
    SESSION_TYPE = 'filesystem'                # Storing sessions on the file system
    SESSION_PERMANENT = False                  # Sessions are not permanent by default
    # Adds extra security by signing session cookies
    SESSION_USE_SIGNER = True

    # Database configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///yourdatabase.db'  # SQLite database URI
    # Disable event notifications to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT configuration for authentication
    # Secret key for JWT encoding
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your_jwt_secret_key'

    # Debug mode (set to False in production)
    DEBUG = True  # Change to False in production
