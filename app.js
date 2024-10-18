// Initialize map with satellite view using OpenStreetMap

var map = L.map('map').setView([51.505, -0.09], 13);

// OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Automatically detect user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var userLat = position.coords.latitude;
        var userLng = position.coords.longitude;

        // Set the map view to user's location
        map.setView([userLat, userLng], 13);

        // Add a marker for the detected location
        var userMarker = L.marker([userLat, userLng]).addTo(map)
            .bindPopup("<b>Your Current Location</b><br />Use this location for analysis.")
            .openPopup();

        // Fetch weather data for the user's location
        fetchWeatherData(userLat, userLng);
    }, function() {
        alert('Geolocation is not supported by your browser or permission denied.');
    });
} else {
    alert('Geolocation is not supported by this browser.');
}

// Function to fetch weather data from OpenWeatherMap
function fetchWeatherData(lat, lon) {
    const apiKey = '19c395fc79e7b17aa21d5d2cafa63c23'; // Replace with your OpenWeatherMap API key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            const clouds = data.clouds.all;
            const rainfall = data.rain ? data.rain['1h'] || 0 : 0; // Rainfall in the last hour (if available)

            document.getElementById('temp').innerHTML ="Temperature:"+temperature+"Degree";
            document.getElementById('hum').innerHTML ="Humidity:"+humidity+"%";
            document.getElementById('cloud').innerHTML ="Clouds:"+clouds+"%";
            document.getElementById('rain').innerHTML ="Rainfall:"+rainfall+"mm last hour";

            const weatherInfo = `
                <b>Current Weather:</b><br>
                Temperature: ${temperature} °C<br>
                Humidity: ${humidity}%<br>
                Cloudiness: ${clouds}%<br>
                Rainfall: ${rainfall} mm in the last hour
            `;

            // Display weather info on the map
            L.popup()
                .setLatLng([lat, lon])
                .setContent(weatherInfo)
                .openOn(map);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

// Leaflet Draw: Allow user to draw farm size on the map
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: true,
        polyline: false,
        circle: false,
        marker: false,
        rectangle: true // Enable rectangle drawing
    }
});

map.addControl(drawControl);

// Event handler for drawing a rectangle (farm size)
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);

    // Get the bounds of the drawn rectangle
    var bounds = layer.getBounds();

    // Calculate the area (square meters) of the rectangle
    var area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);

    // Convert area to hectares (1 hectare = 10,000 square meters)
    var areaHectares = (area / 10000).toFixed(2);

    // Display the farm size in hectares
    document.getElementById('farm-size').innerHTML = "Farm size: " + areaHectares + " hectares";
});

// Event handler for clicking the analyze button
document.getElementById('analyze-btn').addEventListener('click', function() {
    alert('Analyzing soil and weather data based on your selected farm area...');
    // Placeholder for further integration (API calls for weather, soil data, etc.)
});
