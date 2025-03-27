from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from scipy.spatial import distance

app = Flask(__name__)
CORS(app)

# Load dataset
file_path = "Furniture_Trends_India_2000_2024.csv"
df = pd.read_csv(file_path)

# Simulated Inventory Locations (latitude, longitude)
inventory_locations = {
    "warehouse_1": {"coords": (28.7041, 77.1025), "capacity": 1000},
    "warehouse_2": {"coords": (19.0760, 72.8777), "capacity": 800},
    "warehouse_3": {"coords": (13.0827, 80.2707), "capacity": 1200}
}

# Forecasting Function
def optimized_forecast(series, forecast_steps=5):
    if len(series) < 3:
        return np.array([series.mean()] * forecast_steps)
    model = ExponentialSmoothing(series, trend='add', seasonal='add', seasonal_periods=3, initialization_method='estimated')
    fit = model.fit()
    forecast = fit.forecast(forecast_steps)
    return forecast.clip(lower=0)

# Get Forecast API
@app.route('/forecast', methods=['GET'])
def get_forecast():
    category = request.args.get('category', '').strip().lower()
    if not category:
        return jsonify({'error': 'category parameter is required'}), 400
    
    category_data = df[df['Furniture Category'] == category]
    if category_data.empty:
        return jsonify({'error': 'Category not found'}), 404
    
    demand_series = category_data.sort_values('Year')['Market Demand (Millions)']
    forecast = optimized_forecast(demand_series, 5)
    
    return jsonify({
        'category': category,
        'forecast': forecast.tolist(),
        'model_used': 'Exponential Smoothing'
    })

# Find Nearest Inventory API
@app.route('/nearest_inventory', methods=['GET'])
def nearest_inventory():
    user_lat = float(request.args.get('lat', 0))
    user_lon = float(request.args.get('lon', 0))
    
    min_distance = float('inf')
    best_inventory = None
    
    for inventory, data in inventory_locations.items():
        dist = distance.euclidean((user_lat, user_lon), data['coords'])
        if dist < min_distance:
            min_distance = dist
            best_inventory = inventory
    
    return jsonify({
        'nearest_inventory': best_inventory,
        'location': inventory_locations[best_inventory]['coords'],
        'distance': round(min_distance, 2)
    })

if __name__ == '__main__':
    app.run(debug=True)
