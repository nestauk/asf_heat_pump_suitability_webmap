# Air Source Heat Pump Suitability Webmap

Code for the [Heat Pump Suitability project](https://www.nesta.org.uk/project/mapping-heat-pump-suitability-across-great-britain/) web map. See also: the [main heat pump suitability project repo](https://github.com/nestauk/asf_heat_pump_suitability).

## Setup

The project is written in Python, using the [uv package manager](https://docs.astral.sh/uv/) to manage project requirements and dependencies. To setup on your system, install uv and then simply run `uv sync` to setup your virtual environment and install all dependencies on the correct version of Python.

[Folium](https://python-visualization.github.io/folium/latest/) is used to create leaflet.js maps from within Python.
[FastAPI](https://fastapi.tiangolo.com/) is used to deploy the webapp.

## Running the Application

Currently only setup to run locally, you can startup the FastAPI server:

```bash
uv run app.py
```

The application will be available at `http://localhost:8000`.

## Project Structure

```
.
├── app.py              # Main FastAPI application
├── pyproject.toml      # Project dependencies and metadata
├── scripts/            # Scripts to help generate necessary data
├── tiles/              # Vector tiles directory (not tracked in git)
└── geojson/            # GeoJSON data directory (not tracked in git)
```

## Tiles

To create the tiles displayed on the map, we've used [tippecanoe](https://github.com/mapbox/tippecanoe). You will need to recreate the tiles in `tiles/` in order to locally test. Install `tippecanoe` on your system. Ensure the following files are in the `geojson/` directory:

- `geojson/most_generalised_lsoas.geojson`
- `geojson/generalised_lsoas.geojson`
- `geojson/detailed_lsoas.geojson`

Then, from the main directory, run the `tippecanoe` scripts to generate tiles.

```bash
sh run_tippecanoe.sh
```