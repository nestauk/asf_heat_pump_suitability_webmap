# asf_heat_pump_suitability_webmap

Code for the [Heat Pump Suitability project](https://www.nesta.org.uk/project/mapping-heat-pump-suitability-across-great-britain/) web map. See also: the [main heat pump suitability project repo](https://github.com/nestauk/asf_heat_pump_suitability).

## Runtime

We're using [Deno](https://deno.com/).

To create a server instance in the terminal, use: `deno run --allow-net --allow-read --watch server.ts`

## Mapping

Mapping uses the [Leaflet](https://leafletjs.com/) javascript library.

## Tiles

To create the tiles displayed on the map, we've used [tippecanoe](https://github.com/mapbox/tippecanoe).

