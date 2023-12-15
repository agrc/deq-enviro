"""
Download server.
"""
from flask import Flask, request
from .agol import download, cleanup
from . import bucket
from dotenv import load_dotenv

from flask_cors import CORS
from flask_json import FlaskJSON

load_dotenv()

formats = [
    "csv",
    "excel",
    "filegdb",
    "geojson",
    "shapefile",
]

# pylint: disable=C0103
app = Flask(__name__)
FlaskJSON(app)
CORS(app)


@app.post("/generate")
def generate():
    """
    Main entry point for the server.
    """
    layers = request.json["layers"]
    format = request.json["format"]

    if format not in formats:
        return {"success": False, "error": f"invalid format value: {format}"}, 400

    try:
        output_path = download(layers, format)

        id = bucket.upload(output_path)
    finally:
        cleanup()

    return {"id": id, "success": True}


@app.get("/download/<id>/data.zip")
def get_file(id):
    """
    Download a file.
    """
    stream = bucket.download(id)

    return stream, 200, {"Content-Type": "application/zip"}
