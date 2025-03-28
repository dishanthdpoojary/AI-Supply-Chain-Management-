// Import modules if needed
// import L from 'leaflet';
// import 'leaflet-routing-machine';

// Mangalore center coordinates
const MANGALORE_CENTER = [12.8698, 74.8439];
const DEFAULT_ZOOM = 13;

// Initialize map
const map = L.map('map').setView(MANGALORE_CENTER, DEFAULT_ZOOM);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Store route layers
const routeLayers = {
    fastest: null,
    shortest: null,
    alternative: null
};

// Common locations in Mangalore with coordinates
const mangaloreLocations = [
    { name: "Mangalore City Center", coordinates: [12.8698, 74.8439] },
    { name: "Mangalore International Airport", coordinates: [12.9615, 74.8900] },
    { name: "Mangalore Port (New Mangalore Port)", coordinates: [12.9221, 74.8064] },
    { name: "Mangalore Junction Railway Station", coordinates: [12.8709, 74.8553] },
    { name: "Mangalore Central Railway Station", coordinates: [12.8378, 74.8380] },
    { name: "Kadri Park", coordinates: [12.8901, 74.8553] },
    { name: "Tannirbhavi Beach", coordinates: [12.9210, 74.8050] },
    { name: "MG Road, Mangalore", coordinates: [12.8744, 74.8433] },
    { name: "NITK Surathkal", coordinates: [13.0103, 74.7946] },
    { name: "Panambur Beach", coordinates: [12.9456, 74.8003] },
    { name: "Forum Fiza Mall", coordinates: [12.8743, 74.8427] },
    { name: "City Centre Mall", coordinates: [12.8675, 74.8432] },
    { name: "Mangaladevi Temple", coordinates: [12.8492, 74.8399] },
    { name: "St. Aloysius Chapel", coordinates: [12.8709, 74.8421] },
    { name: "Kudroli Gokarnath Temple", coordinates: [12.8781, 74.8355] },
    { name: "Ullal Beach", coordinates: [12.8183, 74.8436] },
    { name: "Pilikula Nisargadhama", coordinates: [12.9400, 74.9100] },
    { name: "Sultan Battery", coordinates: [12.8542, 74.8336] },
    { name: "Kadri Manjunath Temple", coordinates: [12.8912, 74.8553] },
    { name: "Sasihithlu Beach", coordinates: [13.0789, 74.7799] },
    { name: "Mangalore University", coordinates: [12.8155, 74.9265] },
    { name: "KMC Hospital, Attavar", coordinates: [12.8654, 74.8417] },
    { name: "KS Hegde Hospital", coordinates: [12.9967, 74.8024] },
    { name: "Wenlock District Hospital", coordinates: [12.8610, 74.8419] },
    { name: "Bantwal", coordinates: [12.9119, 75.0342] },
    { name: "Puttur", coordinates: [12.7598, 75.2031] },
    { name: "Surathkal", coordinates: [13.0066, 74.7943] },
    { name: "Mulki", coordinates: [13.0918, 74.7934] },
    { name: "Karkala", coordinates: [13.2146, 74.9992] },
    { name: "Industrial Area, Baikampady", coordinates: [12.9276, 74.8334] }
];

// Traffic data for Mangalore (simulated)
function getTrafficData() {
    // Generate dynamic traffic data with random factors
    return {
        "MG Road": { factor: (Math.random() * 0.4) + 1.3, coordinates: [[12.8703, 74.8428], [12.8772, 74.8442]] },
        "KS Rao Road": { factor: (Math.random() * 0.4) + 1.4, coordinates: [[12.8674, 74.8432], [12.8620, 74.8458]] },
        "NH-66 (North)": { factor: (Math.random() * 0.4) + 1.2, coordinates: [[12.8909, 74.8276], [12.9615, 74.8900]] },
        "NH-66 (South)": { factor: (Math.random() * 0.4) + 1.3, coordinates: [[12.8492, 74.8399], [12.8183, 74.8436]] },
        "NH-75": { factor: (Math.random() * 0.4) + 1.1, coordinates: [[12.8744, 74.8433], [12.8155, 74.9265]] },
        "Jail Road": { factor: (Math.random() * 0.4) + 1.0, coordinates: [[12.8703, 74.8428], [12.8610, 74.8419]] },
        "PVS-Jyothi Circle": { factor: (Math.random() * 0.4) + 1.5, coordinates: [[12.8654, 74.8417], [12.8674, 74.8432]] },
        "Bejai-Lalbagh": { factor: (Math.random() * 0.4) + 1.3, coordinates: [[12.8781, 74.8355], [12.8901, 74.8553]] },
        "Surathkal Highway": { factor: (Math.random() * 0.4) + 1.1, coordinates: [[12.9456, 74.8003], [13.0103, 74.7946]] },
        "Airport Road": { factor: (Math.random() * 0.4) + 1.2, coordinates: [[12.8909, 74.8276], [12.9615, 74.8900]] }
    };
}

