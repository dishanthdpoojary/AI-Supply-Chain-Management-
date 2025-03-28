# Mangalore Supply Chain Route Optimizer

This application optimizes supply chain routes within Mangalore, Karnataka, India, using OpenStreetMap data. It calculates and displays multiple route options between locations with traffic analysis, without requiring external API keys.

## Features

- Interactive map of Mangalore with key locations marked
- Search for specific locations within Mangalore
- Add multiple waypoints for complex routes
- View three route options:
  - Fastest route (optimized for time)
  - Shortest route (optimized for distance)
  - Alternative route (using different roads)
- Traffic impact analysis
- Turn-by-turn directions for each route
- Visualization of routes on the map

## Technology Stack

- Frontend:
  - HTML, CSS, JavaScript
  - Leaflet.js for map visualization
- Backend:
  - Python with Flask
  - Custom routing algorithms

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js and npm (or Bun)

### Setup

1. Clone this repository:
   ```
   git clone <repository-url>
   cd mangalore-route-optimizer
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```
   bun install
   ```

## Running the Application

1. Start the Python/Flask backend:
   ```
   python app.py
   ```

2. Open a web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Usage Instructions

1. Enter source location in the first search box
2. Enter destination location in the second search box
3. (Optional) Add waypoints by clicking the "Add Waypoint" button
4. Click "Find Optimal Route"
5. View different route options using the tabs
6. Examine route details, including distance, duration, and traffic impact
7. Follow turn-by-turn directions for your selected route

## Notes

- The application works without internet connectivity after initial setup
- All location data is specific to Mangalore
- Traffic data is simulated but follows realistic patterns for Mangalore roads

## License

MIT

## Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for map visualization library
