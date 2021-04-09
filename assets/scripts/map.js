let DATA_DIRECTORY = document.currentScript.src.split('/').slice(0, -1).join('/') + '/../data/';
if (typeof LAUNCH_LOCATIONS_FILENAME === 'undefined') {
    var LAUNCH_LOCATIONS_FILENAME = 'launch_locations.geojson';
}

let BASE_LAYERS = {
    'Esri Topography': L.tileLayer.provider('Esri.WorldTopoMap'),
    'Esri Road': L.tileLayer.provider('Esri.WorldStreetMap'),
    'Esri Gray': L.tileLayer.provider('Esri.WorldGrayCanvas'),
    'Esri Imagery': L.tileLayer.provider('Esri.WorldImagery'),
    'maritime chart': L.tileLayer('https://tileservice.charts.noaa.gov/tiles/50000_1/{z}/{x}/{y}.png', {transparent: true})
};

BASE_LAYERS['maritime chart'].on('add', function (event) {
    event.target._mapToAdd.addLayer(BASE_LAYERS['Esri Gray']);
});

/* asynchronously load polygons of controlled airspace from GeoJSON file */
let CONTROLLED_AIRSPACE_LAYER = L.geoJson.ajax(DATA_DIRECTORY + 'controlled_airspace.geojson', {
    'onEachFeature': popupFeaturePropertiesOnClick, 'style': function (feature) {
        switch (feature.properties['LOCAL_TYPE']) {
            case 'R':
                return {'color': '#ea2027'};
            case 'CLASS_B':
                return {'color': '#0652dd'};
            case 'CLASS_C':
                return {'color': '#6f1e51'};
            case 'CLASS_D':
                return {'color': '#0652dd', 'dashArray': '4'};
            default:
                return {'color': '#6f1e51', 'dashArray': '4'};
        }
    }, 'attribution': 'Airspace - FAA'
});

/* asynchronously load polygons of uncontrolled airspace from GeoJSON file */
let UNCONTROLLED_AIRSPACE_LAYER = L.geoJson.ajax(DATA_DIRECTORY + 'uncontrolled_airspace.geojson', {
    'onEachFeature': popupFeaturePropertiesOnClick, 'style': function (feature) {
        return {'color': '#6f1e51', 'dashArray': '4'};
    }, 'attribution': 'Airspace &copy; FAA'
});

/* dictionary to contain toggleable layers */
let OVERLAY_LAYERS = {
    'reference': {
        'Controlled Airspace': CONTROLLED_AIRSPACE_LAYER, 'Uncontrolled Airspace': UNCONTROLLED_AIRSPACE_LAYER
    }
};

/* add Leaflet map to 'map' div with grouped layer control */
let MAP = L.map('map', {
    'layers': [BASE_LAYERS['Esri Topography']], 'zoomSnap': 0, 'zoomControl': false, 'touchZoom': true, dragging: true
});
MAP.on('layeradd', sinkReferenceLayers);
MAP.addControl(L.control.scale());

let LAYER_CONTROL = L.control.groupedLayers(BASE_LAYERS, OVERLAY_LAYERS);
MAP.addControl(LAYER_CONTROL);