// Get traffic data
const trafficData = getTrafficData();

// DOM Elements
const sourceInput = document.getElementById('source');
const destinationInput = document.getElementById('destination');
const sourceResults = document.getElementById('source-suggestions');
const destResults = document.getElementById('destination-suggestions');
const addWaypointBtn = document.getElementById('add-waypoint');
const waypointsContainer = document.getElementById('waypoints-container');
const findRouteBtn = document.getElementById('find-route');
const tabButtons = document.querySelectorAll('.tab-btn');

// Define custom icons for different location types
const warehouseIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #3498db; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white;">
            <span style="color: white; font-weight: bold; font-size: 14px;">W</span>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const factoryIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #e74c3c; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white;">
            <span style="color: white; font-weight: bold; font-size: 14px;">F</span>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const retailIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #2ecc71; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white;">
            <span style="color: white; font-weight: bold; font-size: 14px;">R</span>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const distributionIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #f39c12; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white;">
            <span style="color: white; font-weight: bold; font-size: 14px;">D</span>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const defaultIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #9b59b6; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 2px solid white;">
            <span style="color: white; font-weight: bold; font-size: 14px;">L</span>
          </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Helper function to select an appropriate icon based on location name
function getIconForLocation(locationName) {
    locationName = locationName.toLowerCase();

    if (locationName.includes('industrial') || locationName.includes('factory') || locationName.includes('port')) {
        return factoryIcon;
    } else if (locationName.includes('mall') || locationName.includes('market') || locationName.includes('shop')) {
        return retailIcon;
    } else if (locationName.includes('warehouse') || locationName.includes('storage') || locationName.includes('depot')) {
        return warehouseIcon;
    } else if (locationName.includes('center') || locationName.includes('junction') || locationName.includes('station')) {
        return distributionIcon;
    } else {
        return defaultIcon;
    }
}

// Add markers for notable places in Mangalore
const markers = new Map();
mangaloreLocations.forEach(location => {
    const customIcon = getIconForLocation(location.name);

    const marker = L.marker(location.coordinates, { icon: customIcon })
        .bindPopup(`<b>${location.name}</b>`)
        .addTo(map);

    markers.set(location.name.toLowerCase(), { marker, coordinates: location.coordinates });
});

// Add traffic indicators to the map
for (const [roadName, data] of Object.entries(trafficData)) {
    const [start, end] = data.coordinates;
    let color;

    // Color based on traffic factor
    if (data.factor < 1.2) color = '#27ae60'; // Green (light traffic)
    else if (data.factor < 1.5) color = '#f39c12'; // Orange (moderate traffic)
    else color = '#c0392b'; // Red (heavy traffic)

    L.polyline([start, end], {
        color: color,
        weight: 5,
        opacity: 0.7
    }).bindPopup(`<b>${roadName}</b><br>Traffic factor: ${data.factor.toFixed(2)}`).addTo(map);
}

