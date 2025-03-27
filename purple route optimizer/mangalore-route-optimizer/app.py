from flask import Flask, request, jsonify, send_from_directory
import math
import random
import os
import json
from pathlib import Path

app = Flask(__name__, static_folder='./')

# Mangalore center coordinates
MANGALORE_CENTER = [12.8698, 74.8439]

# Load Mangalore locations from a JSON file or create if doesn't exist
def load_or_create_locations():
    locations_file = Path('mangalore_locations.json')

    if locations_file.exists():
        with open(locations_file, 'r') as f:
            return json.load(f)
    else:
        # Define key locations in Mangalore with coordinates
        locations = [
            {"name": "Mangalore City Center", "coordinates": [12.8698, 74.8439]},
            {"name": "Mangalore International Airport", "coordinates": [12.9615, 74.8900]},
            {"name": "Mangalore Port (New Mangalore Port)", "coordinates": [12.9221, 74.8064]},
            {"name": "Mangalore Junction Railway Station", "coordinates": [12.8709, 74.8553]},
            {"name": "Mangalore Central Railway Station", "coordinates": [12.8378, 74.8380]},
            {"name": "Kadri Park", "coordinates": [12.8901, 74.8553]},
            {"name": "Tannirbhavi Beach", "coordinates": [12.9210, 74.8050]},
            {"name": "MG Road, Mangalore", "coordinates": [12.8744, 74.8433]},
            {"name": "NITK Surathkal", "coordinates": [13.0103, 74.7946]},
            {"name": "Panambur Beach", "coordinates": [12.9456, 74.8003]},
            {"name": "Forum Fiza Mall", "coordinates": [12.8743, 74.8427]},
            {"name": "City Centre Mall", "coordinates": [12.8675, 74.8432]},
            {"name": "Mangaladevi Temple", "coordinates": [12.8492, 74.8399]},
            {"name": "St. Aloysius Chapel", "coordinates": [12.8709, 74.8421]},
            {"name": "Kudroli Gokarnath Temple", "coordinates": [12.8781, 74.8355]},
            {"name": "Ullal Beach", "coordinates": [12.8183, 74.8436]},
            {"name": "Pilikula Nisargadhama", "coordinates": [12.9400, 74.9100]},
            {"name": "Sultan Battery", "coordinates": [12.8542, 74.8336]},
            {"name": "Kadri Manjunath Temple", "coordinates": [12.8912, 74.8553]},
            {"name": "Sasihithlu Beach", "coordinates": [13.0789, 74.7799]},
            {"name": "Mangalore University", "coordinates": [12.8155, 74.9265]},
            {"name": "KMC Hospital, Attavar", "coordinates": [12.8654, 74.8417]},
            {"name": "KS Hegde Hospital", "coordinates": [12.9967, 74.8024]},
            {"name": "Wenlock District Hospital", "coordinates": [12.8610, 74.8419]},
            {"name": "Bantwal", "coordinates": [12.9119, 75.0342]},
            {"name": "Puttur", "coordinates": [12.7598, 75.2031]},
            {"name": "Surathkal", "coordinates": [13.0066, 74.7943]},
            {"name": "Mulki", "coordinates": [13.0918, 74.7934]},
            {"name": "Karkala", "coordinates": [13.2146, 74.9992]},
            {"name": "Industrial Area, Baikampady", "coordinates": [12.9276, 74.8334]}
        ]

        # Save to file for future use
        with open(locations_file, 'w') as f:
            json.dump(locations, f)

        return locations

