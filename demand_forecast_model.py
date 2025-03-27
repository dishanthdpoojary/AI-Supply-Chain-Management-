from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from scipy.stats import norm
from sklearn.metrics import mean_absolute_error, mean_squared_error

app = Flask(__name__)
CORS(app)

# Load dataset
file_path = "D:\Canara Hackathon\Furniture_Trends_India_2000_2024.csv"
df = pd.read_csv(file_path)

# Preprocessing
df = df.dropna()
df['Furniture Category'] = df['Furniture Category'].str.strip().str.lower()
df['Year'] = df['Year'].astype(int)

def optimized_forecast(series, forecast_steps=5):
    """Optimized Exponential Smoothing forecast."""
    if len(series) < 3:
        return np.array([series.mean()] * forecast_steps)
    
    model = ExponentialSmoothing(series, trend='add', seasonal='add', seasonal_periods=3, initialization_method='estimated')
    fit = model.fit()
    forecast = fit.forecast(forecast_steps)
    return forecast.clip(lower=0)

@app.route('/forecast', methods=['GET'])
def get_forecast():
    category = request.args.get('category', '').strip().lower()
    if not category:
        return jsonify({'error': 'category parameter is required'}), 400
    
    category_data = df[df['Furniture Category'] == category]
    if category_data.empty:
        return jsonify({'error': 'Category not found'}), 404
    
    demand_series = category_data.sort_values('Year')['Market Demand (Millions)']
    train_size = max(3, int(len(demand_series) * 0.8))
    train, test = demand_series[:train_size], demand_series[train_size:]
    
    forecast = optimized_forecast(train, len(test))
    
    # Calculate accuracy metrics
    mae = mean_absolute_error(test, forecast)
    mse = mean_squared_error(test, forecast)
    rmse = np.sqrt(mse)
    
    return jsonify({
        'category': category,
        'forecast': forecast.tolist(),
        'accuracy_metrics': {
            'MAE': mae,
            'MSE': mse,
            'RMSE': rmse
        },
        'model_used': 'Exponential Smoothing'
    })

@app.route('/inventory_recommendation', methods=['GET'])
def inventory_recommendation():
    category = request.args.get('category', '').strip().lower()
    storage_capacity = float(request.args.get('storage_capacity', 1000))
    service_level = float(request.args.get('service_level', 0.95))
    
    forecast_response = get_forecast()
    if forecast_response.status_code != 200:
        return forecast_response
    
    data = forecast_response.get_json()
    forecast = data['forecast']
    lead_time_demand = sum(forecast[:2])
    demand_std = np.std(forecast[:2])
    
    z_score = norm.ppf(service_level)
    safety_stock = max(z_score * demand_std, 1)
    reorder_point = min(lead_time_demand + safety_stock, storage_capacity)
    
    return jsonify({
        **data,
        'inventory_recommendations': {
            'safety_stock': round(float(safety_stock), 2),
            'reorder_point': round(float(reorder_point), 2),
            'storage_capacity': storage_capacity
        }
    })

if __name__ == '__main__':
    app.run(debug=True)