// Actual roads and routes in Mangalore
const mangaloreRoads = {
    // Major highway routes
    "NH-66 North": [
        [12.8698, 74.8439], // City Center
        [12.8750, 74.8400], // Near Hampankatta
        [12.8820, 74.8350], // Near Kankanady
        [12.8909, 74.8276], // Junction
        [12.9050, 74.8250], // Urvastores
        [12.9150, 74.8230], // Nanthoor Junction
        [12.9276, 74.8334], // Baikampady Industrial Area
        [12.9456, 74.8003], // Near Panambur Beach
        [13.0066, 74.7943], // Surathkal
        [13.0103, 74.7946]  // NITK Surathkal
    ],
    "NH-66 South": [
        [12.8698, 74.8439], // City Center
        [12.8650, 74.8440], // Near Milagres Church
        [12.8610, 74.8419], // Near Wenlock Hospital
        [12.8550, 74.8410], // Jeppu Market
        [12.8492, 74.8399], // Near Mangaladevi Temple
        [12.8400, 74.8400], // Jeppinamogaru
        [12.8183, 74.8436]  // Ullal Beach
    ],
    "NH-75": [
        [12.8698, 74.8439], // City Center
        [12.8744, 74.8510], // Lalbagh
        [12.8780, 74.8600], // Kuntikan Junction
        [12.8800, 74.8700], // Kavoor Junction
        [12.8850, 74.8800], // Bondel
        [12.8900, 74.8900], // Near Airport Road
        [12.9100, 74.9100], // Vamanjoor
        [12.9200, 74.9200], // BC Road Junction
        [12.8155, 74.9265]  // Towards Mangalore University
    ],
    "MG Road": [
        [12.8720, 74.8410], // Near Collector's Gate
        [12.8744, 74.8433], // MG Road central part
        [12.8772, 74.8442]  // Near Clock Tower
    ],
    "KS Rao Road": [
        [12.8674, 74.8432], // PVS Junction
        [12.8650, 74.8440], // Mid KS Rao Road
        [12.8620, 74.8458]  // Towards Kodialbail
    ],
    "Bunder Road": [
        [12.8698, 74.8439], // City Center
        [12.8710, 74.8421], // Near St. Aloysius Chapel
        [12.8709, 74.8410], // Bunder area
        [12.8715, 74.8390], // Towards Port
        [12.8709, 74.8370]  // End of Bunder Road
    ],
    "Airport Road": [
        [12.8909, 74.8276], // Junction with NH-66
        [12.9000, 74.8400], // Towards Airport
        [12.9100, 74.8500], // Mid Airport Road
        [12.9300, 74.8700], // Near Airport Entrance
        [12.9615, 74.8900]  // Mangalore International Airport
    ],
    "Industrial Corridor": [
        [12.9221, 74.8064], // Mangalore Port (New Mangalore Port)
        [12.9250, 74.8150], // Panambur Industrial Area
        [12.9276, 74.8334] // Baikampady Industrial Area
    ]
};

// Map roads to road segments for detailed routing
const roadSegments = [];
Object.entries(mangaloreRoads).forEach(([roadName, coordinates]) => {
    for (let i = 0; i < coordinates.length - 1; i++) {
        roadSegments.push({
            start: coordinates[i],
            end: coordinates[i + 1],
            road: roadName,
            // Calculate default time in minutes (based on distance and 40km/h speed)
            time: calculateDistance(coordinates[i], coordinates[i + 1]) / 40 * 60
        });
    }
});

// Calculate total route distance
function calculateRouteDistance(coordinates) {
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
    }
    return totalDistance;
}

// Calculate route duration based on distance and speed
function calculateRouteDuration(coordinates, averageSpeed) {
    // Duration in minutes = (distance in km / speed in km/h) * 60
    return (calculateRouteDistance(coordinates) / averageSpeed) * 60;
}

// Find route segments through actual roads
function findRouteThroughRoads(start, end) {
    // Find nearest road point to start and end
    const startRoadPoint = findNearestRoadPoint(start);
    const endRoadPoint = findNearestRoadPoint(end);

    // Return a path through actual road segments
    return findPath(startRoadPoint, endRoadPoint);
}

// Find nearest point on a road
function findNearestRoadPoint(point) {
    let minDistance = Infinity;
    let nearestPoint = null;
    let roadName = null;

    Object.entries(mangaloreRoads).forEach(([name, roadPoints]) => {
        roadPoints.forEach(roadPoint => {
            const distance = calculateDistance(point, roadPoint);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = roadPoint;
                roadName = name;
            }
        });
    });

    return { point: nearestPoint, road: roadName };
}