# Traffic data for Mangalore
def get_traffic_data():
    # Major roads with traffic factors (1.0 = no traffic, 2.0 = heavy traffic)
    return {
        "MG Road": {"factor": random.uniform(1.3, 1.7), "coordinates": [[12.8703, 74.8428], [12.8772, 74.8442]]},
        "KS Rao Road": {"factor": random.uniform(1.4, 1.8), "coordinates": [[12.8674, 74.8432], [12.8620, 74.8458]]},
        "NH-66 (North)": {"factor": random.uniform(1.2, 1.6), "coordinates": [[12.8909, 74.8276], [12.9615, 74.8900]]},
        "NH-66 (South)": {"factor": random.uniform(1.3, 1.7), "coordinates": [[12.8492, 74.8399], [12.8183, 74.8436]]},
        "NH-75": {"factor": random.uniform(1.1, 1.5), "coordinates": [[12.8744, 74.8433], [12.8155, 74.9265]]},
        "Jail Road": {"factor": random.uniform(1.0, 1.4), "coordinates": [[12.8703, 74.8428], [12.8610, 74.8419]]},
        "PVS-Jyothi Circle": {"factor": random.uniform(1.5, 1.9), "coordinates": [[12.8654, 74.8417], [12.8674, 74.8432]]},
        "Bejai-Lalbagh": {"factor": random.uniform(1.3, 1.7), "coordinates": [[12.8781, 74.8355], [12.8901, 74.8553]]},
        "Surathkal Highway": {"factor": random.uniform(1.1, 1.5), "coordinates": [[12.9456, 74.8003], [13.0103, 74.7946]]},
        "Airport Road": {"factor": random.uniform(1.2, 1.6), "coordinates": [[12.8909, 74.8276], [12.9615, 74.8900]]}
    }

# Calculate distance between two points using Haversine formula
def calculate_distance(coord1, coord2):
    lat1, lon1 = coord1
    lat2, lon2 = coord2

    # Earth's radius in kilometers
    R = 6371.0

    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Difference in coordinates
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c

    return distance

# Calculate bearing between two points
def calculate_bearing(coord1, coord2):
    lat1, lon1 = map(math.radians, coord1)
    lat2, lon2 = map(math.radians, coord2)

    dlon = lon2 - lon1

    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)

    bearing = math.degrees(math.atan2(y, x))

    # Normalize to 0-360
    bearing = (bearing + 360) % 360

    return bearing

# Check if a route segment is near a traffic area
def is_segment_near_traffic(seg_start, seg_end, road_start, road_end, tolerance=0.005):
    d1 = calculate_distance(seg_start, road_start)
    d2 = calculate_distance(seg_start, road_end)
    d3 = calculate_distance(seg_end, road_start)
    d4 = calculate_distance(seg_end, road_end)

    return min(d1, d2, d3, d4) < tolerance

# Calculate traffic factor for a route
def get_traffic_factor(route_coordinates, traffic_data):
    max_factor = 1.0

    for i in range(len(route_coordinates) - 1):
        seg_start = route_coordinates[i]
        seg_end = route_coordinates[i + 1]

        for road_name, data in traffic_data.items():
            road_start, road_end = data["coordinates"]

            if is_segment_near_traffic(seg_start, seg_end, road_start, road_end):
                max_factor = max(max_factor, data["factor"])

    return max_factor

# Generate route between points
def generate_route(start_coords, end_coords, waypoints=None, route_type="fastest"):
    if waypoints is None:
        waypoints = []

    all_points = [start_coords] + waypoints + [end_coords]
    route_coordinates = []

    # Traffic data
    traffic_data = get_traffic_data()

    # Generate route based on type
    if route_type == "fastest":
        # A* algorithm simulation
        for i in range(len(all_points) - 1):
            start = all_points[i]
            end = all_points[i + 1]

            # Create a slightly curved path
            mid_lat = (start[0] + end[0]) / 2
            mid_lng = (start[1] + end[1]) / 2
            offset = 0.005 if i % 2 == 0 else -0.005

            route_coordinates.append(start)
            route_coordinates.append([mid_lat + offset, mid_lng])

            if i == len(all_points) - 2:
                route_coordinates.append(end)

        # Calculate speed - fastest route favors faster roads (40 km/h)
        avg_speed = 40

    elif route_type == "shortest":
        # Dijkstra's algorithm simulation for shortest path
        for i in range(len(all_points) - 1):
            start = all_points[i]
            end = all_points[i + 1]

            # Direct path (shortest)
            route_coordinates.append(start)

            if i == len(all_points) - 2:
                route_coordinates.append(end)

        # Slower speed for shortest route (35 km/h)
        avg_speed = 35

    else:  # Alternative route
        # Route that avoids main roads
        for i in range(len(all_points) - 1):
            start = all_points[i]
            end = all_points[i + 1]

            # Create a path with multiple turns to simulate going through smaller roads
            distance_lat = end[0] - start[0]
            distance_lng = end[1] - start[1]

            route_coordinates.append(start)
            route_coordinates.append([start[0] + distance_lat * 0.3, start[1] + distance_lng * 0.1])
            route_coordinates.append([start[0] + distance_lat * 0.5, start[1] + distance_lng * 0.6])
            route_coordinates.append([start[0] + distance_lat * 0.7, start[1] + distance_lng * 0.8])

            if i == len(all_points) - 2:
                route_coordinates.append(end)

        # Slower speed for alternative route (30 km/h)
        avg_speed = 30

    # Calculate distance
    total_distance = 0
    for i in range(len(route_coordinates) - 1):
        total_distance += calculate_distance(route_coordinates[i], route_coordinates[i + 1])

    # Calculate traffic factor
    traffic_factor = get_traffic_factor(route_coordinates, traffic_data)

    # For alternative routes, traffic is less of an issue
    if route_type == "alternative":
        traffic_factor = max(1.0, traffic_factor * 0.8)

    # Calculate duration (in minutes)
    duration = (total_distance / avg_speed) * 60 * traffic_factor

    # Generate directions
    directions = generate_directions(route_coordinates)

    return {
        "coordinates": route_coordinates,
        "distance": total_distance,
        "duration": duration,
        "traffic_factor": traffic_factor,
        "directions": directions
    }

