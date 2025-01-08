# asf_heat_pump_suitability_webmap

Code for the [Heat Pump Suitability project](https://www.nesta.org.uk/project/mapping-heat-pump-suitability-across-great-britain/) web map. See also: the [main heat pump suitability project repo](https://github.com/nestauk/asf_heat_pump_suitability).

## Runtime

We're using [Deno](https://deno.com/).

To create a server instance in the terminal, use: `deno run --allow-net --allow-read --watch server.ts`

## Mapping

Mapping uses the [Leaflet](https://leafletjs.com/) javascript library.

## Tiles

To create the tiles displayed on the map, we've used [tippecanoe](https://github.com/mapbox/tippecanoe).

## Setting up an EC2 ubuntu instance
We're hosting this map on an AWS EC2 linux (ubuntu) instance, once you've created and connected to the instance, you can set it up in the following way: 

1. We want to use `tippecanoe` to create tiles on the EC2 instance. We need to build it from source, so we'll add the necessary libraries to do so, run:
```{shell}
sudo apt update
sudo apt install build-essential libsqlite3-dev zlib1g-dev
```
Then, figure out which version of g++ has been installed (mine was 13) and export that to the CXX argument:
```{shell}
g++ --version

export CXX=g++-13
```
Without this, tippecanoe will default to looking for g++-5, which you likely don't have and it will error out when building.

Now, clone the tippecanoe repo and follow the [install instructions](https://github.com/mapbox/tippecanoe?tab=readme-ov-file#installation).

2. Clone this repo [asf_heat_pump_suitability_webmap](https://github.com/nestauk/asf_heat_pump_suitability_webmap) and [install deno](https://docs.deno.com/runtime/getting_started/installation/).

3. Create a `geojson` folder, a `scripts` folder, and inside the `asf_heat_pump_suitability_webmap` folder, a `tiles` folder.

4. In the `scripts` folder create a shell script to run tippecanoe from:
```{shell}
touch run_tippecanoe.sh
chmod +x ./run_tippecanoe.sh
```
Then the script should look something like:
```{shell}
#! /bin/bash

tippecanoe -z8 -Z0 --no-tile-compression -l hps_lsoas --output-to-directory="../asf_heat_pump_suitability_webmap/tiles" --detect-shared-borders --reorder --hilbert -f "../geojson/most_generalised_lsoas.geojson"
echo "Most generalised tiles generated!"

tippecanoe -z12 -Z9 --no-tile-compression -l hps_lsoas --output-to-directory="../asf_heat_pump_suitability_webmap/tiles" --detect-shared-borders --reorder --hilbert -F "../geojson/generalised_lsoas.geojson"
echo "Generalised tiles generated!"

tippecanoe -z15 -Z13 --no-tile-compression -l hps_lsoas --output-to-directory="../asf_heat_pump_suitability_webmap/tiles" --detect-shared-borders --reorder --hilbert -F "../geojson/detailed_lsoas.geojson"
echo "Detailed tiles generated!"
```
5. Generate and upload the relevant geojsons to the EC2 instance.
I didn't want to create a python development environment on this EC2, so this anticipates you can access the relevant bits of [asf_heat_pump_suitability](https://github.com/nestauk/asf_heat_pump_suitability).

Create the relevant geojsons according to the level of generalisation and name as in the script above.

6. Run the tippecanoe script, check that the tiles folder has been populated with tile files.

7. Launch deno server - `deno run --allow-net --allow-read server.ts`  
NB you may want to add a specific port to the deno server call in server.ts, such as `{ port: 8501 }`  
NB You can add the `--watch` flag if you want to watch for changes and see them updated in the map output without needing to relaunch the server.

8. Provided you have set the relevant security settings for inbound requests on your EC2 instance, it should now just be a case of going to: `ec2_ip_address:port` to see the web map.
