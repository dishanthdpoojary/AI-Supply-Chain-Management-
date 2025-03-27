// Mangalore Supply Chain Route Optimizer

// Define common locations in Mangalore
const mangaloreLocations = [
    { name: "Baikampady Industrial Area", coords: [12.9143, 74.8328] },
    { name: "Sultan Battery", coords: [12.8643, 74.8428] },
    { name: "Ullal Beach", coords: [12.8129, 74.8420] },
    { name: "Tannirbhavi Beach", coords: [12.8700, 74.8200] },
    { name: "Panambur Port", coords: [12.9373, 74.8061] },
    { name: "Kadri Market", coords: [12.8730, 74.8564] },
    { name: "Falnir Marketplace", coords: [12.8643, 74.8400] },
    { name: "Surathkal", coords: [13.0070, 74.7946] },
    { name: "Kuloor", coords: [12.9053, 74.8261] },
    { name: "Kavoor", coords: [12.9108, 74.8411] },
    { name: "NMPT Harbor", coords: [12.9269, 74.8057] },
    { name: "Mangalore Junction Railway Station", coords: [12.8698, 74.8554] },
    { name: "Mangalore International Airport", coords: [12.9612, 74.8901] },
    { name: "Mangalore City Center", coords: [12.8698, 74.8430] }
];

// Initialize the map
let map = L.map('map').setView([12.8698, 74.8430], 12); // Center on Mangalore

// Add tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize routing control (will be replaced later when finding routes)
let routingControl = null;

// Get DOM elements
const sourceInput = document.getElementById('source');
const destinationInput = document.getElementById('destination');
const sourceSuggestions = document.getElementById('source-suggestions');
const destinationSuggestions = document.getElementById('destination-suggestions');
const addWaypointBtn = document.getElementById('add-waypoint');
const waypointsContainer = document.getElementById('waypoints-container');
const findRouteBtn = document.getElementById('find-route');
const tabButtons = document.querySelectorAll('.tab-btn');

// Current waypoints
let waypoints = [];
let waypointInputs = [];

// Initialize source and destination with URL params if available
window.addEventListener('DOMContentLoaded', () => {
    // Add markers for all major locations
    mangaloreLocations.forEach(location => {
        L.marker([location.coords[0], location.coords[1]])
            .addTo(map)
            .bindPopup(location.name);
    });

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sourceFromURL = urlParams.get('source');
    const destinationFromURL = urlParams.get('destination');

    // Set input values if they exist in URL
    if (sourceFromURL) {
        sourceInput.value = decodeURIComponent(sourceFromURL);
    }

    if (destinationFromURL) {
        destinationInput.value = decodeURIComponent(destinationFromURL);
    }

    // If both parameters exist, calculate route automatically
    if (sourceFromURL && destinationFromURL) {
        setTimeout(() => {
            findRouteBtn.click();
        }, 1000);
    } else {
        // Default to Sultan Battery to Baikampady if no parameters
        sourceInput.value = "Sultan Battery";
        destinationInput.value = "Baikampady Industrial Area";

        // Automatically calculate the route
        setTimeout(() => {
            findRouteBtn.click();
        }, 1000);
    }
});

// Handle showing location suggestions
function showSuggestions(input, suggestionsList) {
    const query = input.value.toLowerCase();

    if (query.length < 2) {
        suggestionsList.innerHTML = '';
        suggestionsList.classList.remove('show');
        return;
    }

    // Filter locations based on input
    const filteredLocations = mangaloreLocations.filter(
        location => location.name.toLowerCase().includes(query)
    );

    if (filteredLocations.length === 0) {
        suggestionsList.innerHTML = '';
        suggestionsList.classList.remove('show');
        return;
    }

    // Create suggestion elements
    suggestionsList.innerHTML = '';
    filteredLocations.forEach(location => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = location.name;
        suggestionItem.addEventListener('click', () => {
            input.value = location.name;
            suggestionsList.classList.remove('show');
        });
        suggestionsList.appendChild(suggestionItem);
    });

    suggestionsList.classList.add('show');
}

// Handle input events
sourceInput.addEventListener('input', () => showSuggestions(sourceInput, sourceSuggestions));
destinationInput.addEventListener('input', () => showSuggestions(destinationInput, destinationSuggestions));

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!sourceInput.contains(e.target) && !sourceSuggestions.contains(e.target)) {
        sourceSuggestions.classList.remove('show');
    }
    if (!destinationInput.contains(e.target) && !destinationSuggestions.contains(e.target)) {
        destinationSuggestions.classList.remove('show');
    }
});

// Add waypoint functionality
addWaypointBtn.addEventListener('click', () => {
    const waypointId = 'waypoint-' + Date.now();

    // Create waypoint container
    const waypointItem = document.createElement('div');
    waypointItem.className = 'waypoint-item';

    // Create input
    const waypointInput = document.createElement('input');
    waypointInput.type = 'text';
    waypointInput.placeholder = 'Enter waypoint location';
    waypointInput.id = waypointId;

    // Create suggestions container
    const waypointSuggestions = document.createElement('div');
    waypointSuggestions.className = 'suggestions';
    waypointSuggestions.id = waypointId + '-suggestions';

    // Create remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-waypoint';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', () => {
        waypointItem.remove();
        const index = waypointInputs.findIndex(w => w.id === waypointId);
        if (index !== -1) {
            waypointInputs.splice(index, 1);
        }
    });

    // Add event listeners
    waypointInput.addEventListener('input', () => {
        showSuggestions(waypointInput, waypointSuggestions);
    });

    // Add elements to DOM
    waypointItem.appendChild(waypointInput);
    waypointItem.appendChild(waypointSuggestions);
    waypointItem.appendChild(removeBtn);
    waypointsContainer.appendChild(waypointItem);

    // Add to waypoint inputs array
    waypointInputs.push({
        id: waypointId,
        input: waypointInput,
        suggestions: waypointSuggestions
    });
});

