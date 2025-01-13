#! /bin/sh

tippecanoe -z8 -Z0 --no-tile-compression -l hps_lsoas --output-to-directory="tiles" --detect-shared-borders --reorder --hilbert -f "geojson/most_generalised_lsoas.geojson"
echo "Most generalised tiles generated!"

tippecanoe -z12 -Z9 --no-tile-compression -l hps_lsoas --output-to-directory="tiles" --detect-shared-borders --reorder --hilbert -F "geojson/generalised_lsoas.geojson"
echo "Generalised tiles generated!"

tippecanoe -z15 -Z13 --no-tile-compression -l hps_lsoas --output-to-directory="tiles" --detect-shared-borders --reorder --hilbert -F "geojson/detailed_lsoas.geojson"
echo "Detailed tiles generated!"