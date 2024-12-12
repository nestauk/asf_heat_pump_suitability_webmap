 // create map
 var map = L.map('map', {
    center: [53, -1.9],
    minZoom: 6,
    maxZoom: 15,
    zoomControl: true,
    zoom: 7,
});

// add background basemap
var mapBaseLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
        attribution: '(C) OpenStreetMap contributors (C) CARTO'
    }
).addTo(map);

// get vector tiles URL
var mapUrl = "tiles/{z}/{x}/{y}.pbf";

// function mapping of colors to signature type
function getColor(d) {
    return d > 8 ? '#081d58' :
        d > 7  ? '#253494' :
        d > 6  ? '#225ea8' :
        d > 5  ? '#1d91c0' :
        d > 4   ? '#41b6c4' :
        d > 3   ? '#7fcdbb' :
        d > 2   ? '#c7e9b4' :
        d > 1   ? '#edf8b1' :
                  '#ffffd9';
}
        
// define styling of vector tiles
var vectorTileStyling = {
    hps_lsoas: function(properties, zoom) {
        var weight = 0;
        if (zoom > 12) {
            weight = 1.0;
        }
        return ({
            fill: true,
            fillColor: getColor(properties.ashp_n_suit_class),
            fillOpacity: 0.9,
            weight: weight,
            color: "#ffffff",
            opacity: 1.0,
        });
    }
}

// define options of vector tiles - basic outlines.
var mapVectorTileOptions = {
    rendererFactory: L.canvas.tile,
    interactive: true,
    getFeatureId: function(f) {
        return f.properties.LSOA21CD;
    },
    attribution: '(C) Nesta',
    maxNativeZoom: 15,
    minZoom: 6,
    vectorTileLayerStyles: vectorTileStyling,
};

L.DomEvent.fakeStop = function () {
    return true;
  }

function simplePopUp(event){
    L.popup()
    .setContent(`Class is:${event.layer.properties.ashp_n_suit_class}`)
    .setLatLng(event.latlng)
    .openOn(map);}

function highlightFeature(event){
    console.log(event)
    if (event.target._map._zoom > 10){
    mapPbfLayer.setFeatureStyle(event.layer.properties.LSOA21CD,
        {
            fill: true,
            fillColor: getColor(event.layer.properties.ashp_n_suit_class),
            fillOpacity: 0.3,
            weight: 1,
            color: "#ffffff",
            opacity: 1.0,
        })}
}

function resetHighlight(event){
    mapPbfLayer.resetFeatureStyle(event.layer.properties.LSOA21CD)
}

// create VectorGrid layer
var mapPbfLayer = new L.VectorGrid.Protobuf(
    mapUrl, mapVectorTileOptions
).on({click: simplePopUp,
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });

// add VectorGrid layer to map
mapPbfLayer.addTo(map);

var baseMaps = {
    "OpenStreetMap": mapBaseLayer,
};

var overlayMaps = {
    "ASHP Nesta": mapPbfLayer,
};

//LayerControl
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

//OpacityControl
var opacityControl = L.control.opacity(overlayMaps, {label: 'Layers Opacity', }).addTo(map);