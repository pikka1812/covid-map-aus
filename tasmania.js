import {tasSuburbs} from "./tas-suburbs.js";
for(let x of tasSuburbs.features) {
    x.properties.cases = Math.floor(Math.random() * 2000);
}

window.alert("Since I don't have any offcial data about Tasmania covid cases, all the data on this page is \"fake\" and don't consider it as a offcial source")
const map = L.map('tas-map').setView([-42.0,147], 7);
map.setMaxBounds([[-39.206708, 149], [-44.657607, 143]]);
const info = L.control();
const legend = L.control({position: 'bottomright'});
const button = L.control({position: 'bottomleft'});

const geojson = L.geoJson(tasSuburbs, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20,
    minZoom: 7
}).addTo(map);

legend.onAdd = (map) => {
    const div = L.DomUtil.create('div', 'info legend'),
          grades = [10,50,100,500,1000],
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
    this._div.innerHTML = '<h4>Tasmania Covid Map</h4>' +  (props ?
        '<b>' + props.tas_loca_2 + '</b><br />' + props.cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' cases' // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
        : 'Hover over a suburbs');
};

button.onAdd = function (map) {
    this._div = L.DomUtil.create('button','current-location');
    this._div.innerHTML = "Current Location";
    return this._div;
}
legend.addTo(map);
info.addTo(map);
button.addTo(map);


function getColor(cases) {
    return cases > 1000 ? '#bd0026' :
    cases > 500  ? '#f03b20' :
    cases > 100  ? '#fd8d3c' : 
    cases > 50   ? '#feb24c' :
    cases > 10   ? '#fed976' :
    '#ffffb2' ;
}


function style(features) {
    return {
        fillColor: getColor(features.properties.cases),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '1',
        fillOpacity: 0.7
    };
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: (e) => {
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
        },
        mouseout: (e) => {
            geojson.resetStyle(e.target);
            info.update();
        },
        click: zoomToFeature
    });
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
    
    map.flyTo([crd.latitude, crd.longitude], 15);
    
}

$(".current-location").click(function() {
    navigator.geolocation.getCurrentPosition(success, error, options);
});