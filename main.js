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

var baseMaps = {
    "OpenStreetMap": mapBaseLayer,
};

// get vector tiles URL
var mapUrl = "tiles/{z}/{x}/{y}.pbf";

// function mapping of colors to signature type
/*
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
*/

// Get colour from colormap and return as hex colours.
function getCmapColor(d) {
    [r, g, b] = evaluate_cmap(d, 'coolwarm', false)
    return rgbToHex(r, g, b)
}
        
// define styling of vector tiles
function vectorTileStyling(layername){
    return {
        hps_areas: function(properties, zoom) {
            var weight = 0;
            if (zoom > 12) {
                weight = 1.0;
            }
            return ({
                fill: true,
                //fillColor: getColor(properties[layername]),
                fillColor: getCmapColor(properties[layername]),
                fillOpacity: 0.9,
                weight: weight,
                color: "#ffffff",
                opacity: 1.0,
            });
        }
    }
}

// define options template for vector tiles.
var mapVectorTileOptions = {
    rendererFactory: L.canvas.tile,
    interactive: true,
    getFeatureId: function(f) {
        return f.properties.area_code;
    },
    attribution: '(C) Nesta',
    maxNativeZoom: 15,
    minZoom: 6,
    vectorTileLayerStyles: null,
};

// Set up layers
// ASHP Nesta
mapVectorTileOptions['vectorTileLayerStyles'] = vectorTileStyling("ASHP_N_avg_score_weighted");
var ashp_nesta_map_layer = new L.VectorGrid.Protobuf(
    mapUrl, mapVectorTileOptions
)
ashp_nesta_map_layer.on({click: simplePopUp("ASHP_N_avg_score_weighted"),
    mouseover: highlightFeature(ashp_nesta_map_layer, "ASHP_N_avg_score_weighted"),
    mouseout: resetHighlight(ashp_nesta_map_layer),
});
// ASHP Standard
mapVectorTileOptions['vectorTileLayerStyles'] = vectorTileStyling("ASHP_S_avg_score_weighted");
var ashp_standard_map_layer = new L.VectorGrid.Protobuf(
    mapUrl, mapVectorTileOptions
)
ashp_standard_map_layer.on({click: simplePopUp("ASHP_S_avg_score_weighted"),
    mouseover: highlightFeature(ashp_standard_map_layer, "ASHP_S_avg_score_weighted"),
    mouseout: resetHighlight(ashp_standard_map_layer),
});

// Load Nesta map as standard
ashp_nesta_map_layer.addTo(map)

// Create initial layer control
var layerControl = L.control.layers(baseMaps, {"Nesta ASHP Suitability": ashp_nesta_map_layer}).addTo(map);

// Create initial opacity control
var opacityControl = L.control.opacity({"Nesta ASHP Suitability": ashp_nesta_map_layer}, {label: 'Layer Opacity', }).addTo(map);

// Set up layer selection
var layer_mapping = {'0': ashp_nesta_map_layer, '1': ashp_standard_map_layer}

var layer_name_mapping = {'0': "ASHP_N_avg_score_weighted", '1': "ASHP_S_avg_score_weighted"}

var control_name_mapping = {'0': "Nesta ASHP Suitability", '1': "Standard ASHP Suitability"}

var layerselect = document.getElementById("layer-select");

layerselect.addEventListener("change", change_vector_layer);

function change_vector_layer() {
        // first remove current layer
        if (map.hasLayer(ashp_nesta_map_layer)) {
            map.removeLayer(ashp_nesta_map_layer)
        }
        if (map.hasLayer(ashp_standard_map_layer)) {
            map.removeLayer(ashp_standard_map_layer)
        }

        // Remove current layer control
        layerControl.remove();
        // Remove current opacity control
        opacityControl.remove()

        mapVectorTileOptions['vectorTileLayerStyles'] = vectorTileStyling(layer_name_mapping[layerselect.value]);
       
        // add VectorGrid layer to map
        layer_mapping[layerselect.value].addTo(map);
        
        // Overlays
        var overlayMaps = {
            [control_name_mapping[layerselect.value]]: layer_mapping[layerselect.value],
        };

        // add layer control
        layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
        
        //OpacityControl
        opacityControl = L.control.opacity(overlayMaps, {label: 'Layer Opacity', }).addTo(map);
    }

L.DomEvent.fakeStop = function () {
    return true;
  }

// curried function to enable parameters
function simplePopUp(layername) {
        return function curried_simplePopUp(event) {
            L.popup()
            .setContent(`Suitability is:${event.layer.properties[layername]}`)
            .setLatLng(event.latlng)
            .openOn(map);}
        }

function highlightFeature(layer, layername){
    return function curried_highlightFeature(event) {
    if (event.target._map._zoom > 10){
    layer.setFeatureStyle(event.layer.properties.area_code,
        {
            fill: true,
            fillColor: getColor(event.layer.properties[layername]),
            fillOpacity: 0.3,
            weight: 1,
            color: "#ffffff",
            opacity: 1.0,
        })}
}
}

function resetHighlight(layer) {
    return function curried_resetHighlight(event){
        layer.resetFeatureStyle(event.layer.properties.area_code)
    }
}