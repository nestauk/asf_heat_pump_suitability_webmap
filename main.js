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
    
L.DomEvent.fakeStop = function () {
    return true;
  }

var baseMaps = {
    "OpenStreetMap": mapBaseLayer,
};

// get vector tiles URL
var mapUrl = "tiles/{z}/{x}/{y}.pbf";

// Get colour from colormap and return as hex colours.
function getCmapColor(d, colormap) {
    [r, g, b] = evaluate_cmap(d, colormap, false)
    return rgbToHex(r, g, b)
}
        
// define styling of vector tiles
function vectorTileStyling(layername, colormap='coolwarm'){
    return {
        hps_areas: function(properties, zoom) {
            var weight = 0;
            if (zoom > 12) {
                weight = 1.0;
            }
            return ({
                fill: true,
                //fillColor: getColor(properties[layername]),
                fillColor: getCmapColor(properties[layername], colormap),
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
    attribution: '',
    maxNativeZoom: 15,
    minZoom: 6,
    vectorTileLayerStyles: null,
};

// Set up layers
const layer_names = [
    'ASHP_N_avg_score_weighted', 'ASHP_S_avg_score_weighted',
    'GSHP_N_avg_score_weighted', 'GSHP_S_avg_score_weighted', 
    'SGL_N_avg_score_weighted', 'SGL_S_avg_score_weighted', 
    'HN_N_avg_score_weighted', 'HN_S_avg_score_weighted'];

const layer_colormaps = {
    'ASHP_N_avg_score_weighted': 'Blues', 'ASHP_S_avg_score_weighted': 'Blues',
    'GSHP_N_avg_score_weighted': 'Greens', 'GSHP_S_avg_score_weighted': 'Greens', 
    'SGL_N_avg_score_weighted': 'Purples', 'SGL_S_avg_score_weighted': 'Purples', 
    'HN_N_avg_score_weighted': 'Oranges', 'HN_S_avg_score_weighted': 'Oranges'
}

// Collect layers in map object
var layers = new Map();
for (let layer_name of layer_names) {
    mapVectorTileOptions['vectorTileLayerStyles'] = vectorTileStyling(layer_name, layer_colormaps[layer_name]);
    let layer = new L.VectorGrid.Protobuf(
        mapUrl, mapVectorTileOptions
    )

    layers.set(layer_name, layer)
}

// Set default starting layer
layers.get('ASHP_N_avg_score_weighted').on({click: simplePopUp('ASHP_N_avg_score_weighted'),
    mouseover: highlightFeature(layers.get('ASHP_N_avg_score_weighted'),
                                'ASHP_N_avg_score_weighted',
                                layer_colormaps['ASHP_N_avg_score_weighted']),
    mouseout: resetHighlight(layers.get('ASHP_N_avg_score_weighted')),
});

// Load Nesta map as standard
layers.get('ASHP_N_avg_score_weighted').addTo(map)

// Create initial layer control
//var layerControl = L.control.layers(baseMaps, {"Nesta ASHP Suitability": layers.get('ASHP_N_avg_score_weighted')}).addTo(map);

// Create initial opacity control
var opacityControl = L.control.opacity({"Nesta ASHP Suitability": layers.get('ASHP_N_avg_score_weighted')}, ).addTo(map);

// NB could make the select values these values?
var control_name_mapping = {
    '0': "Nesta ASHP Suitability", '1': "Standard ASHP Suitability",
    '2': "Nesta GSHP Suitability", '3': "Standard GSHP Suitability",
    '4': "Nesta SGL Suitability", '5': "Standard SGL Suitability",
    '6': "Nesta HN Suitability", '7': "Standard HN Suitability"}

var layerselect = document.getElementById("layer-select");
var currentlayer = layerselect.value
layerselect.addEventListener("change", change_vector_layer);

function change_vector_layer() {
        // first remove current layer
        if (map.hasLayer(layers.get(layer_names[currentlayer]))) {
            map.removeLayer(layers.get(layer_names[currentlayer]))
        }

        // Remove current layer control
        //layerControl.remove();
        // Remove current opacity control
        opacityControl.remove()
        // Remove current legend control
        legend.remove()

        layers.get(layer_names[layerselect.value]).on({click: simplePopUp(layer_names[layerselect.value]),
            mouseover: highlightFeature(layers.get(layer_names[layerselect.value]),
                                                   layer_names[layerselect.value],
                                                   layer_colormaps[layer_names[layerselect.value]]),
            mouseout: resetHighlight(layers.get(layer_names[layerselect.value])),
        });
        
        // add VectorGrid layer to map
        layers.get(layer_names[layerselect.value]).addTo(map);
        
        // Overlays
        var overlayMaps = {
            [control_name_mapping[layerselect.value]]: layers.get(layer_names[layerselect.value]),
        };

        // add layer control
        //layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
        
        //OpacityControl
        opacityControl = L.control.opacity(overlayMaps, ).addTo(map);

        // legend
        legend = L.control({position: 'bottomright'});

        legend.onAdd = create_colormap_legend(layer_colormaps[layer_names[layerselect.value]])

        legend.addTo(map);

        currentlayer = layerselect.value;

    }

const layername_to_tech = {
    'ASHP_N_avg_score_weighted': 'Air Source Heat Pump', 'ASHP_S_avg_score_weighted': 'Air Source Heat Pump',
    'GSHP_N_avg_score_weighted': 'Ground Source Heat Pump', 'GSHP_S_avg_score_weighted': 'Ground Source Heat Pump', 
    'SGL_N_avg_score_weighted': 'Shared Ground Loop', 'SGL_S_avg_score_weighted': 'Shared Ground Loop', 
    'HN_N_avg_score_weighted': 'Heat Network', 'HN_S_avg_score_weighted': 'Heat Network'
}

const layername_to_source = {
    'ASHP_N_avg_score_weighted': 'Nesta', 'ASHP_S_avg_score_weighted': 'Conventional',
    'GSHP_N_avg_score_weighted': 'Nesta', 'GSHP_S_avg_score_weighted': 'Conventional', 
    'SGL_N_avg_score_weighted': 'Nesta', 'SGL_S_avg_score_weighted': 'Conventional', 
    'HN_N_avg_score_weighted': 'Nesta', 'HN_S_avg_score_weighted': 'Conventional'
}

const geography_name = {'England': 'an LSOA', 'Wales': 'an LSOA', 'Scotland': 'a DataZone'}

function pop_up_content(layername, suitability, context){
    let pop_up_string = `\
    <p>The ${layername_to_source[layername]} <b>${layername_to_tech[layername]}</b> Suitability Score for ${context['area_name']} is: <b>${suitability}</b>.</p>
    <p>This area is ${geography_name[context['country']]} in ${context['la_name']}, ${context['country']}. It belongs to the \
    ${context['uk_pc_name']} UK Parliamentary Constituency.</p>
    `
    return pop_up_string
}

// curried function to enable parameters
function simplePopUp(layername) {
        return function curried_simplePopUp(event) {

            fetch(`http://127.0.0.1:8000/areas/${event.layer.properties['area_code']}`)
                 .then(function(response) {
                    return response.json()
                })
                 .then(function(responseData) {
                    L.popup()
                    .setContent(pop_up_content(layername, event.layer.properties[layername], responseData))
                    .setLatLng(event.latlng)
                    .openOn(map);
                })
        }}

function highlightFeature(layer, layername, colormap){
    return function curried_highlightFeature(event) {
    if (event.target._map._zoom > 10){
    layer.setFeatureStyle(event.layer.properties.area_code,
        {
            fill: true,
            fillColor: getCmapColor(event.layer.properties[layername], colormap),
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

L.controlCredits({
    imageurl: './Leaflet-Control-Credits/Nesta_Logo_Blue_RGB.png',
    imagealt: 'Nesta logo',
    tooltip: 'Made by Nesta',
    width: '88px',
    height: '42px',
    expandcontent: '<a href="#" id="show-info">See information<br/>about the map.</a><br/>',
}).addTo(map);

var converter = new showdown.Converter()

$('#show-info').on('click', function(e) {
    let options = {size: [ 300, 300 ],
        minSize: [ 100, 100 ],
        maxSize: [ 350, 350 ],
        anchor: [ 250, 250 ],
        position: "topleft",
        initOpen: true}
    
    const fileUrl = './dialog_box.md'

    fetch(fileUrl)
        .then( r => r.text() )
        .then( t => L.control.dialog(options)
        .setContent(converter.makeHtml(t))
        .addTo(map))

});

var arrayRange = (start, stop, step) =>
    Array.from(
    { length: (stop - start) / step + 1 },
    (value, index) => start + index * step
    );

var legend = L.control({position: 'bottomright'});

legend.onAdd = create_colormap_legend(layer_colormaps[layer_names[0]])

function create_colormap_legend(colormap){
    return function curried_onAdd (map) {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = arrayRange(1, 0, -0.01);
        
        div.innerHTML += "<h4>Suitability<br><br><br><br><br><br><br>Score<h4><br><br>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (let value of grades) {
            if (value === 0) {
                div.innerHTML += '<i style="background:' + getCmapColor(value, colormap) + '"></i> 0 <br>'
            } else if (value === 1) {
                div.innerHTML += '<i style="background:' + getCmapColor(value, colormap) + '"></i> 1 <br>'
            } else {
                div.innerHTML += '<i style="background:' + getCmapColor(value, colormap) + '"></i><br>'
        }
    }
    return div;
}
}

legend.addTo(map);