// Get coordinates for a location name
function getCoordinates(locationName) {
    const location = mangaloreLocations.find(
        loc => loc.name.toLowerCase() === locationName.toLowerCase()
    );

    if (location) {
        return L.latLng(location.coords[0], location.coords[1]);
    }

    // Default to Mangalore City Center if not found
    return L.latLng(12.8698, 74.8430);
}

// Function to calculate route
function calculateRoute() {
    const source = sourceInput.value;
    const destination = destinationInput.value;

    if (!source || !destination) {
        alert('Please enter both source and destination');
        return;
    }

    // Get coordinates
    const sourceCoords = getCoordinates(source);
    const destinationCoords = getCoordinates(destination);

    // Get waypoint coordinates
    waypoints = waypointInputs
        .map(w => w.input.value)
        .filter(value => value.trim() !== '')
        .map(getCoordinates);

    // Remove existing routing control if any
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Create waypoints array for routing
    const routeWaypoints = [sourceCoords];
    waypoints.forEach(waypoint => {
        routeWaypoints.push(waypoint);
    });
    routeWaypoints.push(destinationCoords);

    // Add routing control
    routingControl = L.Routing.control({
        waypoints: routeWaypoints,
        routeWhileDragging: true,
        showAlternatives: true,
        altLineOptions: {
            styles: [
                {color: 'black', opacity: 0.15, weight: 9},
                {color: 'white', opacity: 0.8, weight: 6},
                {color: 'blue', opacity: 0.5, weight: 2}
            ]
        },
        lineOptions: {
            styles: [
                {color: 'black', opacity: 0.15, weight: 9},
                {color: 'white', opacity: 0.8, weight: 6},
                {color: 'red', opacity: 0.5, weight: 4}
            ]
        },
        createMarker: function(i, wp, nWps) {
            // Create custom markers for waypoints
            let marker;
            if (i === 0) {
                // Source marker
                marker = L.marker(wp.latLng, {
                    icon: L.divIcon({
                        className: 'start-marker',
                        html: '<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })
                });
                marker.bindPopup("Source: " + source);
            } else if (i === nWps - 1) {
                // Destination marker
                marker = L.marker(wp.latLng, {
                    icon: L.divIcon({
                        className: 'end-marker',
                        html: '<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })
                });
                marker.bindPopup("Destination: " + destination);
            } else {
                // Waypoint marker
                marker = L.marker(wp.latLng, {
                    icon: L.divIcon({
                        className: 'waypoint-marker',
                        html: '<div style="background-color: blue; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>',
                        iconSize: [14, 14],
                        iconAnchor: [7, 7]
                    })
                });
                marker.bindPopup("Waypoint " + i);
            }
            return marker;
        }
    }).addTo(map);

    // Listen for route calculation completion
    routingControl.on('routesfound', function(e) {
        const routes = e.routes;

        // Update route details
        updateRouteDetails('fastest', routes[0]);

        if (routes.length > 1) {
            updateRouteDetails('shortest', routes[1]);
        }

        if (routes.length > 2) {
            updateRouteDetails('alternative', routes[2]);
        } else if (routes.length > 1) {
            updateRouteDetails('alternative', routes[1]);
        } else {
            updateRouteDetails('alternative', routes[0]);
        }
    });
}

// Update route details in the UI
function updateRouteDetails(routeType, route) {
    const distanceElement = document.getElementById(`${routeType}-distance`);
    const durationElement = document.getElementById(`${routeType}-duration`);
    const trafficElement = document.getElementById(`${routeType}-traffic`);
    const directionsElement = document.getElementById(`${routeType}-directions`);

    // Format distance and duration
    const distance = (route.summary.totalDistance / 1000).toFixed(2) + ' km';
    const duration = formatDuration(route.summary.totalTime);

    // Set values
    distanceElement.textContent = distance;
    durationElement.textContent = duration;

    // Set traffic impact (simulated)
    const trafficImpact = getTrafficImpact();
    trafficElement.textContent = trafficImpact;

    // Update directions
    directionsElement.innerHTML = '';
    route.instructions.forEach((instruction, index) => {
        const step = document.createElement('div');
        step.className = 'direction-step';
        step.innerHTML = `<strong>${index + 1}.</strong> ${instruction.text} (${(instruction.distance / 1000).toFixed(2)} km)`;
        directionsElement.appendChild(step);
    });
}

// Format duration from seconds to hours and minutes
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} hr ${minutes} min`;
    } else {
        return `${minutes} min`;
    }
}

// Simulate traffic impact
function getTrafficImpact() {
    const impacts = [
        'Low - Free flowing traffic',
        'Medium - Moderate congestion',
        'High - Heavy traffic expected'
    ];

    // Randomly select an impact (in a real app, this would be based on actual data)
    return impacts[Math.floor(Math.random() * impacts.length)];
}

// Tab switching functionality
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and tab contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

        // Add active class to clicked button and corresponding tab
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Find route button
findRouteBtn.addEventListener('click', calculateRoute);