# Generate turn-by-turn directions
def generate_directions(coordinates):
    directions = []
    directions.append("Start from your location.")

    # Load locations to find nearby landmarks
    locations = load_or_create_locations()

    for i in range(1, len(coordinates) - 1):
        prev = coordinates[i-1]
        curr = coordinates[i]
        next_coord = coordinates[i+1]

        # Calculate bearing change to determine turn direction
        initial_bearing = calculate_bearing(prev, curr)
        final_bearing = calculate_bearing(curr, next_coord)
        bearing_diff = (final_bearing - initial_bearing + 360) % 360

        if bearing_diff < 20 or bearing_diff > 340:
            direction = "Continue straight"
        elif bearing_diff < 160:
            direction = "Turn right" if bearing_diff < 80 else "Turn slightly right"
        else:
            direction = "Turn left" if bearing_diff > 280 else "Turn slightly left"

        # Find nearest landmark
        nearest_location = None
        min_distance = float('inf')

        for location in locations:
            distance = calculate_distance(curr, location["coordinates"])
            if distance < min_distance and distance < 0.5:  # Within 500m
                min_distance = distance
                nearest_location = location["name"]

        if nearest_location:
            directions.append(f"{direction} near {nearest_location}.")
        else:
            directions.append(f"{direction} and continue.")

    directions.append("Arrive at your destination.")

    return directions

# Serve the static files
@app.route('/')
def index():
    return send_from_directory('./', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('./', path)

# API endpoint for location search
@app.route('/api/locations/search')
def search_locations():
    query = request.args.get('q', '').lower()
    locations = load_or_create_locations()

    if query:
        filtered_locations = [loc for loc in locations if query in loc["name"].lower()]
        return jsonify(filtered_locations)
    else:
        return jsonify(locations)

# API endpoint for route calculation
@app.route('/api/route', methods=['POST'])
def calculate_route():
    data = request.json

    start_coords = data.get('start')
    end_coords = data.get('end')
    waypoints = data.get('waypoints', [])

    if not start_coords or not end_coords:
        return jsonify({"error": "Start and end coordinates are required"}), 400

    # Calculate routes
    fastest_route = generate_route(start_coords, end_coords, waypoints, "fastest")
    shortest_route = generate_route(start_coords, end_coords, waypoints, "shortest")
    alternative_route = generate_route(start_coords, end_coords, waypoints, "alternative")

    return jsonify({
        "fastest": fastest_route,
        "shortest": shortest_route,
        "alternative": alternative_route
    })

# API endpoint for traffic updates
@app.route('/api/traffic')
def get_traffic():
    return jsonify(get_traffic_data())

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)

    # Make sure locations are loaded
    load_or_create_locations()

    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)
