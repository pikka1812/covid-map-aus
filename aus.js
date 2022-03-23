import {ausStates} from "./aus-states.js";
//setup the map
const map = L.map('map').setView([-27,133], 5);
map.setMaxBounds([[-10, 110], [-43.657607, 155]]);
const info = L.control();
const legend = L.control({position: 'bottomright'});
const geojson = L.geoJson(ausStates, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 8,
    minZoom: 5,
}).addTo(map);

legend.onAdd = (map) => {
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
legend.addTo(map);
info.addTo(map);



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
    console.log(e.target.getBounds());
}