// Simple path finding through road segments
function findPath(startRoadPoint, endRoadPoint) {
    // This is a simplified version without a proper graph algorithm
    // In a real app, we would use A* or Dijkstra's algorithm on a road graph

    const path = [];

    // Start with the starting road
    const startRoad = mangaloreRoads[startRoadPoint.road];
    const endRoad = mangaloreRoads[endRoadPoint.road];

    const startIndex = startRoad.findIndex(point =>
        point[0] === startRoadPoint.point[0] && point[1] === startRoadPoint.point[1]
    );

    const endIndex = endRoad.findIndex(point =>
        point[0] === endRoadPoint.point[0] && point[1] === endRoadPoint.point[1]
    );

    // If start and end are on the same road
    if (startRoadPoint.road === endRoadPoint.road) {
        // Add all points between start and end on that road
        const min = Math.min(startIndex, endIndex);
        const max = Math.max(startIndex, endIndex);

        for (let i = min; i <= max; i++) {
            path.push(startRoad[i]);
        }

        return path;
    }

    // If they're on different roads, we need to find a connecting route
    // This is simplified - in a real app we would use a routing algorithm

    // Add the first road segment
    if (startIndex < startRoad.length - 1) {
        for (let i = startIndex; i < startRoad.length; i++) {
            path.push(startRoad[i]);
        }
    } else {
        for (let i = startIndex; i >= 0; i--) {
            path.push(startRoad[i]);
        }
    }

    // Find an intersection point between the two roads
    // For this demo, we'll use the City Center as a hub
    const hubPoint = [12.8698, 74.8439]; // City Center

    // Add the hub point if needed
    if (!path.some(point => point[0] === hubPoint[0] && point[1] === hubPoint[1])) {
        path.push(hubPoint);
    }

    // Add the end road segment
    if (endIndex > 0) {
        for (let i = 0; i <= endIndex; i++) {
            path.push(endRoad[i]);
        }
    } else {
        for (let i = endRoad.length - 1; i >= endIndex; i--) {
            path.push(endRoad[i]);
        }
    }

    return path;
}

// Calculate fastest route
function calculateFastestRoute(waypoints) {
    const coordinates = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = [waypoints[i].lat, waypoints[i].lng];
        const end = [waypoints[i + 1].lat, waypoints[i + 1].lng];

        // Find a route through actual roads
        const routePath = findRouteThroughRoads(start, end);

        // Add route points to coordinates
        if (i === 0) {
            coordinates.push(...routePath);
        } else {
            // Avoid duplicating the first point of this segment
            coordinates.push(...routePath.slice(1));
        }
    }

    const route = {
        coordinates: coordinates,
        distance: calculateRouteDistance(coordinates),
        duration: calculateRouteDuration(coordinates, 40) // 40 km/h average speed
    };

    // Apply traffic factor
    const trafficFactor = getTrafficFactor(coordinates);
    route.trafficFactor = trafficFactor;
    route.duration *= trafficFactor;

    return route;
}

// Calculate shortest route
function calculateShortestRoute(waypoints) {
    const coordinates = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = [waypoints[i].lat, waypoints[i].lng];
        const end = [waypoints[i + 1].lat, waypoints[i + 1].lng];

        // For shortest route, we want the most direct path
        // Find nearest road points first
        const startRoadPoint = findNearestRoadPoint(start);
        const endRoadPoint = findNearestRoadPoint(end);

        // Create a more direct path using road segments
        if (i === 0) {
            coordinates.push(start);
        }

        // Add intermediate point to make it look like a road route
        const midLat = (start[0] + end[0]) / 2;
        const midLng = (start[1] + end[1]) / 2;

        coordinates.push([midLat, midLng]);
        coordinates.push(end);
    }

    const route = {
        coordinates: coordinates,
        distance: calculateRouteDistance(coordinates),
        duration: calculateRouteDuration(coordinates, 35) // 35 km/h average speed
    };

    // Apply traffic factor
    const trafficFactor = getTrafficFactor(coordinates);
    route.trafficFactor = trafficFactor;
    route.duration *= trafficFactor;

    return route;
}

