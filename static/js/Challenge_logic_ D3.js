// Add console.log to check to see if our code is working.
console.log("working");

// https://docs.mapbox.com/api/maps/styles/
// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});

let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});

let dark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});

// Create a base layer that holds both maps.
let baseMaps = {
    "Street": streets,
    "Dark": dark,
    "Satellite": satelliteStreets,
};

// Create the earthquake layer for our map.
let earthquakes = new L.layerGroup();

// D-1. Step 1. Add a 2nd layer group for the tectonic plate data.
let tectonicPlates = new L.LayerGroup();

// D-2. Step 1. Add a 3nd layer group for the tectonic plate data.
let majorEarthquakes = new L.LayerGroup();

// another technique to create a map object
// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
    center: [30, 30],
    zoom: 3,
    layers: [dark]
});

// We define an object that contains the overlays.
// This overlay will be visible all the time.
let overlays = {
    "Earthquakes": earthquakes,
    // D-1. Step 2
    "Tectonic Plates": tectonicPlates,
    // D-2. Step 2
    "Major Earthqakes": majorEarthquakes,
};

// Then we add a control to the map that will allow the user to change
// which layers are visible.
L.control.layers(baseMaps, overlays, {
    collapsed: false
}
).addTo(map);

let earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Retrieve the earthquake GeoJSON data.
d3.json(earthquakeData).then(function (data) {
    console.log(data);

    // This function returns the style data for each of the earthquakes we plot on
    // the map. We pass the magnitude of the earthquake into a function
    // to calculate the radius.
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // This function determines the color of the circle based on the magnitude of the earthquake.
    function getColor(magnitude) {
        if (magnitude > 5) {
            return "#ea2c2c";
        }
        if (magnitude > 4) {
            return "#ea822c";
        }
        if (magnitude > 3) {
            return "#ee9c00";
        }
        if (magnitude > 2) {
            return "#eecc00";
        }
        if (magnitude > 1) {
            return "#d4ee00";
        }
        return "#98ee00";
    }

    // This function determines the radius of the earthquake marker based on its magnitude.
    // Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    // Creating a GeoJSON layer with the retrieved data.
    L.geoJSON(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function (feature, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        // We create a popup for each circleMarker to display the magnitude and
        //  location of the earthquake after the marker has been created and styled.
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(earthquakes);

    // Then we add the earthquake layer to our map
    earthquakes.addTo(map);
});

// ########### adding D3 code ################
// 3. Retrieve the major earthquake GeoJSON data >4.5 mag for the week.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson").then(function (majorData) {
    console.log(majorData);

    // 4. Use the same style as the earthquake data.
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    // 5. Change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake.
    function getColor(magnitude) {
        if (magnitude > 6) {
            return "#a10a0a";
        }
        if (magnitude > 5) {
            return "#ea822c";
        }
        if (magnitude <= 5) {
            return "#ee9c00";
        }
    }

    // 6. Use the function that determines the radius of the earthquake marker based on its magnitude.
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }


    // 7. Creating a GeoJSON layer with the retrieved data that adds a circle to the map 
    // sets the style of the circle, and displays the magnitude and location of the earthquake
    //  after the marker has been created and styled.
    L.geoJSON(majorData, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function (feature, latlng) {
            console.log(majorData);
            return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        // We create a popup for each circleMarker to display the magnitude and
        //  location of the earthquake after the marker has been created and styled.
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(majorEarthquakes);
    // 8. Add the major earthquakes layer to the map.
    majorEarthquakes.addTo(map)

    // 9. Close the braces and parentheses for the major earthquake data.
});


// Create a legend control object.
let legend = L.control({
    position: "bottomright"
});

// Then add all the details for the legend.
legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
    ];

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < magnitudes.length; i++) {
        console.log(colors[i]);
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
};

legend.addTo(map);

// link to tectonic plates raw data
// https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json

// D-1. Step 3. Use d3.json to make a call to get our Tectonic Plate geoJSON data.
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (tectonicData) {
    console.log(tectonicData);

    // pass data to geoJSON layer
    L.geoJSON(tectonicData, {
        color: "orange",
        weight: 2.5,
    }).addTo(tectonicPlates);

    // add the tectonic layer group variable to the map
    tectonicPlates.addTo(map);

});
