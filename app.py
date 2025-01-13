from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import folium
from folium.plugins import VectorGridProtobuf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/tiles", StaticFiles(directory="tiles"), name="tiles")

def create_map():
    """Create and return the Folium map"""
    m = folium.Map(
        location=[53, -1.9],
        zoom_start=7,
        min_zoom=6,
        max_zoom=15,
        tiles='cartodbpositron',
        attr='(C) OpenStreetMap contributors (C) CARTO'
    )

    url = "http://localhost:8000/tiles/{z}/{x}/{y}.pbf"

    # Matching documentation format exactly
    options = {
        "vectorTileLayerStyles": {
            "hsp_lsoas": {
                "fill": True,
                "weight": 1,
                "fillColor": "green",
                "color": "black",
                "fillOpacity": 0.6,
                "opacity": 0.6
            }
        }
    }

    # Add vector layer
    vector_layer = VectorGridProtobuf(
        url=url,
        name="ASHP Suitability",
        options=options
    ).add_to(m)

    # Add layer control
    folium.LayerControl().add_to(m)

    return m

@app.get("/")
async def get_map():
    """Serve the map page"""
    m = create_map()
    return HTMLResponse(m.get_root().render())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)