// Calculate alternative route
function calculateAlternativeRoute(waypoints) {
    const coordinates = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = [waypoints[i].lat, waypoints[i].lng];
        const end = [waypoints[i + 1].lat, waypoints[i + 1].lng];

        // For alternative route, we'll create a path with multiple turns
        // to simulate going through smaller roads
        if (i === 0) {
            coordinates.push(start);
        }

        const distanceLat = end[0] - start[0];
        const distanceLng = end[1] - start[1];

        // Create zigzag pattern for alternative route
        coordinates.push([start[0] + distanceLat * 0.3, start[1] + distanceLng * 0.1]);
        coordinates.push([start[0] + distanceLat * 0.5, start[1] + distanceLng * 0.6]);
        coordinates.push([start[0] + distanceLat * 0.7, start[1] + distanceLng * 0.8]);
        coordinates.push(end);
    }

    const route = {
        coordinates: coordinates,
        distance: calculateRouteDistance(coordinates),
        duration: calculateRouteDuration(coordinates, 30) // 30 km/h average speed
    };

    // Apply traffic factor
    const trafficFactor = Math.max(1.0, getTrafficFactor(coordinates) * 0.8);
    route.trafficFactor = trafficFactor;
    route.duration *= trafficFactor;

    return route;
}

// Search functionality
function setupSearch(inputElement, resultsElement) {
    inputElement.addEventListener('input', () => {
        const searchTerm = inputElement.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            resultsElement.style.display = 'none';
            return;
        }

        const filteredLocations = mangaloreLocations.filter(location =>
            location.name.toLowerCase().includes(searchTerm)
        );

        if (filteredLocations.length > 0) {
            resultsElement.innerHTML = '';
            filteredLocations.forEach(location => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = location.name;
                item.addEventListener('click', () => {
                    inputElement.value = location.name;
                    resultsElement.style.display = 'none';
                    map.setView(location.coordinates, 15);
                    markers.get(location.name.toLowerCase()).marker.openPopup();
                });
                resultsElement.appendChild(item);
            });
            resultsElement.style.display = 'block';
        } else {
            resultsElement.style.display = 'none';
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== inputElement && e.target !== resultsElement) {
            resultsElement.style.display = 'none';
        }
    });
}

// Setup search for source and destination
setupSearch(sourceInput, sourceResults);
setupSearch(destinationInput, destResults);

// Add waypoint functionality
let waypointCounter = 0;
addWaypointBtn.addEventListener('click', () => {
    waypointCounter++;

    const waypointItem = document.createElement('div');
    waypointItem.className = 'waypoint-item';
    waypointItem.innerHTML = `
        <input type="text" id="waypoint-${waypointCounter}" placeholder="Enter waypoint location in Mangalore" autocomplete="off">
        <button class="remove-waypoint">✕</button>
    `;

    waypointsContainer.appendChild(waypointItem);

    const waypointInput = waypointItem.querySelector(`#waypoint-${waypointCounter}`);
    const waypointSuggestions = document.createElement('div');
    waypointSuggestions.className = 'suggestions';
    waypointSuggestions.id = `waypoint-${waypointCounter}-suggestions`;
    waypointItem.appendChild(waypointSuggestions);

    setupSearch(waypointInput, waypointSuggestions);

    // Remove waypoint
    const removeBtn = waypointItem.querySelector('.remove-waypoint');
    removeBtn.addEventListener('click', () => {
        waypointItem.remove();
    });
});

// Tab functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.getElementById(button.dataset.tab).classList.add('active');

        // Highlight selected route on map
        highlightRoute(button.dataset.tab);
    });
});

// Highlight route on map
function highlightRoute(routeType) {
    // Reset opacity for all routes
    Object.values(routeLayers).forEach(layer => {
        if (layer) {
            layer.setStyle({ opacity: 0.4, weight: 5 });
        }
    });

    // Highlight selected route
    if (routeLayers[routeType]) {
        routeLayers[routeType].setStyle({ opacity: 1.0, weight: 7 });
        routeLayers[routeType].bringToFront();
    }
}

