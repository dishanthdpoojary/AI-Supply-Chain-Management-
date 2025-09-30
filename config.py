# AI-Driven Supply Chain Management Configuration
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Database Configuration (Optional - system works with CSV files by default)
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    DB_NAME = os.environ.get('DB_NAME', 'supply_chain_ai')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    
    # API Configuration
    API_HOST = os.environ.get('API_HOST', '0.0.0.0')
    API_PORT = int(os.environ.get('API_PORT', 5000))
    
    # File Paths
    DATA_DIR = os.environ.get('DATA_DIR', './data')
    LOG_DIR = os.environ.get('LOG_DIR', './logs')
    UPLOAD_DIR = os.environ.get('UPLOAD_DIR', './uploads')
    
    # Create directories if they don't exist
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        for directory in [Config.DATA_DIR, Config.LOG_DIR, Config.UPLOAD_DIR]:
            os.makedirs(directory, exist_ok=True)

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

