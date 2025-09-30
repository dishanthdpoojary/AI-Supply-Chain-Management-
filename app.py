from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Import backend modules
try:
    from backend.login import signup as login_signup_func, login as login_login_func
    from backend.demand_forecast_model import get_forecast as forecast_func, inventory_recommendation as inventory_func
    BACKEND_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import backend modules: {e}")
    BACKEND_AVAILABLE = False

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')
CORS(app)

# Configure static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Main routes
@app.route('/')
def index():
    """Main landing page"""
    return send_from_directory('frontend', 'landing.html')

@app.route('/login')
def login_page():
    """Login page"""
    return send_from_directory('frontend', 'login.html')

@app.route('/dashboard')
def dashboard():
    """Main dashboard"""
    return send_from_directory('frontend', 'Mdash.html')

@app.route('/demand-forecast')
def demand_forecast():
    """Demand forecasting page"""
    return send_from_directory('frontend', 'newdemad.html')

@app.route('/inventory')
def inventory():
    """Inventory management page"""
    return send_from_directory('frontend', 'inventory.html')

@app.route('/Tindex.html')
def tindex():
    """Tindex page"""
    return send_from_directory('frontend', 'Tindex.html')

# API Routes - Authentication
@app.route('/api/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    if not BACKEND_AVAILABLE:
        return jsonify({"success": False, "message": "Authentication service not available"}), 500
    return login_signup_func()

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    if not BACKEND_AVAILABLE:
        return jsonify({"success": False, "message": "Authentication service not available"}), 500
    return login_login_func()

# API Routes - Demand Forecasting
@app.route('/api/forecast', methods=['GET'])
def forecast():
    """Demand forecasting endpoint"""
    if not BACKEND_AVAILABLE:
        return jsonify({"error": "Forecasting service not available"}), 500
    return forecast_func()

@app.route('/api/inventory-recommendation', methods=['GET'])
def inventory_recommendation():
    """Inventory recommendation endpoint"""
    if not BACKEND_AVAILABLE:
        return jsonify({"error": "Inventory service not available"}), 500
    return inventory_func()

# Route Optimization (if available)
@app.route('/route-optimizer')
def route_optimizer():
    """Route optimization page"""
    return send_from_directory('hekaton-commit/mangalore-route-optimizerqqqqqqqqq', 'index.html')

@app.route('/route-optimizer/<path:filename>')
def route_optimizer_static(filename):
    """Serve static files for route optimizer"""
    return send_from_directory('hekaton-commit/mangalore-route-optimizerqqqqqqqqq', filename)

@app.route('/src/<path:filename>')
def route_optimizer_src(filename):
    """Serve src files for route optimizer"""
    return send_from_directory('hekaton-commit/mangalore-route-optimizerqqqqqqqqq/src', filename)

@app.route('/furniture-cost-calculator')
def furniture_calculator():
    """Furniture cost calculator page"""
    return send_from_directory('hekaton-commit/furniture-cost-calculator', 'index.html')

@app.route('/furniture-cost-calculator/<path:filename>')
def furniture_calculator_static(filename):
    """Serve static files for furniture cost calculator"""
    return send_from_directory('hekaton-commit/furniture-cost-calculator', filename)

@app.route('/favicon.ico')
def favicon():
    """Serve favicon - return 204 No Content to prevent 404"""
    return '', 204

# Health check endpoint
@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "services": {
            "authentication": "available",
            "demand_forecast": "available",
            "route_optimizer": "available"
        }
    })

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('static', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    os.makedirs('frontend', exist_ok=True)
    os.makedirs('backend', exist_ok=True)
    
    print("🚀 Starting AI-Driven Supply Chain Management System...")
    print("📊 Available Services:")
    print("   - Authentication: http://localhost:5000/login")
    print("   - Dashboard: http://localhost:5000/dashboard")
    print("   - Demand Forecast: http://localhost:5000/demand-forecast")
    print("   - Inventory: http://localhost:5000/inventory")
    print("   - Route Optimizer: http://localhost:5000/route-optimizer")
    print("   - Health Check: http://localhost:5000/health")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