// Calculate distance between two coordinates in kilometers
function calculateDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(degrees) {
    return degrees * Math.PI / 180;
}

// Check if a route passes through a traffic area
function getTrafficFactor(route) {
    let maxFactor = 1.0;

    // For each segment of the route, check if it crosses any traffic zones
    for (let i = 0; i < route.length - 1; i++) {
        const segmentStart = route[i];
        const segmentEnd = route[i + 1];

        for (const [roadName, data] of Object.entries(trafficData)) {
            const [roadStart, roadEnd] = data.coordinates;

            // Simplistic check - if the route segment is close to the traffic segment
            if (isSegmentNearTraffic(segmentStart, segmentEnd, roadStart, roadEnd, 0.005)) {
                maxFactor = Math.max(maxFactor, data.factor);
            }
        }
    }

    return maxFactor;
}

// Check if a route segment is near a traffic segment
function isSegmentNearTraffic(segStart, segEnd, roadStart, roadEnd, tolerance) {
    // Calculate minimum distance between line segments
    // This is a simplified approach - in a real app, you would use a more precise algorithm

    const d1 = calculateDistance(segStart, roadStart);
    const d2 = calculateDistance(segStart, roadEnd);
    const d3 = calculateDistance(segEnd, roadStart);
    const d4 = calculateDistance(segEnd, roadEnd);

    return Math.min(d1, d2, d3, d4) < tolerance;
}

// Generate multiple routes between locations
function generateRoutes(startCoords, endCoords, waypoints = []) {
    // Clear existing routes
    Object.entries(routeLayers).forEach(([type, layer]) => {
        if (layer) {
            map.removeLayer(layer);
            routeLayers[type] = null;
        }
    });

    // Ensure coordinates are valid
    if (!startCoords || !endCoords) {
        alert('Please select valid source and destination locations.');
        return;
    }

    // Create waypoints list for the routing engine
    const waypointsList = [
        L.latLng(startCoords[0], startCoords[1]),
        ...waypoints.map(wp => L.latLng(wp[0], wp[1])),
        L.latLng(endCoords[0], endCoords[1])
    ];

    // Calculate multiple routes using different algorithms

    // 1. Fastest route (using proper road segments)
    const fastestRoute = calculateFastestRoute(waypointsList);

    // 2. Shortest route (optimized for shortest distance)
    const shortestRoute = calculateShortestRoute(waypointsList);

    // 3. Alternative route (using different roads)
    const alternativeRoute = calculateAlternativeRoute(waypointsList);

    // Display the routes on the map
    displayRoutes(fastestRoute, shortestRoute, alternativeRoute);
}

// Display routes on the map and update UI
function displayRoutes(fastestRoute, shortestRoute, alternativeRoute) {
    // Display fastest route
    routeLayers.fastest = L.polyline(fastestRoute.coordinates, {
        color: '#2ecc71', // Green
        weight: 7,
        opacity: 1.0
    }).addTo(map);

    // Display shortest route
    routeLayers.shortest = L.polyline(shortestRoute.coordinates, {
        color: '#3498db', // Blue
        weight: 5,
        opacity: 0.4
    }).addTo(map);

    // Display alternative route
    routeLayers.alternative = L.polyline(alternativeRoute.coordinates, {
        color: '#e67e22', // Orange
        weight: 5,
        opacity: 0.4
    }).addTo(map);

    // Update route information in UI
    updateRouteInfo('fastest', fastestRoute);
    updateRouteInfo('shortest', shortestRoute);
    updateRouteInfo('alternative', alternativeRoute);

    // Generate turn-by-turn directions
    generateDirections('fastest', fastestRoute);
    generateDirections('shortest', shortestRoute);
    generateDirections('alternative', alternativeRoute);

    // Set bounds to fit all routes
    const allCoordinates = [
        ...fastestRoute.coordinates,
        ...shortestRoute.coordinates,
        ...alternativeRoute.coordinates
    ];
    map.fitBounds(L.latLngBounds(allCoordinates.map(coord => L.latLng(coord[0], coord[1]))));
}

