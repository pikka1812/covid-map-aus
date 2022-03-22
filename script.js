import {ausStates} from "./aus-states.js";

//setup the map
const map = L.map('map').setView([-26.4390917,133.281323], 5);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const info = L.control();
const legend = L.control({position: 'bottomright'});
const button = L.control({position: 'bottomleft'});
const geojson = L.geoJson(ausStates, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution},{style: 'toner-background'}).addTo(map);

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend'),
          grades = [10000,50000,100000,500000,1000000],
          labels = [];

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML+= 
            '<i style="background:' + getColor(grades[i] + 1) + '"></i>' + 
            grades[i] + (grades[i+1] ? '&ndash;' + grades[i+1] +'<br>' : '+');
    }

    return div;
}

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = '<h4>Australia Covid Map</h4>' +  (props ?
        '<b>' + props.STATE_NAME + '</b><br />' + props.cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' cases' // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
        : 'Hover over a state');
};

button.onAdd = function(map) {
    this._div = L.DomUtil.create('button','current-location');
    this._div.innerHTML = "Current Location";
    return this._div;
}
legend.addTo(map);
info.addTo(map);
button.addTo(map);



function getColor(cases) {
    return cases > 1000000 ? '#bd0026' :
    cases > 500000  ? '#f03b20' :
    cases > 100000  ? '#fd8d3c' : 
    cases > 50000   ? '#feb24c' :
    cases > 10000   ? '#fed976' :
    '#ffffb2' ;
}


function style(features) {
    return {
        fillColor: getColor(features.properties.cases),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function highlightFeature(e) {
    const layer = e.target;
    
    layer.setStyle({
        weight:5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

function success(pos) {
    var crd = pos.coords;
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    
    map.flyTo([crd.latitude, crd.longitude], 7);
    
}

$(".current-location").click(function() {
    navigator.geolocation.getCurrentPosition(success, error, options);
});