// Update route information in the UI
function updateRouteInfo(routeType, route) {
    document.getElementById(`${routeType}-distance`).textContent = `${route.distance.toFixed(2)} km`;
    document.getElementById(`${routeType}-duration`).textContent = `${Math.round(route.duration)} min`;

    const trafficImpact = document.getElementById(`${routeType}-traffic`);
    let trafficText, trafficClass;

    if (route.trafficFactor < 1.2) {
        trafficText = 'Light traffic';
        trafficClass = 'traffic-light';
    } else if (route.trafficFactor < 1.5) {
        trafficText = 'Moderate traffic';
        trafficClass = 'traffic-moderate';
    } else {
        trafficText = 'Heavy traffic';
        trafficClass = 'traffic-heavy';
    }

    trafficImpact.textContent = trafficText;
    trafficImpact.className = trafficClass;
}

// Generate turn-by-turn directions
function generateDirections(routeType, route) {
    const directionsContainer = document.getElementById(`${routeType}-directions`);
    directionsContainer.innerHTML = '';

    // In a real app, this would use the actual turn-by-turn directions from the routing API
    // For this demo, we'll create simplified directions

    const directions = [];
    directions.push('Start from your location.');

    for (let i = 1; i < route.coordinates.length - 1; i++) {
        const prev = route.coordinates[i - 1];
        const curr = route.coordinates[i];
        const next = route.coordinates[i + 1];

        // Calculate bearing change to determine turn direction
        const initialBearing = calculateBearing(prev, curr);
        const finalBearing = calculateBearing(curr, next);
        const bearingDiff = (finalBearing - initialBearing + 360) % 360;

        let direction;
        if (bearingDiff < 20 || bearingDiff > 340) {
            direction = 'Continue straight';
        } else if (bearingDiff < 160) {
            direction = bearingDiff < 80 ? 'Turn right' : 'Turn slightly right';
        } else {
            direction = bearingDiff > 280 ? 'Turn left' : 'Turn slightly left';
        }

        // Find nearest known location
        const nearestLocation = findNearestLocation(curr);
        if (nearestLocation) {
            directions.push(`${direction} near ${nearestLocation}.`);
        } else {
            directions.push(`${direction} and continue.`);
        }
    }

    directions.push('Arrive at your destination.');

    // Add directions to UI
    directions.forEach(direction => {
        const item = document.createElement('div');
        item.className = 'direction-item';
        item.textContent = direction;
        directionsContainer.appendChild(item);
    });
}

// Calculate bearing between two coordinates
function calculateBearing(coord1, coord2) {
    const [lat1, lon1] = coord1.map(toRad);
    const [lat2, lon2] = coord2.map(toRad);

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    return bearing;
}

// Find nearest known location to a coordinate
function findNearestLocation(coord) {
    let nearestLocation = null;
    let minDistance = Infinity;

    mangaloreLocations.forEach(location => {
        const distance = calculateDistance(coord, location.coordinates);
        if (distance < minDistance && distance < 0.5) { // Within 500m
            minDistance = distance;
            nearestLocation = location.name;
        }
    });

    return nearestLocation;
}

// Find route on button click
findRouteBtn.addEventListener('click', () => {
    const sourceName = sourceInput.value;
    const destName = destinationInput.value;

    // Find coordinates for source and destination
    const sourceLocation = mangaloreLocations.find(loc => loc.name === sourceName);
    const destLocation = mangaloreLocations.find(loc => loc.name === destName);

    if (!sourceLocation || !destLocation) {
        alert('Please select valid source and destination locations from the suggestions.');
        return;
    }

    const sourceCoords = sourceLocation.coordinates;
    const destCoords = destLocation.coordinates;

    // Get waypoints
    const waypoints = [];
    document.querySelectorAll('.waypoint-item input').forEach(input => {
        const waypointName = input.value;
        const waypointLocation = mangaloreLocations.find(loc => loc.name === waypointName);

        if (waypointLocation) {
            waypoints.push(waypointLocation.coordinates);
        }
    });

    // Generate routes
    generateRoutes(sourceCoords, destCoords, waypoints);
});

// Initialize with the first tab active
document.querySelector('.tab-btn.active').click();
